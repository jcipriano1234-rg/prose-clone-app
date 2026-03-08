import { motion } from "framer-motion";
import { Fingerprint, ArrowRight } from "lucide-react";
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

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-56 h-56 rounded-full bg-accent/30 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
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
  );
}
