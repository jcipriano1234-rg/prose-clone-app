import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

export function ModeCard({ icon: Icon, title, description, active, onClick }: ModeCardProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-xl p-5 text-left transition-all duration-200 border ${
        active
          ? "border-primary bg-accent shadow-card"
          : "border-border bg-card hover:border-primary/30 hover:shadow-soft"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-sans text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.button>
  );
}
