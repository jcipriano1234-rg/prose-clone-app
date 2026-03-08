import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function TestimonialSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <Quote className="h-8 w-8 text-primary/30 mx-auto" />
          <p className="font-serif text-2xl sm:text-3xl font-semibold leading-snug">
            I used GhostInk for my college essays and{" "}
            <span className="text-primary">my professor said it was my best writing yet.</span>{" "}
            It genuinely sounds exactly like me.
          </p>
          <div className="text-sm text-muted-foreground">
            — College senior, English major
          </div>
        </motion.div>
      </div>
    </section>
  );
}
