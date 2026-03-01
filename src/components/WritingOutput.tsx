import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface WritingOutputProps {
  content: string;
  isStreaming: boolean;
}

export function WritingOutput({ content, isStreaming }: WritingOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content && !isStreaming) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border bg-card p-8">
        <p className="text-center text-sm text-muted-foreground">
          Your ghost-written text will appear here...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-h-[300px] rounded-xl border border-border bg-card p-6 shadow-card"
    >
      {content && (
        <button
          onClick={handleCopy}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
      <div className="prose prose-sm max-w-none font-sans text-foreground prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
        <ReactMarkdown>{content}</ReactMarkdown>
        {isStreaming && (
          <span className="inline-block h-4 w-1.5 animate-pulse-soft rounded-sm bg-primary" />
        )}
      </div>
    </motion.div>
  );
}
