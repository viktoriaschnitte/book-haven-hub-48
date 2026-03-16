import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables } from "@/integrations/supabase/types";

export type BookList = Tables<"lists">;
export type BookListAssignment = Tables<"book_list_assignments">;

export function useLists() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const listsQuery = useQuery({
    queryKey: ["lists", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const assignmentsQuery = useQuery({
    queryKey: ["book_list_assignments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_list_assignments")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createList = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("lists").insert({ name, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });

  const assignBook = useMutation({
    mutationFn: async ({ bookId, listId }: { bookId: string; listId: string }) => {
      const { error } = await supabase.from("book_list_assignments").insert({ book_id: bookId, list_id: listId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["book_list_assignments"] }),
  });

  const unassignBook = useMutation({
    mutationFn: async ({ bookId, listId }: { bookId: string; listId: string }) => {
      const { error } = await supabase.from("book_list_assignments").delete().eq("book_id", bookId).eq("list_id", listId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["book_list_assignments"] }),
  });

  return {
    lists: listsQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    loading: listsQuery.isLoading,
    createList,
    deleteList,
    assignBook,
    unassignBook,
  };
}
