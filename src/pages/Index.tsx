import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, PenLine } from "lucide-react";
import { WritingOutput } from "@/components/WritingOutput";
import { AppSidebar, WritingSample } from "@/components/AppSidebar";
import { LandingHero } from "@/components/LandingHero";
import { streamGhostWrite } from "@/lib/stream-chat";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type Mode = "email" | "essay" | "polish";

const placeholders: Record<Mode, string> = {
  email: "Describe the email… e.g. 'Thank my boss for the raise, keep it casual'",
  essay: "What's the topic? e.g. 'Why remote work is the future'",
  polish: "Paste the text you want rewritten in your style…",
};

const modeLabels: Record<Mode, string> = {
  email: "Ghost-Write Email",
  essay: "Write Essay",
  polish: "Polish Text",
};

export default function Index() {
  const [samples, setSamples] = useState<WritingSample[]>([]);
  const [mode, setMode] = useState<Mode>("email");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const totalWordCount = samples.reduce((sum, s) => sum + s.wordCount, 0);
  const allSamplesText = samples.map((s) => s.text).join("\n\n---\n\n");

  const handleAddSample = (text: string) => {
    const wc = text.split(/\s+/).filter(Boolean).length;
    setSamples((prev) => [
      {
        id: crypto.randomUUID(),
        text,
        addedAt: new Date(),
        wordCount: wc,
      },
      ...prev,
    ]);
    toast.success(`Added sample (${wc} words)`);
  };

  const handleRemoveSample = (id: string) => {
    setSamples((prev) => prev.filter((s) => s.id !== id));
  };

  const handleGenerate = useCallback(async () => {
    if (samples.length === 0) {
      toast.error("Add some writing samples in the sidebar first so I can learn your style.");
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
      writingSamples: allSamplesText,
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
  }, [samples, allSamplesText, mode, prompt]);

  const handleNewSession = () => {
    setPrompt("");
    setOutput("");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          mode={mode}
          onModeChange={setMode}
          onNewSession={handleNewSession}
          samples={samples}
          onAddSample={handleAddSample}
          onRemoveSample={handleRemoveSample}
          totalWordCount={totalWordCount}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-12 flex items-center gap-3 border-b border-border bg-card/50 backdrop-blur-sm px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium text-foreground">{modeLabels[mode]}</span>
          </header>

          {/* Main chat area */}
          <main className="flex-1 flex flex-col">
            {/* Output area */}
            <div className="flex-1 overflow-y-auto p-6">
              {!output && !isStreaming ? (
                <LandingHero />
              ) : (
                <div className="max-w-3xl mx-auto">
                  <WritingOutput content={output} isStreaming={isStreaming} />
                </div>
              )}
            </div>

            {/* Input bar at bottom */}
            <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={placeholders[mode]}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-background p-4 pr-14 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  ⌘ + Enter to generate
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
