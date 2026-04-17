import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Book = Tables<"books">;
export type BookInsert = TablesInsert<"books">;

export function useBooks() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const booksQuery = useQuery({
    queryKey: ["books", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addBook = useMutation({
    mutationFn: async (book: Omit<BookInsert, "user_id">) => {
      const { data, error } = await supabase
        .from("books")
        .insert({ ...book, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });

  const updateBook = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Book> & { id: string }) => {
      const { error } = await supabase.from("books").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });

  const deleteBook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });

  return { books: booksQuery.data ?? [], loading: booksQuery.isLoading, addBook, updateBook, deleteBook };
}
