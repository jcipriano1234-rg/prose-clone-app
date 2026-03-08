import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StyleProfile {
  avg_sentence_length: number;
  avg_word_length: number;
  contraction_rate: number;
  vocabulary_richness: number;
  top_words: string[];
  top_phrases: string[];
  punctuation_habits: Record<string, number>;
  formality_score: number;
  personality_traits: string[];
  raw_analysis: string;
  analyzed_at: string;
}

export function useStyleProfile() {
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchStyleProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("style_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) setStyleProfile(data as unknown as StyleProfile);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStyleProfile(); }, [fetchStyleProfile]);

  const analyzeStyle = useCallback(async (writingSamples: string) => {
    if (writingSamples.trim().length < 50) {
      toast.error("Need more writing samples to analyze your style.");
      return;
    }

    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-style`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ writingSamples }),
        }
      );

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({ error: "Analysis failed" }));
        toast.error(data.error || "Style analysis failed");
        setAnalyzing(false);
        return;
      }

      const result = await resp.json();
      if (result.analysis) {
        setStyleProfile(result.analysis as StyleProfile);
        toast.success("Writing style analyzed!");
      }
    } catch (e) {
      toast.error("Failed to analyze writing style.");
      console.error(e);
    }
    setAnalyzing(false);
  }, []);

  return { styleProfile, loading, analyzing, analyzeStyle, refetch: fetchStyleProfile };
}
