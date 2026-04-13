
-- Add tropes column to books as text array
ALTER TABLE public.books ADD COLUMN tropes text[] DEFAULT '{}';

-- Create user_tropes table for managing available tropes
CREATE TABLE public.user_tropes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.user_tropes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tropes" ON public.user_tropes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tropes" ON public.user_tropes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tropes" ON public.user_tropes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tropes" ON public.user_tropes FOR DELETE USING (auth.uid() = user_id);
