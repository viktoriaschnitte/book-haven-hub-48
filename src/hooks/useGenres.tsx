import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserGenre {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export function useGenres() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const genresQuery = useQuery({
    queryKey: ["user_genres", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_genres")
        .select("*")
        .eq("user_id", user!.id)
        .order("name");
      if (error) throw error;
      return data as UserGenre[];
    },
    enabled: !!user,
  });

  const addGenre = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("user_genres")
        .insert({ user_id: user!.id, name });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_genres"] }),
  });

  const updateGenre = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("user_genres")
        .update({ name })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_genres"] }),
  });

  const deleteGenre = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_genres")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_genres"] }),
  });

  return {
    genres: genresQuery.data ?? [],
    loading: genresQuery.isLoading,
    addGenre,
    updateGenre,
    deleteGenre,
  };
}
