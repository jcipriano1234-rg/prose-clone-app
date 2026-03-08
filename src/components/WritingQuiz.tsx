import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const quizQuestions = [
  {
    id: "casual-vibe",
    emoji: "👋",
    question: "Yo, how's your day going so far?",
    subtitle: "Spill it like you're replying to a group chat — short or long, whatever feels natural.",
    placeholder: "Just type like you'd actually text someone…",
  },
  {
    id: "vent-style",
    emoji: "😤",
    question: "Something annoying just happened. How would you vent about it?",
    subtitle: "Slow internet, someone being loud, whatever — rant away like you would in a text or post.",
    placeholder: "Let it out…",
  },
  {
    id: "tired-slang",
    emoji: "😴",
    question: "You're dead tired and just wanna crash early. How would you say that to a friend?",
    subtitle: "Slang, caps, emojis — go wild or keep it plain. Your call.",
    placeholder: "Type it out like you'd actually say it…",
  },
  {
    id: "self-roast",
    emoji: "🔥",
    question: "Roast yourself real quick.",
    subtitle: "Funny self-burn you'd actually say or post. Don't overthink it.",
    placeholder: "Hit us with that self-deprecating humor…",
  },
  {
    id: "obsession",
    emoji: "✨",
    question: "What's one thing you're kinda obsessed with lately?",
    subtitle: "Spill why, in your vibe. Ramble if you want — that's the point.",
    placeholder: "Talk about it like you would to a friend who asked…",
  },
];

interface WritingQuizProps {
  onComplete: (answers: Record<string, string>) => void;
  onSkip?: () => void;
  initialAnswers?: Record<string, string>;
  isEditing?: boolean;
}

export function WritingQuiz({ onComplete, onSkip, initialAnswers, isEditing }: WritingQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    quizQuestions.forEach((q) => { map[q.id] = ""; });
    return map;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setAnswers((prev) => ({ ...prev, ...initialAnswers }));
    }
  }, [initialAnswers]);

  const current = quizQuestions[currentStep];
  const isLast = currentStep === quizQuestions.length - 1;
  const currentAnswer = answers[current.id] || "";
  const canProceed = currentAnswer.trim().split(/\s+/).filter(Boolean).length >= 10;
  const answeredCount = quizQuestions.filter((q) => (answers[q.id] || "").trim().split(/\s+/).filter(Boolean).length >= 10).length;

  const handleNext = () => {
    if (!canProceed) {
      toast.error("Write at least 10 words so we can capture your style.");
      return;
    }
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const validCount = quizQuestions.filter((q) => (answers[q.id] || "").trim().length > 10).length;
    if (validCount < 3) {
      toast.error("Answer at least 3 questions so we can learn your style.");
      setIsSubmitting(false);
      return;
    }
    onComplete(answers);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
            {isEditing ? <Pencil className="h-4 w-4 text-primary" /> : <MessageCircle className="h-4 w-4 text-primary" />}
            <span className="text-xs font-medium text-primary">
              {isEditing ? "Edit Your Writing Quiz" : "Writing Personality Quiz"}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {isEditing ? "Update your answers anytime" : "Let's learn how you write"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? "Change any answer — your writing profile updates instantly."
              : "Answer like you'd actually text or post — no filter needed."}
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {quizQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer hover:opacity-80 ${
                (answers[q.id] || "").trim().length > 10
                  ? "bg-primary"
                  : i === currentStep
                  ? "bg-primary/60"
                  : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">{current.emoji}</span>
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  {current.question}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{current.subtitle}</p>
              </div>
            </div>

            <textarea
              value={currentAnswer}
              onChange={(e) => {
                setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }));
              }}
              placeholder={current.placeholder}
              rows={5}
              className="w-full resize-none rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />

            {(() => {
              const wordCount = currentAnswer.trim().split(/\s+/).filter(Boolean).length;
              const remaining = 10 - wordCount;
              if (remaining > 0 && currentAnswer.trim().length > 0) {
                return (
                  <p className="text-xs text-muted-foreground mt-2">
                    {remaining} more word{remaining !== 1 ? "s" : ""} needed
                  </p>
                );
              }
              return null;
            })()}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  {currentStep + 1} of {quizQuestions.length}
                </span>
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                size="sm"
                className="gap-1.5"
              >
                {isLast ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Finish"}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip / Progress info */}
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-muted-foreground">
            {answeredCount > 0
              ? `${answeredCount} of ${quizQuestions.length} answered`
              : "Your answers teach the AI your exact writing style"}
          </p>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {isEditing ? "Cancel" : "Skip for now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
