import { useState } from "react";
import { useGenres } from "@/hooks/useGenres";
import { useBooks } from "@/hooks/useBooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Check, X, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function GenreManager() {
  const { genres, addGenre, updateGenre, deleteGenre } = useGenres();
  const { books, updateBook } = useBooks();
  const [newGenre, setNewGenre] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const booksWithGenre = (name: string) => books.filter((b) => b.genre === name);

  const handleAdd = () => {
    const trimmed = newGenre.trim();
    if (!trimmed) return;
    if (genres.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Genre existiert bereits");
      return;
    }
    addGenre.mutate(trimmed);
    setNewGenre("");
  };

  const handleSaveEdit = () => {
    const trimmed = editingName.trim();
    if (!trimmed || !editingId) return;
    const oldGenre = genres.find((g) => g.id === editingId);
    if (oldGenre) {
      updateGenre.mutate({ id: editingId, name: trimmed });
      // Update books that had the old genre name
      books
        .filter((b) => b.genre === oldGenre.name)
        .forEach((b) => updateBook.mutate({ id: b.id, genre: trimmed }));
    }
    setEditingId(null);
    setEditingName("");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    // Clear genre from affected books
    booksWithGenre(deleteTarget.name).forEach((b) =>
      updateBook.mutate({ id: b.id, genre: null })
    );
    deleteGenre.mutate(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Genre gelöscht");
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Genres verwalten</Label>
      <div className="flex gap-2">
        <Input
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
          placeholder="Neues Genre..."
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
        />
        <Button type="button" size="sm" onClick={handleAdd} disabled={!newGenre.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto subtle-scrollbar">
        {genres.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">Noch keine Genres definiert.</p>
        )}
        {genres.map((g) => {
          const count = booksWithGenre(g.name).length;
          return (
            <div key={g.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
              {editingId === g.id ? (
                <>
                  <Input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-7 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSaveEdit}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1">{g.name}</span>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground">{count} {count === 1 ? "Buch" : "Bücher"}</span>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => { setEditingId(g.id); setEditingName(g.name); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 hover:text-destructive"
                    onClick={() => setDeleteTarget({ id: g.id, name: g.name })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Genre löschen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && booksWithGenre(deleteTarget.name).length > 0
                ? `Das Genre "${deleteTarget.name}" ist ${booksWithGenre(deleteTarget.name).length} ${booksWithGenre(deleteTarget.name).length === 1 ? "Buch" : "Büchern"} zugeordnet. Diese Bücher werden als "Nicht zugewiesen" markiert.`
                : `Möchtest du das Genre "${deleteTarget?.name}" wirklich löschen?`}
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
