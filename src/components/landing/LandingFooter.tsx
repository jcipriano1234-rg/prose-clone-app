import { PenLine } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-primary" />
          <span className="font-medium">GhostInk</span>
        </div>
        <span>© {new Date().getFullYear()} GhostInk. All rights reserved.</span>
      </div>
    </footer>
  );
}
