import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, SortOrder } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Moon, Sun, Trash2, AlertTriangle, ArrowUpDown } from "lucide-react";
import { GenreManager } from "./GenreManager";
import { TropeManager } from "./TropeManager";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
  const { user, signOut } = useAuth();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete all user data in order
      const tables = ["book_list_assignments", "books", "lists", "user_genres", "user_tropes", "user_settings", "profiles"] as const;
      for (const table of tables) {
        await supabase.from(table).delete().eq("user_id", user.id);
      }
      await signOut();
      toast.success("Konto und alle Daten wurden gelöscht.");
    } catch {
      toast.error("Fehler beim Löschen des Kontos.");
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto subtle-scrollbar p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-display">Einstellungen</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          {/* Dark Mode */}
          <div className="flex items-center justify-between rounded-lg border p-5">
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
          <div className="space-y-4 rounded-lg border p-5">
            <Label className="text-base font-medium">Bewertungssystem</Label>
            <RadioGroup
              value={settings.rating_system}
              onValueChange={(v) => updateSettings({ rating_system: v as "stars" | "points" })}
              className="flex gap-3"
            >
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-4 flex-1 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="stars" />
                <span className="text-sm font-medium">⭐ 1-5 Sterne</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-4 flex-1 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="points" />
                <span className="text-sm font-medium">🔢 1-10 Punkte</span>
              </label>
            </RadioGroup>
          </div>

          {/* Genre management */}
          <div className="rounded-lg border p-5">
            <GenreManager />
          </div>

          {/* Trope management */}
          <div className="rounded-lg border p-5">
            <TropeManager />
          </div>

          {/* Color scheme */}
          <div className="space-y-4 rounded-lg border p-5">
            <Label className="text-base font-medium">Farbschema</Label>
            <div className="grid grid-cols-3 gap-3">
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

          {/* Delete account */}
          <div className="rounded-lg border p-5">
            <p className="text-xs text-muted-foreground mb-3">Dein Konto und alle zugehörigen Daten werden unwiderruflich gelöscht.</p>
            <Button variant="destructive" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Konto löschen
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Konto wirklich löschen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Alle deine Bücher, Listen, Genres, Tropes und Einstellungen werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Wird gelöscht..." : "Endgültig löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
