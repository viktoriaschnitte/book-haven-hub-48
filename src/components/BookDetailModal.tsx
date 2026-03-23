import { Book } from "@/hooks/useBooks";
import { RatingDisplay } from "./RatingDisplay";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BookDetailModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDetailModal({ book, open, onOpenChange }: BookDetailModalProps) {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{book.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Cover */}
          <div className="mx-auto w-48 aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-md">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-accent">
                <BookOpen className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">von <span className="font-medium text-foreground">{book.author}</span></p>
              <RatingDisplay rating={book.rating} size="md" />
            </div>

            <div className="flex flex-wrap gap-2">
              {book.genre && <Badge variant="secondary">{book.genre}</Badge>}
              {book.page_count && <Badge variant="outline">{book.page_count} Seiten</Badge>}
            </div>

            {/* Notes */}
            {book.notes && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Notizen</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{book.notes}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
