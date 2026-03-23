import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Settings {
  rating_system: "stars" | "points";
  primary_color: string;
  dark_mode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: Settings = {
  rating_system: "stars",
  primary_color: "24 70% 45%",
  dark_mode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("app_dark_mode");
    return { ...defaultSettings, dark_mode: saved === "true" };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const savedDark = localStorage.getItem("app_dark_mode");
          setSettings({
            rating_system: data.rating_system as "stars" | "points",
            primary_color: data.primary_color,
            dark_mode: savedDark !== null ? savedDark === "true" : false,
          });
        }
        setLoading(false);
      });
  }, [user]);

  // Apply primary color as CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", settings.primary_color);
    // Also update ring color to match
    document.documentElement.style.setProperty("--ring", settings.primary_color);
  }, [settings.primary_color]);

  // Apply dark mode
  useEffect(() => {
    if (settings.dark_mode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("app_dark_mode", String(settings.dark_mode));
  }, [settings.dark_mode]);

  const updateSettings = useCallback(async (s: Partial<Settings>) => {
    const next = { ...settings, ...s };
    setSettings(next);
    if (user) {
      await supabase
        .from("user_settings")
        .update({ rating_system: next.rating_system, primary_color: next.primary_color })
        .eq("user_id", user.id);
    }
  }, [settings, user]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
