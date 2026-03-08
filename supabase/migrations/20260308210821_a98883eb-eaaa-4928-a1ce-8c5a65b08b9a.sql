
-- 1. Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  default_mode text NOT NULL DEFAULT 'email',
  onboarding_complete boolean NOT NULL DEFAULT false,
  daily_limit integer NOT NULL DEFAULT 5,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Generation logs table
CREATE TABLE public.generation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'email',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generation logs" ON public.generation_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own generation logs" ON public.generation_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to count today's generations
CREATE OR REPLACE FUNCTION public.get_daily_generation_count(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.generation_logs
  WHERE user_id = p_user_id
    AND created_at >= (CURRENT_DATE AT TIME ZONE 'UTC');
$$;

-- 3. Style profiles table
CREATE TABLE public.style_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  avg_sentence_length numeric NOT NULL DEFAULT 0,
  avg_word_length numeric NOT NULL DEFAULT 0,
  contraction_rate numeric NOT NULL DEFAULT 0,
  vocabulary_richness numeric NOT NULL DEFAULT 0,
  top_words jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_phrases jsonb NOT NULL DEFAULT '[]'::jsonb,
  punctuation_habits jsonb NOT NULL DEFAULT '{}'::jsonb,
  formality_score integer NOT NULL DEFAULT 50,
  personality_traits jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_analysis text NOT NULL DEFAULT '',
  analyzed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.style_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own style profile" ON public.style_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own style profile" ON public.style_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own style profile" ON public.style_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
