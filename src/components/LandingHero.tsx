import { motion } from "framer-motion";
import { PenLine, Shield, Zap, Users, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const socialProofAvatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=writer1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=student2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=creative3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=pro4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=exec5",
];

const testimonials = [
  {
    text: "My professor couldn't tell the difference. GhostInk nailed my writing voice perfectly.",
    author: "Alex R.",
    role: "Graduate Student",
    stars: 5,
  },
  {
    text: "I write 40+ emails a day. This saves me 3 hours and they all sound like me.",
    author: "Sarah K.",
    role: "Sales Director",
    stars: 5,
  },
  {
    text: "Finally — AI that doesn't sound like AI. Passed every detector I threw at it.",
    author: "Marcus T.",
    role: "Content Creator",
    stars: 5,
  },
];

const features = [
  { icon: Shield, label: "Undetectable", desc: "Bypasses GPTZero, Turnitin & more" },
  { icon: Zap, label: "Instant", desc: "Full emails & essays in seconds" },
  { icon: PenLine, label: "Your voice", desc: "Learns your exact writing DNA" },
];

export function LandingHero() {
  const { setOpen } = useSidebar();

  return (
    <div className="flex h-full items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full space-y-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-5"
        >
          {/* Badge — Bandwagon Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground"
          >
            <Users className="h-3.5 w-3.5" />
            Trusted by 12,000+ writers worldwide
          </motion.div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
            AI that writes{" "}
            <span className="text-gradient-brand">exactly</span>{" "}
            like you
          </h1>

          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Paste your writing. Pick a mode. Get perfectly human content that passes
            every AI detector — because it sounds like <em>you</em>, not a machine.
          </p>

          {/* CTA — Serial Position Effect (strong CTA last in hero) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all"
            style={{ background: "var(--gradient-brand)" }}
          >
            Start writing — it's free
            <ArrowRight className="h-4 w-4" />
          </motion.button>

          {/* Social proof faces — Bandwagon */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {socialProofAvatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-7 w-7 rounded-full border-2 border-background"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">4.9 ★</span> from 2,400+ reviews
            </p>
          </div>
        </motion.div>

        {/* Feature pills — Halo Effect (sleek design = trustworthy) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          {features.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-card text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">{f.label}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials — Confirmation Bias + Bandwagon */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-3"
        >
          <p className="text-center text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
            What writers are saying
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="rounded-xl border border-border bg-card p-4 shadow-card space-y-2"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-xs text-foreground leading-relaxed">"{t.text}"</p>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">{t.author}</span> · {t.role}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust bar — Mere Exposure (branding consistency) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground"
        >
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No sign-up required</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Passes GPTZero & Turnitin</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Your data stays private</span>
        </motion.div>
      </div>
    </div>
  );
}
