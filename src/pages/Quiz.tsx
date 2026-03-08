import { useNavigate } from "react-router-dom";
import { WritingQuiz } from "@/components/WritingQuiz";
import { useWritingSamples } from "@/hooks/useWritingSamples";
import { toast } from "sonner";

export default function Quiz() {
  const navigate = useNavigate();
  const { addSample } = useWritingSamples();

  const handleComplete = async (answers: string[]) => {
    // Combine all quiz answers into a single rich sample prefixed with context
    const combined = answers
      .map((a, i) => `[Response ${i + 1}]\n${a}`)
      .join("\n\n");

    await addSample(combined);
    toast.success("Your writing personality has been captured!");
    navigate("/app");
  };

  const handleSkip = () => {
    navigate("/app");
  };

  return <WritingQuiz onComplete={handleComplete} onSkip={handleSkip} />;
}
