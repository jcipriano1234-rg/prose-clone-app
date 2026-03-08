import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, PenLine, User, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { streamGhostWrite, ChatMessage } from "@/lib/stream-chat";
import { streamHumanize, type HumanizeIntensity } from "@/lib/stream-humanize";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ReactMarkdown from "react-markdown";
import { useWritingSamples } from "@/hooks/useWritingSamples";
import { useChatHistory } from "@/hooks/useChatHistory";
import { defaultToneSettings, type ToneSettings } from "@/components/ToneSliders";
import { TemplateLibrary } from "@/components/TemplateLibrary";
import { AiDetectorScore } from "@/components/AiDetectorScore";

type Mode = "email" | "essay" | "polish" | "freeform";

const placeholders: Record<Mode, string> = {
  email: "Describe the email… e.g. 'Thank my boss for the raise, keep it casual'",
  essay: "What's the topic? e.g. 'Why remote work is the future'",
  polish: "Paste the text you want rewritten in your style…",
  freeform: "Describe anything you want written… e.g. 'A cover letter for a marketing role'",
};

const modeLabels: Record<Mode, string> = {
  email: "Ghost-Write Email",
  essay: "Write Essay",
  polish: "Polish Text",
  freeform: "Freeform Writing",
};

export default function Index() {
  const { samples, addSample, removeSample, totalWordCount, allSamplesText } = useWritingSamples();
  const {
    sessions, activeSessionId, setActiveSessionId,
    loadSessionMessages, createSession, saveMessage, deleteSession, startNewSession,
  } = useChatHistory();
  const [mode, setMode] = useState<Mode>("email");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toneSettings, setToneSettings] = useState<ToneSettings>(defaultToneSettings);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSessionRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Load messages when selecting a session
  const handleSelectSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    currentSessionRef.current = sessionId;
    const msgs = await loadSessionMessages(sessionId);
    setMessages(msgs);
    setStreamingContent("");
    setPrompt("");
  }, [loadSessionMessages, setActiveSessionId]);

  const handleAddSample = (text: string) => {
    addSample(text);
  };

  const handleRemoveSample = (id: string) => {
    removeSample(id);
  };

  const handleGenerate = useCallback(async () => {
    if (samples.length === 0) {
      toast.error("Add some writing samples in the sidebar first.");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Tell me what to write!");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: prompt.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setPrompt("");
    setStreamingContent("");
    setIsStreaming(true);

    // Create or reuse session
    let sessionId = currentSessionRef.current;
    if (!sessionId) {
      sessionId = await createSession(mode, prompt.trim());
      if (!sessionId) {
        toast.error("Failed to create session.");
        setIsStreaming(false);
        return;
      }
      currentSessionRef.current = sessionId;
    }

    // Save user message
    await saveMessage(sessionId, "user", prompt.trim());

    let accumulated = "";
    await streamGhostWrite({
      writingSamples: allSamplesText,
      mode,
      prompt: prompt.trim(),
      history: messages,
      tone: toneSettings,
      onDelta: (chunk) => {
        accumulated += chunk;
        setStreamingContent(accumulated);
      },
      onDone: async () => {
        setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
        setStreamingContent("");
        setIsStreaming(false);
        // Save assistant message
        if (currentSessionRef.current) {
          await saveMessage(currentSessionRef.current, "assistant", accumulated);
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        setStreamingContent("");
        toast.error(err);
      },
    });
  }, [samples, allSamplesText, mode, prompt, messages, createSession, saveMessage]);

  const handleNewSession = () => {
    setPrompt("");
    setMessages([]);
    setStreamingContent("");
    currentSessionRef.current = null;
    startNewSession();
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
          chatSessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={deleteSession}
          toneSettings={toneSettings}
          onToneChange={setToneSettings}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center gap-3 border-b border-border bg-card/50 backdrop-blur-sm px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium text-foreground">{modeLabels[mode]}</span>
          </header>

          <main className="flex-1 flex flex-col">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 && !isStreaming ? (
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
                    <p className="text-sm text-muted-foreground mb-4">
                      {totalWordCount > 0
                        ? `I've got ${totalWordCount} words across ${samples.length} sample${samples.length !== 1 ? "s" : ""}. Tell me what to write and I'll match your style.`
                        : "Start by adding writing samples in the sidebar, then tell me what to write."}
                    </p>
                    {totalWordCount > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Quick templates:</p>
                        <TemplateLibrary mode={mode} onSelectTemplate={setPrompt} />
                      </div>
                    )}
                  </motion.div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                  ))}
                  {isStreaming && streamingContent && (
                    <MessageBubble
                      message={{ role: "assistant", content: streamingContent }}
                      isStreaming
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      messages.length > 0
                        ? "Ask for changes… e.g. 'Make it shorter' or 'More professional tone'"
                        : placeholders[mode]
                    }
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
                  ⌘ + Enter to send
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function MessageBubble({
  message,
  isStreaming = false,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
      </div>
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border shadow-sm"
        }`}
      >
        {!isUser && !isStreaming && (
          <button
            onClick={handleCopy}
            className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <div className="prose prose-sm max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary" />
              )}
            </div>
            {!isStreaming && <AiDetectorScore content={message.content} />}
          </>
        )}
      </div>
    </motion.div>
  );
}
