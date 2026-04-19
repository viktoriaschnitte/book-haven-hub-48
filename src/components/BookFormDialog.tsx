import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RatingDisplay } from "./RatingDisplay";
import { Book, useBooks } from "@/hooks/useBooks";
import { useGenres } from "@/hooks/useGenres";
import { useTropes } from "@/hooks/useTropes";
import { useLists } from "@/hooks/useLists";
import { Save, Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (book: {
    title: string;
    author: string;
    page_count: number | null;
    cover_url: string | null;
    genre: string | null;
    notes: string | null;
    rating: number | null;
    series_name: string | null;
    series_number: number | null;
    tropes: string[];
    listIds: string[];
  }) => void;
  editBook?: Book | null;
}

export function BookFormDialog({ open, onOpenChange, onSubmit, editBook }: BookFormDialogProps) {
  const { genres: userGenres } = useGenres();
  const { tropes: userTropes, addTrope } = useTropes();
  const { lists, assignments } = useLists();
  const { books } = useBooks();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [seriesMode, setSeriesMode] = useState<"none" | "existing" | "new">("none");
  const [seriesName, setSeriesName] = useState("");
  const [seriesNumber, setSeriesNumber] = useState("");
  const [selectedTropes, setSelectedTropes] = useState<string[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [seriesPopoverOpen, setSeriesPopoverOpen] = useState(false);
  const [tropeSearch, setTropeSearch] = useState("");

  const allGenres = useMemo(() => userGenres.map((g) => g.name), [userGenres]);

  const seriesNames = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => { if (b.series_name) set.add(b.series_name); });
    return Array.from(set).sort();
  }, [books]);

  const filteredTropes = useMemo(() => {
    let tropes = tropeSearch 
      ? userTropes.filter((t) => t.name.toLowerCase().includes(tropeSearch.toLowerCase()))
      : userTropes;
    
    // Sort: selected tropes first, then unselected ones
    return tropes.sort((a, b) => {
      const aSelected = selectedTropes.includes(a.name);
      const bSelected = selectedTropes.includes(b.name);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [userTropes, tropeSearch, selectedTropes]);

  useEffect(() => {
    if (editBook) {
      setTitle(editBook.title);
      setAuthor(editBook.author);
      setPageCount(editBook.page_count?.toString() ?? "");
      setCoverUrl(editBook.cover_url ?? "");
      setGenre(editBook.genre ?? "");
      setNotes(editBook.notes ?? "");
      setRating(editBook.rating ?? 0);
      setSeriesNumber(editBook.series_number?.toString() ?? "");
      setSelectedTropes((editBook as any).tropes ?? []);
      const currentLists = assignments.filter((a) => a.book_id === editBook.id).map((a) => a.list_id);
      setSelectedListIds(currentLists);
      if (editBook.series_name) {
        if (seriesNames.includes(editBook.series_name)) {
          setSeriesMode("existing");
          setSeriesName(editBook.series_name);
        } else {
          setSeriesMode("new");
          setSeriesName(editBook.series_name);
        }
      } else {
        setSeriesMode("none");
        setSeriesName("");
      }
    } else {
      setTitle(""); setAuthor(""); setPageCount(""); setCoverUrl("");
      setGenre(""); setNotes(""); setRating(0); setSeriesMode("none");
      setSeriesName(""); setSeriesNumber(""); setSelectedTropes([]);
      setSelectedListIds([]);
      setTropeSearch("");
    }
  }, [editBook, open, assignments]);

  const toggleTrope = (name: string) => {
    setSelectedTropes((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleAddNewTrope = () => {
    const trimmed = tropeSearch.trim();
    if (!trimmed) return;
    const existing = userTropes.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!selectedTropes.includes(existing.name)) {
        setSelectedTropes((prev) => [...prev, existing.name]);
      }
      setTropeSearch("");
      return;
    }
    addTrope.mutate(trimmed, {
      onSuccess: () => {
        setSelectedTropes((prev) => [...prev, trimmed]);
        setTropeSearch("");
        toast.success(`Trope "${trimmed}" erstellt`);
      },
      onError: () => toast.error("Trope konnte nicht erstellt werden"),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSeriesName = seriesMode === "none" ? null : seriesName.trim() || null;
    onSubmit({
      title,
      author,
      page_count: pageCount ? parseInt(pageCount) : null,
      cover_url: coverUrl || null,
      genre: genre && genre !== "none" ? genre : null,
      notes: notes || null,
      rating: rating || null,
      series_name: finalSeriesName,
      series_number: seriesNumber ? parseInt(seriesNumber) : null,
      tropes: selectedTropes,
      listIds: selectedListIds,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto subtle-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-display">{editBook ? "Buch bearbeiten" : "Neues Buch hinzufügen"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="title">Titel *</Label>
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Buchtitel" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="author">Autor</Label>
              <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Autorname" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger><SelectValue placeholder="Genre wählen" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Genre</SelectItem>
                  {allGenres.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Listen</Label>
              {lists.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-32 overflow-y-auto subtle-scrollbar">
                  {lists.map((l) => {
                    const checked = selectedListIds.includes(l.id);
                    return (
                      <button
                        type="button"
                        key={l.id}
                        onClick={() =>
                          setSelectedListIds((prev) =>
                            checked ? prev.filter((id) => id !== l.id) : [...prev, l.id]
                          )
                        }
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                          checked
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-secondary-foreground hover:bg-accent"
                        }`}
                      >
                        {checked && <Check className="h-3 w-3" />}
                        {l.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Noch keine Listen vorhanden.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pages">Seitenzahl</Label>
            <Input id="pages" type="number" value={pageCount} onChange={(e) => setPageCount(e.target.value)} placeholder="320" />
          </div>

          {/* Series */}
          <div className="space-y-2">
            <Label>Buchreihe</Label>
            <Select value={seriesMode} onValueChange={(v) => { setSeriesMode(v as any); if (v === "none") { setSeriesName(""); setSeriesNumber(""); } }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Reihe</SelectItem>
                <SelectItem value="existing">Bestehende Reihe</SelectItem>
                <SelectItem value="new">Neue Reihe</SelectItem>
              </SelectContent>
            </Select>
            {seriesMode === "existing" && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="col-span-2">
                  {seriesNames.length >= 5 ? (
                    <Popover open={seriesPopoverOpen} onOpenChange={setSeriesPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={seriesPopoverOpen}
                          className="w-full justify-between"
                        >
                          {seriesName || "Reihe wählen"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Reihe suchen..." />
                          <CommandList>
                            <CommandEmpty>Keine Reihe gefunden.</CommandEmpty>
                            <CommandGroup>
                              {seriesNames.map((s) => (
                                <CommandItem
                                  key={s}
                                  value={s}
                                  onSelect={(currentValue) => {
                                    setSeriesName(currentValue);
                                    setSeriesPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      seriesName === s ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {s}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Select value={seriesName} onValueChange={setSeriesName}>
                      <SelectTrigger><SelectValue placeholder="Reihe wählen" /></SelectTrigger>
                      <SelectContent>
                        {seriesNames.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Input type="number" min="1" value={seriesNumber} onChange={(e) => setSeriesNumber(e.target.value)} placeholder="Band" />
              </div>
            )}
            {seriesMode === "new" && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="col-span-2">
                  <Input value={seriesName} onChange={(e) => setSeriesName(e.target.value)} placeholder="Name der neuen Reihe" />
                </div>
                <Input type="number" min="1" value={seriesNumber} onChange={(e) => setSeriesNumber(e.target.value)} placeholder="Band" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover-URL</Label>
            <Input id="cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Bewertung</Label>
            <RatingDisplay rating={rating} onChange={setRating} />
          </div>

          {/* Tropes multi-select with inline creation */}
          <div className="space-y-2">
            <Label>Tropes</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Suchen oder neuen Trope eingeben..."
                  value={tropeSearch}
                  onChange={(e) => setTropeSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewTrope();
                    }
                  }}
                />
                {tropeSearch.trim() && !userTropes.some((t) => t.name.toLowerCase() === tropeSearch.trim().toLowerCase()) && (
                  <Button type="button" size="sm" onClick={handleAddNewTrope} disabled={addTrope.isPending}>
                    <Plus className="h-4 w-4 mr-1" /> Neu
                  </Button>
                )}
              </div>
              {userTropes.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-32 overflow-y-auto subtle-scrollbar">
                  {filteredTropes.length > 0 ? (
                    filteredTropes.map((t) => (
                      <label key={t.id} className={`flex items-center gap-1.5 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                        selectedTropes.includes(t.name) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground hover:bg-accent"
                      }`}>
                        <Checkbox
                          checked={selectedTropes.includes(t.name)}
                          onCheckedChange={() => toggleTrope(t.name)}
                          className="hidden"
                        />
                        {t.name}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground w-full text-center py-2">
                      Keine Tropes gefunden – Enter drücken zum Erstellen
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Noch keine Tropes vorhanden. Tippe einen Namen ein und drücke Enter zum Erstellen.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Deine Gedanken zum Buch..." rows={3} />
          </div>
          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" /> {editBook ? "Speichern" : "Hinzufügen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
