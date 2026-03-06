import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WritingSample } from "@/components/AppSidebar";

export function useWritingSamples() {
  const [samples, setSamples] = useState<WritingSample[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSamples = useCallback(async () => {
    const { data, error } = await supabase
      .from("writing_samples")
      .select("id, text, word_count, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch samples:", error);
      return;
    }

    setSamples(
      (data || []).map((row) => ({
        id: row.id,
        text: row.text,
        addedAt: new Date(row.created_at),
        wordCount: row.word_count,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  const addSample = useCallback(async (text: string) => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to save samples.");
      return;
    }

    const { data, error } = await supabase
      .from("writing_samples")
      .insert({ user_id: user.id, text, word_count: wordCount })
      .select("id, text, word_count, created_at")
      .single();

    if (error) {
      toast.error("Failed to save sample.");
      console.error(error);
      return;
    }

    setSamples((prev) => [
      { id: data.id, text: data.text, addedAt: new Date(data.created_at), wordCount: data.word_count },
      ...prev,
    ]);
    toast.success(`Added sample (${wordCount} words)`);
  }, []);

  const removeSample = useCallback(async (id: string) => {
    const { error } = await supabase.from("writing_samples").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete sample.");
      console.error(error);
      return;
    }
    setSamples((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const totalWordCount = samples.reduce((sum, s) => sum + s.wordCount, 0);
  const allSamplesText = samples.map((s) => s.text).join("\n\n---\n\n");

  return { samples, loading, addSample, removeSample, totalWordCount, allSamplesText };
}
