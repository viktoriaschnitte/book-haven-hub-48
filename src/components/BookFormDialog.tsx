import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingDisplay } from "./RatingDisplay";
import { Book } from "@/hooks/useBooks";
import { Save } from "lucide-react";

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
  }) => void;
  editBook?: Book | null;
}

export function BookFormDialog({ open, onOpenChange, onSubmit, editBook }: BookFormDialogProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    if (editBook) {
      setTitle(editBook.title);
      setAuthor(editBook.author);
      setPageCount(editBook.page_count?.toString() ?? "");
      setCoverUrl(editBook.cover_url ?? "");
      setGenre(editBook.genre ?? "");
      setNotes(editBook.notes ?? "");
      setRating(editBook.rating ?? 0);
    } else {
      setTitle(""); setAuthor(""); setPageCount(""); setCoverUrl(""); setGenre(""); setNotes(""); setRating(0);
    }
  }, [editBook, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      author,
      page_count: pageCount ? parseInt(pageCount) : null,
      cover_url: coverUrl || null,
      genre: genre || null,
      notes: notes || null,
      rating: rating || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="genre">Genre</Label>
              <Input id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="z.B. Roman, Krimi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pages">Seitenzahl</Label>
              <Input id="pages" type="number" value={pageCount} onChange={(e) => setPageCount(e.target.value)} placeholder="320" />
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
