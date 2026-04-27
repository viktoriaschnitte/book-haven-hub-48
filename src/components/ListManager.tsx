import { useMemo, useState } from "react";
import { useBooks } from "@/hooks/useBooks";
import { useLists } from "@/hooks/useLists";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function ListManager() {
  const { books } = useBooks();
  const { lists, assignments, createList, deleteList } = useLists();
  const [newList, setNewList] = useState("");

  const bookIds = useMemo(() => new Set(books.map((book) => book.id)), [books]);
  const countsByListId = useMemo(() => {
    return lists.reduce<Record<string, number>>((counts, list) => {
      counts[list.id] = assignments.filter(
        (assignment) => assignment.list_id === list.id && bookIds.has(assignment.book_id)
      ).length;
      return counts;
    }, {});
  }, [assignments, bookIds, lists]);

  const handleAdd = () => {
    const trimmed = newList.trim();
    if (!trimmed) return;
    createList.mutate(trimmed);
    setNewList("");
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Listen verwalten</Label>
      <div className="flex gap-2">
        <Input
          value={newList}
          onChange={(e) => setNewList(e.target.value)}
          placeholder="Neue Liste..."
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
        />
        <Button type="button" size="sm" onClick={handleAdd} disabled={!newList.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto subtle-scrollbar">
        {lists.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">Noch keine Listen vorhanden.</p>
        )}
        {lists.map((list) => (
          <div key={list.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
            <span className="flex-1">{list.name}</span>
            <Badge variant="secondary" className="min-w-7 justify-center rounded-full px-2">
              {countsByListId[list.id] ?? 0}
            </Badge>
            {!list.is_default && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 hover:text-destructive"
                onClick={() => deleteList.mutate(list.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}