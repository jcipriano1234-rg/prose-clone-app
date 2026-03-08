import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, PenLine, User, Copy, Check, ClipboardList, Zap, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { streamGhostWrite, ChatMessage } from "@/lib/stream-chat";

import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ReactMarkdown from "react-markdown";
import { useWritingSamples } from "@/hooks/useWritingSamples";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useCredits } from "@/hooks/useCredits";
import { useStyleProfile } from "@/hooks/useStyleProfile";
import { defaultToneSettings, type ToneSettings } from "@/components/ToneSliders";
import { TemplateLibrary } from "@/components/TemplateLibrary";


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
  const navigate = useNavigate();
  const { samples, addSample, removeSample, totalWordCount, allSamplesText } = useWritingSamples();
  const {
    sessions, activeSessionId, setActiveSessionId,
    loadSessionMessages, createSession, saveMessage, deleteSession, startNewSession,
  } = useChatHistory();
  const { balance, plan, isUnlimited, hasCredits, refetch: refetchCredits } = useCredits();
  const { styleProfile, analyzing, analyzeStyle } = useStyleProfile();
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

  // Auto-analyze style when samples change and there are enough
  useEffect(() => {
    if (totalWordCount >= 50 && !styleProfile && !analyzing && allSamplesText.trim().length > 50) {
      analyzeStyle(allSamplesText);
    }
  }, [totalWordCount, styleProfile, analyzing, allSamplesText, analyzeStyle]);

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
    if (!hasCredits) {
      toast.error("Not enough credits. Upgrade your plan for more.");
      return;
    }

    // Determine credit cost for display
    const isFollowUp = messages.length > 0;
    const creditCost = isFollowUp ? 2 : 3;

    const userMessage: ChatMessage = { role: "user", content: prompt.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setPrompt("");
    setStreamingContent("");
    setIsStreaming(true);

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

    await saveMessage(sessionId, "user", prompt.trim());

    let accumulated = "";
    await streamGhostWrite({
      writingSamples: allSamplesText,
      mode,
      prompt: prompt.trim(),
      history: messages,
      tone: toneSettings,
      styleProfile: styleProfile || undefined,
      onDelta: (chunk) => {
        accumulated += chunk;
        setStreamingContent(accumulated);
      },
      onDone: async () => {
        setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
        setStreamingContent("");
        setIsStreaming(false);
        if (currentSessionRef.current) {
          await saveMessage(currentSessionRef.current, "assistant", accumulated);
        }
        // Refresh generation count
        refetchCredits();
      },
      onError: (err) => {
        setIsStreaming(false);
        setStreamingContent("");
        toast.error(err);
      },
    });
  }, [samples, allSamplesText, mode, prompt, messages, createSession, saveMessage, hasCredits, toneSettings, styleProfile, refetchCredits]);

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
          <header className="h-12 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-3 sm:px-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger />
              <span className="text-sm font-medium text-foreground truncate">{modeLabels[mode]}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {styleProfile && (
                <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium hidden sm:inline-flex">
                  Style Analyzed ✓
                </span>
              )}
              <div className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-1 text-xs font-medium ${
                !hasCredits
                  ? "bg-destructive/10 text-destructive"
                  : balance <= 2 && !isUnlimited
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                <Zap className="h-3 w-3" />
                {isUnlimited ? "∞" : balance}
                <span className="hidden sm:inline"> credits</span>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                        : "Take the writing quiz or add samples to teach me your style."}
                    </p>
                    {totalWordCount === 0 && (
                      <button
                        onClick={() => navigate("/quiz")}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-sm hover:opacity-90 transition-all mb-4"
                      >
                        <ClipboardList className="h-4 w-4" />
                        Take the Writing Quiz
                      </button>
                    )}
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
            <div className="border-t border-border bg-card/50 backdrop-blur-sm p-3 sm:p-4">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      !hasCredits
                        ? "Out of credits — upgrade for more"
                        : messages.length > 0
                        ? `Ask for changes (2 credits)… e.g. 'Make it shorter'`
                        : placeholders[mode]
                    }
                    rows={3}
                    disabled={!hasCredits}
                    className="w-full resize-none rounded-xl border border-border bg-background p-4 pr-14 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isStreaming || !hasCredits}
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  <span className="hidden sm:inline">⌘ + Enter to send</span>
                  <span className="sm:hidden">Tap send or ⌘+Enter</span>
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
          </>
        )}
      </div>
    </motion.div>
  );
}
