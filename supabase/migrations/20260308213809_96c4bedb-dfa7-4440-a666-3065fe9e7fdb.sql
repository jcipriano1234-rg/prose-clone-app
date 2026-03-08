
-- Credit ledger table: tracks every credit transaction
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- positive = credit added, negative = credit spent
  action text NOT NULL DEFAULT 'generation', -- 'generation', 'edit', 'analysis', 'daily_grant', 'purchase'
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add credits_balance to profiles for fast lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_balance integer NOT NULL DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_daily_grant date NOT NULL DEFAULT CURRENT_DATE;

-- Function: get current credit balance (from profile)
CREATE OR REPLACE FUNCTION public.get_credit_balance(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(credits_balance, 0)
  FROM public.profiles
  WHERE user_id = p_user_id;
$$;

-- Function: deduct credits atomically. Returns remaining balance or -1 if insufficient.
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer, p_action text, p_description text DEFAULT '')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_plan text;
BEGIN
  -- Get current balance and plan
  SELECT credits_balance, plan INTO v_balance, v_plan
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Team plan = unlimited
  IF v_plan = 'team' THEN
    -- Still log the transaction but don't deduct
    INSERT INTO public.credit_transactions (user_id, amount, action, description)
    VALUES (p_user_id, -p_amount, p_action, p_description);
    RETURN 999999;
  END IF;

  -- Check sufficient balance
  IF v_balance < p_amount THEN
    RETURN -1;
  END IF;

  -- Deduct
  UPDATE public.profiles
  SET credits_balance = credits_balance - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, action, description)
  VALUES (p_user_id, -p_amount, p_action, p_description);

  RETURN v_balance - p_amount;
END;
$$;

-- Function: grant daily free credits (only once per day)
CREATE OR REPLACE FUNCTION public.grant_daily_credits(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_grant date;
  v_plan text;
  v_balance integer;
  v_grant integer;
BEGIN
  SELECT last_daily_grant, plan, credits_balance INTO v_last_grant, v_plan, v_balance
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Team is unlimited, no daily grant needed
  IF v_plan = 'team' THEN
    RETURN 999999;
  END IF;

  -- Already granted today
  IF v_last_grant >= CURRENT_DATE THEN
    RETURN v_balance;
  END IF;

  -- Free plan gets 3 credits/day (reset, not additive)
  IF v_plan = 'free' THEN
    v_grant := 3;
    UPDATE public.profiles
    SET credits_balance = v_grant,
        last_daily_grant = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO public.credit_transactions (user_id, amount, action, description)
    VALUES (p_user_id, v_grant, 'daily_grant', 'Daily free credits');

    RETURN v_grant;
  END IF;

  -- Pro plan: daily grant not applicable (monthly), just update date
  UPDATE public.profiles
  SET last_daily_grant = CURRENT_DATE,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN v_balance;
END;
$$;

-- Update the handle_new_user trigger to set initial credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, credits_balance, plan, last_daily_grant)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), 3, 'free', CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Enable realtime for credit_transactions if needed
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_transactions;
