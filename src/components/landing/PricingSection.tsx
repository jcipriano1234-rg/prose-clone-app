import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sharedFeatures = [
  "All writing modes",
  "Generation, editing & analysis",
  "Style cloning & voice profiles",
  "Export & chat history",
];

const creditCosts = "3 credits per generation · 2 per edit · 1 per analysis";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    credit: "3 credits / day",
    creditNote: "Resets daily",
    extras: [],
    cta: "Get started free",
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/mo",
    credit: "300 credits / month",
    creditNote: "Resets monthly",
    extras: ["Priority speed"],
    cta: "Start free trial",
  },
  {
    name: "Team",
    price: "$11.99",
    period: "/mo",
    credit: "Unlimited credits",
    creditNote: "No limits",
    extras: ["Priority speed", "Shared style library", "Admin dashboard"],
    cta: "Contact us",
  },
];
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

export default function PricingSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 surface-warm">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold text-primary uppercase tracking-widest text-center mb-3"
        >
          Pricing
        </motion.p>
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
              className="rounded-2xl border border-border bg-card p-8 flex flex-col shadow-card"
            >
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
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => navigate("/auth")}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          {creditCosts}
        </p>
      </div>
    </section>
  );
}
