import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBooks, Book } from "@/hooks/useBooks";
import { useLists } from "@/hooks/useLists";
import { useSettings } from "@/hooks/useSettings";
import { useTropes } from "@/hooks/useTropes";
import { BookCard } from "@/components/BookCard";
import { BookFormDialog } from "@/components/BookFormDialog";
import { BookDetailModal } from "@/components/BookDetailModal";
import { ListAssignDialog } from "@/components/ListAssignDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { CreateListDialog } from "@/components/CreateListDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  BookOpen, Plus, Search, Grid3X3, List, Settings, LogOut, Trash2, Check, ChevronsUpDown, X,
} from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { books, addBook, updateBook, deleteBook } = useBooks();
  const { lists, assignments, createList, deleteList, assignBook, unassignBook } = useLists();
  const { settings } = useSettings();
  const { tropes } = useTropes();
  const isStars = settings.rating_system === "stars";
  const maxRating = isStars ? 5 : 10;

  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterList, setFilterList] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [filterTropes, setFilterTropes] = useState<string[]>([]);
  const [tropePopoverOpen, setTropePopoverOpen] = useState(false);

  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [listAssignBook, setListAssignBook] = useState<Book | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createListOpen, setCreateListOpen] = useState(false);

  const genres = useMemo(() => {
    const g = new Set(books.map((b) => b.genre).filter(Boolean) as string[]);
    return Array.from(g).sort();
  }, [books]);

  const filtered = useMemo(() => {
    let result = books;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    if (filterGenre !== "all") {
      result = result.filter((b) => b.genre === filterGenre);
    }
    if (filterList !== "all") {
      const bookIds = assignments.filter((a) => a.list_id === filterList).map((a) => a.book_id);
      result = result.filter((b) => bookIds.includes(b.id));
    }
    if (filterRating !== "all") {
      const target = parseInt(filterRating);
      if (isStars) {
        // Stars: rating is stored 1-10, star value = ceil(rating/2)
        const low = (target - 1) * 2 + 1;
        const high = target * 2;
        result = result.filter((b) => {
          const r = b.rating ?? 0;
          return r >= low && r <= high;
        });
      } else {
        result = result.filter((b) => (b.rating ?? 0) === target);
      }
    }
    if (filterTropes.length > 0) {
      result = result.filter((b) => filterTropes.every((t) => b.tropes?.includes(t)));
    }
    return result;
  }, [books, search, filterGenre, filterList, filterRating, filterTropes, assignments]);

  const handleBookSubmit = (book: Parameters<typeof addBook.mutate>[0] & { listIds: string[] }) => {
    const { listIds, ...bookData } = book;
    const syncLists = (bookId: string) => {
      const current = assignments.filter((a) => a.book_id === bookId).map((a) => a.list_id);
      listIds.filter((id) => !current.includes(id)).forEach((listId) => assignBook.mutate({ bookId, listId }));
      current.filter((id) => !listIds.includes(id)).forEach((listId) => unassignBook.mutate({ bookId, listId }));
    };
    if (editingBook) {
      updateBook.mutate({ id: editingBook.id, ...bookData });
      syncLists(editingBook.id);
    } else {
      addBook.mutate(bookData as any, {
        onSuccess: (newBook: any) => {
          if (newBook?.id) syncLists(newBook.id);
        },
      });
    }
    setEditingBook(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="font-display text-xl font-bold">BookShelf</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Bücher durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Genre" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Genres</SelectItem>
                {genres.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterList} onValueChange={setFilterList}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Liste" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Listen</SelectItem>
                {lists.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Bewertung" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                {Array.from({ length: maxRating }, (_, i) => {
                  const val = i + 1;
                  const label = isStars
                    ? "★".repeat(val) + "☆".repeat(maxRating - val)
                    : `${val} / ${maxRating}`;
                  return <SelectItem key={val} value={String(val)}>{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            {tropes.length > 0 && (
              <Popover open={tropePopoverOpen} onOpenChange={setTropePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-between h-9 px-3 text-sm font-normal">
                    {filterTropes.length === 0
                      ? "Tropes"
                      : `${filterTropes.length} Trope${filterTropes.length > 1 ? "s" : ""}`}
                    <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Trope suchen..." />
                    <CommandList>
                      <CommandEmpty>Kein Trope gefunden.</CommandEmpty>
                      <CommandGroup>
                        {tropes.map((t) => {
                          const selected = filterTropes.includes(t.name);
                          return (
                            <CommandItem
                              key={t.id}
                              onSelect={() => {
                                setFilterTropes((prev) =>
                                  selected ? prev.filter((n) => n !== t.name) : [...prev, t.name]
                                );
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selected ? "opacity-100" : "opacity-0"}`} />
                              {t.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  {filterTropes.length > 0 && (
                    <div className="border-t p-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setFilterTropes([])}>
                        <X className="mr-1 h-3 w-3" /> Filter zurücksetzen
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
            <div className="flex rounded-lg border bg-card">
              <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView("grid")}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lists section */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-muted-foreground shrink-0">Listen:</span>
          {lists.map((l) => (
            <div key={l.id} className="flex items-center gap-1">
              <button
                onClick={() => setFilterList(filterList === l.id ? "all" : l.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  filterList === l.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {l.name}
              </button>
              {!l.is_default && (
                <button onClick={() => deleteList.mutate(l.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setCreateListOpen(true)}>
            <Plus className="mr-1 h-3 w-3" /> Neue Liste
          </Button>
        </div>

        {/* Books */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="font-display text-xl font-semibold text-muted-foreground">Keine Bücher gefunden</h2>
            <p className="text-sm text-muted-foreground mt-1">Füge dein erstes Buch hinzu!</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} view="grid" onEdit={(b) => { setEditingBook(b); setBookFormOpen(true); }} onDelete={(id) => deleteBook.mutate(id)} onManageLists={setListAssignBook} onViewDetail={setDetailBook} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} view="list" onEdit={(b) => { setEditingBook(b); setBookFormOpen(true); }} onDelete={(id) => deleteBook.mutate(id)} onManageLists={setListAssignBook} onViewDetail={setDetailBook} />
            ))}
          </div>
        )}

        {/* FAB */}
        <Button
          onClick={() => { setEditingBook(null); setBookFormOpen(true); }}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </main>

      <BookFormDialog open={bookFormOpen} onOpenChange={setBookFormOpen} onSubmit={handleBookSubmit} editBook={editingBook} />
      <BookDetailModal book={detailBook} open={!!detailBook} onOpenChange={(o) => !o && setDetailBook(null)} onNavigate={setDetailBook} />
      <ListAssignDialog open={!!listAssignBook} onOpenChange={(o) => !o && setListAssignBook(null)} book={listAssignBook} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <CreateListDialog open={createListOpen} onOpenChange={setCreateListOpen} onSubmit={(name) => createList.mutate(name)} />
    </div>
  );
}
