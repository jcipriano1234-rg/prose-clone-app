import { motion } from "framer-motion";

type Mode = "email" | "essay" | "polish" | "freeform";

interface Template {
  id: string;
  label: string;
  prompt: string;
  mode: Mode;
}

const templates: Template[] = [
  // Email
  { id: "cold-outreach", label: "Cold Outreach", prompt: "Write a cold outreach email to a potential client introducing my services and asking for a meeting", mode: "email" },
  { id: "thank-you", label: "Thank You", prompt: "Write a thank you email to my manager for the recent opportunity they gave me", mode: "email" },
  { id: "follow-up", label: "Follow Up", prompt: "Write a follow-up email after a meeting, summarizing key points and next steps", mode: "email" },
  { id: "apology", label: "Apology", prompt: "Write a professional apology email for a missed deadline, explaining the situation and proposed resolution", mode: "email" },
  // Essay
  { id: "opinion-piece", label: "Opinion Piece", prompt: "Write an opinion piece about why remote work is the future of employment", mode: "essay" },
  { id: "how-to", label: "How-To Guide", prompt: "Write a how-to guide about getting started with a new skill or hobby", mode: "essay" },
  { id: "personal-essay", label: "Personal Essay", prompt: "Write a personal essay reflecting on a lesson I learned the hard way", mode: "essay" },
  // Freeform
  { id: "linkedin-post", label: "LinkedIn Post", prompt: "Write a LinkedIn post about a professional achievement or insight, keeping it engaging and authentic", mode: "freeform" },
  { id: "cover-letter", label: "Cover Letter", prompt: "Write a cover letter for a marketing role at a tech startup, highlighting creativity and results", mode: "freeform" },
  { id: "bio", label: "Personal Bio", prompt: "Write a short professional bio for my website or social media profile", mode: "freeform" },
  { id: "tweet-thread", label: "Tweet Thread", prompt: "Write a Twitter/X thread about an interesting idea or hot take in my field", mode: "freeform" },
  // Polish
  { id: "make-concise", label: "Make Concise", prompt: "Rewrite this to be half the length while keeping the key message", mode: "polish" },
  { id: "make-professional", label: "Professionalize", prompt: "Rewrite this to sound more professional while keeping my voice", mode: "polish" },
];

interface TemplateLibraryProps {
  mode: Mode;
  onSelectTemplate: (prompt: string) => void;
}

export function TemplateLibrary({ mode, onSelectTemplate }: TemplateLibraryProps) {
  const filtered = templates.filter((t) => t.mode === mode);

  if (filtered.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {filtered.map((t, i) => (
        <motion.button
          key={t.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelectTemplate(t.prompt)}
          className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all"
        >
          {t.label}
        </motion.button>
      ))}
    </div>
  );
}
