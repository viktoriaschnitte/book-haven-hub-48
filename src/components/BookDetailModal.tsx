import { useState } from "react";
import { Book, useBooks } from "@/hooks/useBooks";
import { RatingDisplay } from "./RatingDisplay";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Library } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function CoverImage({ url, title }: { url: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="mx-auto w-48 aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-md">
      {url && !failed ? (
        <img src={url} alt={title} onError={() => setFailed(true)} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-accent">
          <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}

interface BookDetailModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (book: Book) => void;
}

export function BookDetailModal({ book, open, onOpenChange, onNavigate }: BookDetailModalProps) {
  const { books } = useBooks();

  if (!book) return null;

  const seriesBooks = book.series_name
    ? books
        .filter((b) => b.series_name === book.series_name && b.id !== book.id)
        .sort((a, b) => (a.series_number ?? 0) - (b.series_number ?? 0))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{book.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <CoverImage url={book.cover_url} title={book.title} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">von <span className="font-medium text-foreground">{book.author}</span></p>
              <RatingDisplay rating={book.rating} size="md" />
            </div>

            <div className="flex flex-wrap gap-2">
              {book.genre && <Badge variant="secondary">{book.genre}</Badge>}
              {book.page_count && <Badge variant="outline">{book.page_count} Seiten</Badge>}
              {book.series_name && (
                <Badge variant="outline" className="gap-1">
                  <Library className="h-3 w-3" />
                  {book.series_name}{book.series_number ? ` – Band ${book.series_number}` : ""}
                </Badge>
              )}
            </div>

            {book.notes && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Notizen</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{book.notes}</p>
              </div>
            )}

            {/* Series links */}
            {seriesBooks.length > 0 && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Library className="h-4 w-4 text-primary" />
                  Weitere Bücher in „{book.series_name}"
                </p>
                <div className="space-y-1">
                  {seriesBooks.map((sb) => (
                    <button
                      key={sb.id}
                      onClick={() => onNavigate?.(sb)}
                      className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between"
                    >
                      <span>
                        {sb.series_number ? `Band ${sb.series_number}: ` : ""}{sb.title}
                      </span>
                      <span className="text-xs text-muted-foreground">{sb.author}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
