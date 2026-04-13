import { useState } from "react";
import { useTropes } from "@/hooks/useTropes";
import { useBooks } from "@/hooks/useBooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function TropeManager() {
  const { tropes, addTrope, deleteTrope } = useTropes();
  const { books, updateBook } = useBooks();
  const [newTrope, setNewTrope] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const booksWithTrope = (name: string) =>
    books.filter((b) => (b as any).tropes?.includes(name));

  const handleAdd = () => {
    const trimmed = newTrope.trim();
    if (!trimmed) return;
    if (tropes.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Trope existiert bereits");
      return;
    }
    addTrope.mutate(trimmed);
    setNewTrope("");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    // Remove trope from affected books
    booksWithTrope(deleteTarget.name).forEach((b) => {
      const current: string[] = (b as any).tropes ?? [];
      updateBook.mutate({ id: b.id, tropes: current.filter((t) => t !== deleteTarget.name) } as any);
    });
    deleteTrope.mutate(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Trope gelöscht");
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Tropes verwalten</Label>
      <div className="flex gap-2">
        <Input
          value={newTrope}
          onChange={(e) => setNewTrope(e.target.value)}
          placeholder="Neuer Trope..."
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
        />
        <Button type="button" size="sm" onClick={handleAdd} disabled={!newTrope.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto subtle-scrollbar">
        {tropes.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">Noch keine Tropes definiert.</p>
        )}
        {tropes.map((t) => {
          const count = booksWithTrope(t.name).length;
          return (
            <div key={t.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
              <span className="flex-1">{t.name}</span>
              {count > 0 && (
                <span className="text-xs text-muted-foreground">{count} {count === 1 ? "Buch" : "Bücher"}</span>
              )}
              <Button
                size="icon" variant="ghost" className="h-7 w-7 shrink-0 hover:text-destructive"
                onClick={() => setDeleteTarget({ id: t.id, name: t.name })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Trope löschen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && booksWithTrope(deleteTarget.name).length > 0
                ? `Der Trope "${deleteTarget.name}" ist ${booksWithTrope(deleteTarget.name).length} ${booksWithTrope(deleteTarget.name).length === 1 ? "Buch" : "Büchern"} zugeordnet. Er wird von diesen Büchern entfernt.`
                : `Möchtest du den Trope "${deleteTarget?.name}" wirklich löschen?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
