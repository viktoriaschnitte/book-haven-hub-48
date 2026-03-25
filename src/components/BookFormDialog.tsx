import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingDisplay } from "./RatingDisplay";
import { Book } from "@/hooks/useBooks";
import { useGenres } from "@/hooks/useGenres";
import { Save, Plus } from "lucide-react";

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
  }) => void;
  editBook?: Book | null;
}


export function BookFormDialog({ open, onOpenChange, onSubmit, editBook }: BookFormDialogProps) {
  const { books } = useBooks();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [seriesName, setSeriesName] = useState("");
  const [seriesNumber, setSeriesNumber] = useState("");
  const [addingGenre, setAddingGenre] = useState(false);
  const [newGenre, setNewGenre] = useState("");

  // Collect all unique genres from existing books + defaults
  const allGenres = useMemo(() => {
    const set = new Set(DEFAULT_GENRES);
    books.forEach((b) => { if (b.genre) set.add(b.genre); });
    return Array.from(set).sort();
  }, [books]);

  // Collect unique series names
  const seriesNames = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => { if (b.series_name) set.add(b.series_name); });
    return Array.from(set).sort();
  }, [books]);

  useEffect(() => {
    if (editBook) {
      setTitle(editBook.title);
      setAuthor(editBook.author);
      setPageCount(editBook.page_count?.toString() ?? "");
      setCoverUrl(editBook.cover_url ?? "");
      setGenre(editBook.genre ?? "");
      setNotes(editBook.notes ?? "");
      setRating(editBook.rating ?? 0);
      setSeriesName(editBook.series_name ?? "");
      setSeriesNumber(editBook.series_number?.toString() ?? "");
    } else {
      setTitle(""); setAuthor(""); setPageCount(""); setCoverUrl("");
      setGenre(""); setNotes(""); setRating(0); setSeriesName(""); setSeriesNumber("");
    }
    setAddingGenre(false);
    setNewGenre("");
  }, [editBook, open]);

  const handleAddGenre = () => {
    if (newGenre.trim()) {
      setGenre(newGenre.trim());
      setAddingGenre(false);
      setNewGenre("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      author,
      page_count: pageCount ? parseInt(pageCount) : null,
      cover_url: coverUrl || null,
      genre: genre && genre !== "none" ? genre : null,
      notes: notes || null,
      rating: rating || null,
      series_name: seriesName && seriesName !== "none" ? seriesName : null,
      series_number: seriesNumber ? parseInt(seriesNumber) : null,
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

          {/* Genre dropdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genre</Label>
              {addingGenre ? (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Neues Genre..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddGenre())}
                  />
                  <Button type="button" size="sm" onClick={handleAddGenre} className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select value={genre} onValueChange={(v) => v === "__new__" ? setAddingGenre(true) : setGenre(v)}>
                  <SelectTrigger><SelectValue placeholder="Genre wählen" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Genre</SelectItem>
                    {allGenres.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    <SelectItem value="__new__" className="text-primary font-medium">+ Neues Genre</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pages">Seitenzahl</Label>
              <Input id="pages" type="number" value={pageCount} onChange={(e) => setPageCount(e.target.value)} placeholder="320" />
            </div>
          </div>

          {/* Series */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Buchreihe</Label>
              <Select value={seriesName} onValueChange={(v) => v === "__new__" ? setSeriesName("") : setSeriesName(v)}>
                <SelectTrigger><SelectValue placeholder="Keine Reihe" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Reihe</SelectItem>
                  {seriesNames.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {/* Allow free text input if not selecting existing */}
              <Input
                value={seriesName === "none" ? "" : seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                placeholder="Oder neuen Namen eingeben..."
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seriesNum">Band Nr.</Label>
              <Input id="seriesNum" type="number" min="1" value={seriesNumber} onChange={(e) => setSeriesNumber(e.target.value)} placeholder="1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover-URL</Label>
            <Input id="cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Bewertung</Label>
            <RatingDisplay rating={rating} onChange={setRating} />
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
