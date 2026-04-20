import { useState } from "react";
import { Book } from "@/hooks/useBooks";
import { RatingDisplay } from "./RatingDisplay";
import { BookOpen, Edit, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function BookCover({ url, title, className }: { url: string | null; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-accent ${className ?? ""}`}>
        <BookOpen className="h-1/3 w-1/3 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={title}
      onError={() => setFailed(true)}
      loading="lazy"
      className={`h-full w-full object-cover ${className ?? ""}`}
    />
  );
}

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onManageLists?: (book: Book) => void;
  onViewDetail: (book: Book) => void;
  view: "grid" | "list";
  showSeries?: boolean;
}

export function BookCard({ book, onEdit, onDelete, onViewDetail, view, showSeries }: BookCardProps) {
  if (view === "list") {
    return (
      <div className="flex items-center gap-4 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 animate-fade-in">
        <button onClick={() => onViewDetail(book)} className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-sm bg-muted cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
          <BookCover url={book.cover_url} title={book.title} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold truncate">{book.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{book.author}</p>
        </div>
        {book.genre && <span className="hidden sm:inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{book.genre}</span>}
        <RatingDisplay rating={book.rating} size="sm" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(book)}><Edit className="mr-2 h-4 w-4" /> Bearbeiten</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(book.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Löschen</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card book-shadow hover:book-shadow-hover transition-all duration-300 animate-fade-in">
      <button onClick={() => onViewDetail(book)} className="relative aspect-[2/3] w-full overflow-hidden bg-muted cursor-pointer block">
        <BookCover url={book.cover_url} title={book.title} className="transition-transform duration-300 group-hover:scale-105" />
        {showSeries && book.series_name && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 text-left">
            <p className="text-[10px] font-medium text-white/95 truncate leading-tight">{book.series_name}</p>
            {book.series_number != null && (
              <p className="text-[10px] text-white/75 leading-tight">Band {book.series_number}</p>
            )}
          </div>
        )}
      </button>
      <div className="p-3 space-y-1.5">
        <h3 className="font-display font-semibold text-sm leading-tight truncate">{book.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        <div className="flex items-center justify-between">
          <RatingDisplay rating={book.rating} size="sm" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(book)}><Edit className="mr-2 h-4 w-4" /> Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(book.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Löschen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
