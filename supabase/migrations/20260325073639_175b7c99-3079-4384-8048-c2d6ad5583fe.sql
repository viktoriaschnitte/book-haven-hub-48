
CREATE TABLE public.user_genres (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.user_genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own genres" ON public.user_genres FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own genres" ON public.user_genres FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own genres" ON public.user_genres FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own genres" ON public.user_genres FOR DELETE USING (auth.uid() = user_id);
