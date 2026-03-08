
-- Add column to track monthly grant date for Pro users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_monthly_grant date NOT NULL DEFAULT '2000-01-01';

-- Replace grant_daily_credits to handle Pro monthly grants
CREATE OR REPLACE FUNCTION public.grant_daily_credits(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_grant date;
  v_last_monthly date;
  v_plan text;
  v_balance integer;
  v_grant integer;
BEGIN
  SELECT last_daily_grant, last_monthly_grant, plan, credits_balance
  INTO v_last_grant, v_last_monthly, v_plan, v_balance
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Team is unlimited
  IF v_plan = 'team' THEN
    RETURN 999999;
  END IF;

  -- Pro plan: grant 300 credits once per calendar month (reset)
  IF v_plan = 'pro' THEN
    IF date_trunc('month', v_last_monthly::timestamp) < date_trunc('month', CURRENT_DATE::timestamp) THEN
      UPDATE public.profiles
      SET credits_balance = 300,
          last_monthly_grant = CURRENT_DATE,
          last_daily_grant = CURRENT_DATE,
          updated_at = now()
      WHERE user_id = p_user_id;

      INSERT INTO public.credit_transactions (user_id, amount, action, description)
      VALUES (p_user_id, 300, 'monthly_grant', 'Monthly Pro credits');

      RETURN 300;
    END IF;
    RETURN v_balance;
  END IF;

  -- Free plan: 3 credits/day (reset)
  IF v_last_grant >= CURRENT_DATE THEN
    RETURN v_balance;
  END IF;

  v_grant := 3;
  UPDATE public.profiles
  SET credits_balance = v_grant,
      last_daily_grant = CURRENT_DATE,
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, action, description)
  VALUES (p_user_id, v_grant, 'daily_grant', 'Daily free credits');

  RETURN v_grant;
END;
$$;
