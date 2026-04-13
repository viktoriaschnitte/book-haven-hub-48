import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserTrope {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export function useTropes() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const tropesQuery = useQuery({
    queryKey: ["user_tropes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tropes")
        .select("*")
        .eq("user_id", user!.id)
        .order("name");
      if (error) throw error;
      return data as UserTrope[];
    },
    enabled: !!user,
  });

  const addTrope = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("user_tropes")
        .insert({ user_id: user!.id, name });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_tropes"] }),
  });

  const deleteTrope = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_tropes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_tropes"] }),
  });

  return {
    tropes: tropesQuery.data ?? [],
    loading: tropesQuery.isLoading,
    addTrope,
    deleteTrope,
  };
}
