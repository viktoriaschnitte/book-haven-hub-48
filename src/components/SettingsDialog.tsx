import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/useSettings";
import { Moon, Sun } from "lucide-react";
import { GenreManager } from "./GenreManager";

const COLOR_PRESETS = [
  { label: "Bernstein", value: "24 70% 45%" },
  { label: "Waldgrün", value: "152 55% 35%" },
  { label: "Ozeanblau", value: "210 70% 45%" },
  { label: "Rubin", value: "350 65% 45%" },
  { label: "Violett", value: "270 60% 50%" },
  { label: "Schiefer", value: "215 25% 35%" },
  { label: "Koralle", value: "16 85% 55%" },
  { label: "Smaragd", value: "160 84% 39%" },
  { label: "Saphir", value: "230 70% 50%" },
  { label: "Magenta", value: "330 80% 50%" },
  { label: "Gold", value: "45 93% 47%" },
  { label: "Türkis", value: "175 70% 40%" },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Einstellungen</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Dark Mode */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {settings.dark_mode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              <div>
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Dunkles Erscheinungsbild</p>
              </div>
            </div>
            <Switch
              checked={settings.dark_mode}
              onCheckedChange={(v) => updateSettings({ dark_mode: v })}
            />
          </div>

          {/* Rating system */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Bewertungssystem</Label>
            <RadioGroup
              value={settings.rating_system}
              onValueChange={(v) => updateSettings({ rating_system: v as "stars" | "points" })}
              className="flex gap-4"
            >
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 flex-1 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="stars" />
                <span className="text-sm font-medium">⭐ 1-5 Sterne</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 flex-1 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="points" />
                <span className="text-sm font-medium">🔢 1-10 Punkte</span>
              </label>
            </RadioGroup>
          </div>

          {/* Color scheme */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Farbschema</Label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings({ primary_color: color.value })}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all hover:bg-accent/50 ${
                    settings.primary_color === color.value ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                >
                  <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: `hsl(${color.value})` }} />
                  {color.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
