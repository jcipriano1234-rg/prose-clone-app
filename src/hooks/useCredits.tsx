import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCredits() {
  const [balance, setBalance] = useState(0);
  const [plan, setPlan] = useState<"free" | "pro" | "team">("free");
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Grant daily credits if needed (calls DB function)
    await supabase.rpc("grant_daily_credits", { p_user_id: user.id });

    // Fetch profile for balance and plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance, plan")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      setBalance((profile as any).credits_balance ?? 0);
      setPlan(((profile as any).plan ?? "free") as "free" | "pro" | "team");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const isUnlimited = plan === "team";
  const hasCredits = isUnlimited || balance > 0;

  return { balance, plan, isUnlimited, hasCredits, loading, refetch: fetchCredits };
}
