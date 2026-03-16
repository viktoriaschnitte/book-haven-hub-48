import { Book } from "@/hooks/useBooks";
import { RatingDisplay } from "./RatingDisplay";
import { BookOpen, Edit, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onManageLists: (book: Book) => void;
  view: "grid" | "list";
}

export function BookCard({ book, onEdit, onDelete, onManageLists, view }: BookCardProps) {
  if (view === "list") {
    return (
      <div className="flex items-center gap-4 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 animate-fade-in">
        <div className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center"><BookOpen className="h-5 w-5 text-muted-foreground" /></div>
          )}
        </div>
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
            <DropdownMenuItem onClick={() => onManageLists(book)}>Listen verwalten</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(book.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Löschen</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card book-shadow hover:book-shadow-hover transition-all duration-300 animate-fade-in">
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-accent">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-display font-semibold text-sm leading-tight truncate">{book.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        <div className="flex items-center justify-between">
          <RatingDisplay rating={book.rating} size="sm" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(book)}><Edit className="mr-2 h-4 w-4" /> Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageLists(book)}>Listen verwalten</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(book.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Löschen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
