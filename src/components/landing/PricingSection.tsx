import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
                {plan.highlighted && <ArrowRight className="ml-1 h-3.5 w-3.5" />}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
