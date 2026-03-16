import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useLists } from "@/hooks/useLists";
import { Book } from "@/hooks/useBooks";

interface ListAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
}

export function ListAssignDialog({ open, onOpenChange, book }: ListAssignDialogProps) {
  const { lists, assignments, assignBook, unassignBook } = useLists();

  if (!book) return null;

  const bookListIds = assignments.filter((a) => a.book_id === book.id).map((a) => a.list_id);

  const toggle = (listId: string, checked: boolean) => {
    if (checked) {
      assignBook.mutate({ bookId: book.id, listId });
    } else {
      unassignBook.mutate({ bookId: book.id, listId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Listen für „{book.title}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {lists.map((list) => (
            <label key={list.id} className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-accent/50 transition-colors">
              <Checkbox
                checked={bookListIds.includes(list.id)}
                onCheckedChange={(checked) => toggle(list.id, !!checked)}
              />
              <span className="text-sm font-medium">{list.name}</span>
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
