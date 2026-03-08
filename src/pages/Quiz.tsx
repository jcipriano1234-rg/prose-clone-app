import { useNavigate } from "react-router-dom";
import { WritingQuiz, quizQuestions } from "@/components/WritingQuiz";
import { useWritingSamples } from "@/hooks/useWritingSamples";
import { useQuizAnswers } from "@/hooks/useQuizAnswers";
import { toast } from "sonner";

export default function Quiz() {
  const navigate = useNavigate();
  const { addSample } = useWritingSamples();
  const { answers: savedAnswers, loading, saveAnswers, hasExistingAnswers } = useQuizAnswers();

  const handleComplete = async (answerMap: Record<string, string>) => {
    // Save individual answers to DB
    const error = await saveAnswers(answerMap);
    if (error) {
      toast.error("Failed to save quiz answers.");
      return;
    }

    // Combine valid answers into a writing sample
    const combined = quizQuestions
      .filter((q) => (answerMap[q.id] || "").trim().length > 10)
      .map((q) => `[${q.question}]\n${answerMap[q.id]}`)
      .join("\n\n");

    await addSample(combined);
    toast.success(hasExistingAnswers ? "Writing profile updated!" : "Your writing personality has been captured!");
    navigate("/app");
  };

  const handleSkip = () => {
    navigate("/app");
  };

  if (loading) return null;

  return (
    <WritingQuiz
      onComplete={handleComplete}
      onSkip={handleSkip}
      initialAnswers={savedAnswers}
      isEditing={hasExistingAnswers}
    />
  );
}
