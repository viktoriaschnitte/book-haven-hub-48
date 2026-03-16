import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Settings {
  rating_system: "stars" | "points";
  primary_color: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: Settings = {
  rating_system: "stars",
  primary_color: "24 70% 45%",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
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
          setSettings({
            rating_system: data.rating_system as "stars" | "points",
            primary_color: data.primary_color,
          });
        }
        setLoading(false);
      });
  }, [user]);

  // Apply primary color as CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", settings.primary_color);
  }, [settings.primary_color]);

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
