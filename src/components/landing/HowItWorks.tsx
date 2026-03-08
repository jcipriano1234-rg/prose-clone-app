import { motion } from "framer-motion";
import { MessageSquareText, Brain, Sparkles } from "lucide-react";

const steps = [
  {
    icon: MessageSquareText,
    step: "01",
    title: "Share your voice",
    desc: "Take a 2-minute writing quiz or paste a few samples of your writing.",
  },
  {
    icon: Brain,
    step: "02",
    title: "We learn your style",
    desc: "GhostInk analyzes your vocabulary, tone, sentence rhythm, and quirks.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Write like you",
    desc: "Tell us what you need — emails, essays, posts — and get drafts in your voice.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold text-primary uppercase tracking-widest text-center mb-3"
        >
          How it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-serif text-3xl sm:text-4xl font-bold text-center mb-16"
        >
          Three steps to your voice
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden sm:block absolute top-14 left-[16.67%] right-[16.67%] h-px bg-border" />

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="text-center relative"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto mb-5 relative z-10">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-2 block">
                Step {s.step}
              </span>
              <h3 className="font-serif text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
