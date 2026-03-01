import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, PenLine, Upload } from "lucide-react";
import { WritingOutput } from "@/components/WritingOutput";
import { AppSidebar } from "@/components/AppSidebar";
import { streamGhostWrite } from "@/lib/stream-chat";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [samples, setSamples] = useState("");
  const [mode, setMode] = useState<Mode>("email");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);

  const wordCount = samples.split(/\s+/).filter(Boolean).length;

  const handleGenerate = useCallback(async () => {
    if (!samples.trim()) {
      setSamplesOpen(true);
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
          wordCount={wordCount}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-12 flex items-center gap-3 border-b border-border bg-card/50 backdrop-blur-sm px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium text-foreground">{modeLabels[mode]}</span>
            <button
              onClick={() => setSamplesOpen(true)}
              className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              {wordCount > 0 ? `${wordCount} words` : "Add samples"}
            </button>
          </header>

          {/* Main chat area */}
          <main className="flex-1 flex flex-col">
            {/* Output area */}
            <div className="flex-1 overflow-y-auto p-6">
              {!output && !isStreaming ? (
                <div className="flex h-full items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <PenLine className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                      What would you like me to write?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {wordCount > 0
                        ? `I've got ${wordCount} words of your writing to study. Tell me what to write and I'll match your style.`
                        : "Start by adding your writing samples, then tell me what to write."}
                    </p>
                  </motion.div>
                </div>
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

      {/* Writing Samples Dialog */}
      <Dialog open={samplesOpen} onOpenChange={setSamplesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Your Writing Samples</DialogTitle>
            <DialogDescription>
              Paste emails, messages, or anything you've written. The more, the better I'll match your style.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={samples}
            onChange={(e) => setSamples(e.target.value)}
            placeholder="Paste your writing here… emails, texts, notes, essays — anything that sounds like you."
            className="h-56 w-full resize-none rounded-xl border border-border bg-background p-4 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {wordCount > 0 && (
            <p className="text-xs text-muted-foreground">{wordCount} words provided</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSamplesOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
