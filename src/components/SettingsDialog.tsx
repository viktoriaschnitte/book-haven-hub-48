import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/hooks/useSettings";

const COLOR_PRESETS = [
  { label: "Bernstein", value: "24 70% 45%" },
  { label: "Waldgrün", value: "152 55% 35%" },
  { label: "Ozeanblau", value: "210 70% 45%" },
  { label: "Rubin", value: "350 65% 45%" },
  { label: "Violett", value: "270 60% 50%" },
  { label: "Schiefer", value: "215 25% 35%" },
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
          <div className="space-y-3">
            <Label className="text-base font-medium">Bewertungssystem</Label>
            <RadioGroup
              value={settings.rating_system}
              onValueChange={(v) => updateSettings({ rating_system: v as "stars" | "points" })}
              className="flex gap-4"
            >
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 flex-1 hover:bg-accent/50 transition-colors data-[state=checked]:border-primary">
                <RadioGroupItem value="stars" />
                <span className="text-sm font-medium">⭐ 1-5 Sterne</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 flex-1 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="points" />
                <span className="text-sm font-medium">🔢 1-10 Punkte</span>
              </label>
            </RadioGroup>
          </div>

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
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${color.value})` }} />
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
