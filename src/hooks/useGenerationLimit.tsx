import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useGenerationLimit() {
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Fetch profile for limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("daily_limit")
      .eq("user_id", user.id)
      .single();

    if (profile) setLimit(profile.daily_limit);

    // Fetch today's count
    const { data: count } = await supabase.rpc("get_daily_generation_count", { p_user_id: user.id });
    setUsed(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const remaining = Math.max(0, limit - used);
  const isLimitReached = used >= limit;

  return { used, limit, remaining, isLimitReached, loading, refetch: fetchUsage };
}
