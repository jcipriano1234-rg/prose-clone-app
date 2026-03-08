import { motion } from "framer-motion";
import { PenLine, Fingerprint, Zap, Lock, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  {
    icon: Fingerprint,
    title: "Clones your exact voice",
    desc: "GhostInk learns your vocabulary, sentence rhythm, and personality quirks — then writes like you, not like a machine.",
  },
  {
    icon: Zap,
    title: "Learns your voice in seconds",
    desc: "Take a quick writing quiz or paste a few samples and GhostInk mirrors your tone, word choices, and style.",
  },
  {
    icon: Lock,
    title: "Your style, your privacy",
    desc: "Your writing samples stay private and secure. We use them only to match your voice.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    features: ["5 generations / day", "1 writing profile", "Email & essay modes"],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    features: [
      "Unlimited generations",
      "Unlimited writing profiles",
      "All modes + Polish",
      "Priority speed",
      "Export & history",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/mo",
    features: [
      "Everything in Pro",
      "5 team seats",
      "Shared style library",
      "Admin dashboard",
    ],
    cta: "Contact us",
    highlighted: false,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-semibold">GhostInk</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Get started <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6"
          >
            <Fingerprint className="h-3.5 w-3.5" />
            Your voice, perfectly cloned
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
          >
            Write with AI.
            <br />
            <span className="text-gradient-brand">Sound like you.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            GhostInk clones your writing style so perfectly that every word
            sounds like <em>you</em> wrote it. Take a quick quiz, describe what
            you need, and get content in your exact voice.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="text-base px-8 h-12 rounded-xl shadow-soft"
              onClick={() => navigate("/auth")}
            >
              Start writing free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo visual */}
      <section className="pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
              <div className="h-3 w-3 rounded-full bg-destructive/40" />
              <div className="h-3 w-3 rounded-full bg-primary/30" />
              <div className="h-3 w-3 rounded-full bg-accent-foreground/20" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">ghostink</span>
            </div>
            <div className="p-8 sm:p-12 grid sm:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Your writing sample
                </p>
                <p className="text-sm text-foreground/70 leading-relaxed italic">
                  "So yeah the whole thing with basketball manufacturing is honestly
                  kinda wild when you think about it. Like they literally start from
                  the inside out and every single layer matters..."
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">
                  GhostInk output
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  "Ok so remote work — honestly it's one of those things where once
                  you try it you can't really go back? Like the whole commute thing
                  alone is enough to convince most people but there's way more to it
                  than just skipping traffic..."
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 surface-warm">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-serif text-3xl sm:text-4xl font-bold text-center mb-16"
          >
            Why writers switch to GhostInk
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="rounded-2xl border border-border bg-card p-8 shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-5">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="font-serif text-2xl sm:text-3xl font-semibold leading-snug">
              "I used GhostInk for my college essays and{" "}
              <span className="text-primary">my professor said it was my best writing yet.</span>{" "}
              It genuinely sounds exactly like me."
            </p>
            <div className="text-sm text-muted-foreground">
              — College senior, English major
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 surface-warm">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-center mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-md mx-auto">
            Start free. Upgrade when you need more power.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-primary bg-card shadow-lg ring-2 ring-primary/20 scale-[1.02]"
                    : "border-border bg-card shadow-card"
                }`}
              >
                {plan.highlighted && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                    Most popular
                  </span>
                )}
                <h3 className="font-serif text-xl font-bold">{plan.name}</h3>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full rounded-xl"
                  onClick={() => navigate("/auth")}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Your words. Your voice. Effortless.
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of writers who use GhostInk to create authentic
            content in their own voice — faster than ever.
          </p>
          <Button
            size="lg"
            className="text-base px-10 h-12 rounded-xl shadow-soft"
            onClick={() => navigate("/auth")}
          >
            Try GhostInk free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            <span className="font-medium">GhostInk</span>
          </div>
          <span>© {new Date().getFullYear()} GhostInk. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
