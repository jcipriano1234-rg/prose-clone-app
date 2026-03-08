import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  const navigate = useNavigate();

  return (
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
  );
}
