import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface QuizAnswer {
  question_id: string;
  answer: string;
}

export function useQuizAnswers() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchAnswers = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("quiz_answers")
      .select("question_id, answer")
      .eq("user_id", user.id);

    if (!error && data) {
      const map: Record<string, string> = {};
      data.forEach((row: any) => { map[row.question_id] = row.answer; });
      setAnswers(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnswers(); }, [fetchAnswers]);

  const saveAnswers = useCallback(async (answerMap: Record<string, string>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = Object.entries(answerMap)
      .filter(([, v]) => v.trim().length > 0)
      .map(([question_id, answer]) => ({
        user_id: user.id,
        question_id,
        answer,
        updated_at: new Date().toISOString(),
      }));

    if (rows.length === 0) return;

    const { error } = await supabase
      .from("quiz_answers")
      .upsert(rows, { onConflict: "user_id,question_id" });

    if (!error) setAnswers(answerMap);
    return error;
  }, []);

  return { answers, loading, saveAnswers, hasExistingAnswers: Object.keys(answers).length > 0 };
}
