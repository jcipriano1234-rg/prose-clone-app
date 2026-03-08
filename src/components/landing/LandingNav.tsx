import { PenLine, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingNav() {
  const navigate = useNavigate();

  return (
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
  );
}
