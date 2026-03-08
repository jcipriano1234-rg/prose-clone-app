import { motion } from "framer-motion";
import { Fingerprint, Zap, Lock } from "lucide-react";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 surface-warm">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold text-primary uppercase tracking-widest text-center mb-3"
        >
          Features
        </motion.p>
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
              className="rounded-2xl border border-border bg-card p-8 shadow-card hover:shadow-soft transition-shadow duration-300"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-5">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
