import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, FileText, Sparkles, Send, PenLine } from "lucide-react";
import { ModeCard } from "@/components/ModeCard";
import { WritingOutput } from "@/components/WritingOutput";
import { streamGhostWrite } from "@/lib/stream-chat";
import { toast } from "sonner";

type Mode = "email" | "essay" | "polish";

const modes = [
  { id: "email" as Mode, icon: Mail, title: "Ghost-Write Email", description: "Compose emails in your voice" },
  { id: "essay" as Mode, icon: FileText, title: "Write Essay", description: "Long-form pieces, your style" },
  { id: "polish" as Mode, icon: Sparkles, title: "Polish Text", description: "Rewrite anything as you" },
];

const placeholders: Record<Mode, string> = {
  email: "Describe the email… e.g. 'Thank my boss for the raise, keep it casual'",
  essay: "What's the topic? e.g. 'Why remote work is the future'",
  polish: "Paste the text you want rewritten in your style…",
};

export default function Index() {
  const [samples, setSamples] = useState("");
  const [mode, setMode] = useState<Mode>("email");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!samples.trim()) {
      toast.error("Add some writing samples first so I can learn your style.");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Tell me what to write!");
      return;
    }

    setOutput("");
    setIsStreaming(true);

    let accumulated = "";
    await streamGhostWrite({
      writingSamples: samples,
      mode,
      prompt,
      onDelta: (chunk) => {
        accumulated += chunk;
        setOutput(accumulated);
      },
      onDone: () => setIsStreaming(false),
      onError: (err) => {
        setIsStreaming(false);
        toast.error(err);
      },
    });
  }, [samples, mode, prompt]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center gap-3 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PenLine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">GhostInk</h1>
            <p className="text-xs text-muted-foreground">AI that writes exactly like you</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Writing Samples */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="mb-2 block text-sm font-medium text-foreground">
                Your Writing Samples
              </label>
              <p className="mb-3 text-xs text-muted-foreground">
                Paste emails, messages, or anything you've written. The more, the better I'll match your style.
              </p>
              <textarea
                value={samples}
                onChange={(e) => setSamples(e.target.value)}
                placeholder="Paste your writing here… emails, texts, notes, essays — anything that sounds like you."
                className="h-44 w-full resize-none rounded-xl border border-border bg-warm-input p-4 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {samples.length > 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {samples.split(/\s+/).filter(Boolean).length} words provided
                </p>
              )}
            </motion.div>

            {/* Mode Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="mb-3 block text-sm font-medium text-foreground">
                What should I write?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {modes.map((m) => (
                  <ModeCard
                    key={m.id}
                    icon={m.icon}
                    title={m.title}
                    description={m.description}
                    active={mode === m.id}
                    onClick={() => setMode(m.id)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="mb-2 block text-sm font-medium text-foreground">
                Instructions
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={placeholders[mode]}
                  className="h-28 w-full resize-none rounded-xl border border-border bg-warm-input p-4 pr-14 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isStreaming}
                  className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                ⌘ + Enter to generate
              </p>
            </motion.div>
          </div>

          {/* Right Column - Output */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="mb-2 block text-sm font-medium text-foreground">
              Output
            </label>
            <WritingOutput content={output} isStreaming={isStreaming} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
