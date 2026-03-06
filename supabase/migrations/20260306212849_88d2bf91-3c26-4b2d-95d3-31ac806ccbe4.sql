
CREATE TABLE public.writing_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.writing_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own samples"
  ON public.writing_samples FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own samples"
  ON public.writing_samples FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own samples"
  ON public.writing_samples FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
