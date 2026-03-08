import { motion } from "framer-motion";

export default function DemoSection() {
  return (
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
            <div className="relative">
              <div className="absolute -inset-3 rounded-xl bg-primary/5 -z-10" />
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">
                GhostInk output ✨
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
  );
}
