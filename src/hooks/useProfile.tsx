import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  user_id: string;
  display_name: string;
  default_mode: string;
  onboarding_complete: boolean;
  daily_limit: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // Profile doesn't exist yet — create it
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ user_id: user.id, display_name: user.user_metadata?.full_name || "" })
        .select()
        .single();
      if (newProfile) setProfile(newProfile as unknown as UserProfile);
    } else if (data) {
      setProfile(data as unknown as UserProfile);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", profile.user_id)
      .select()
      .single();
    if (!error && data) setProfile(data as unknown as UserProfile);
    return error;
  }, [profile]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
