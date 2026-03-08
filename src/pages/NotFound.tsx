import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PenLine, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <PenLine className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-serif text-5xl font-bold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist. Let's get you back on track.</p>
        <Button onClick={() => navigate("/")} className="rounded-xl gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
