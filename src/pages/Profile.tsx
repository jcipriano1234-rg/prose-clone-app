import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Zap, Crown, BookOpen, PenLine, BarChart3, Settings, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useStyleProfile } from "@/hooks/useStyleProfile";
import { useWritingSamples } from "@/hooks/useWritingSamples";
import { supabase } from "@/integrations/supabase/client";

const planConfig = {
  free: { label: "Free", color: "bg-muted text-muted-foreground", icon: User },
  pro: { label: "Pro", color: "bg-primary/10 text-primary", icon: Zap },
  team: { label: "Unlimited", color: "bg-accent text-accent-foreground", icon: Crown },
};

export default function Profile() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { balance, plan, isUnlimited } = useCredits();
  const { styleProfile } = useStyleProfile();
  const { samples, totalWordCount } = useWritingSamples();
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);

  const user = session?.user;
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email;
  const config = planConfig[plan] || planConfig.free;

  useEffect(() => {
    if (!user) return;
    // Fetch display name
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDisplayName((data as any).display_name || "");
      });

    // Fetch total generations
    supabase
      .from("credit_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("action", ["generation", "edit"])
      .then(({ count }) => {
        setTotalGenerations(count ?? 0);
      });
  }, [user]);

  const handleSaveName = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    setEditingName(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 flex items-center gap-3 border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6">
        <button
          onClick={() => navigate("/app")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to app</span>
          <span className="sm:hidden">Back</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Account Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full border-2 border-border shrink-0" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <User className="h-7 w-7 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0 w-full">
              {editingName ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-lg font-semibold font-serif bg-background border border-border rounded-lg px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-auto"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveName} className="text-xs text-primary font-medium hover:underline">Save</button>
                    <button onClick={() => setEditingName(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                  </div>
                </div>
              ) : (
                <h2
                  className="text-lg font-semibold font-serif text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setEditingName(true)}
                  title="Click to edit"
                >
                  {displayName || "Set your name"}
                </h2>
              )}
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shrink-0 ${config.color}`}>
              <config.icon className="h-3.5 w-3.5" />
              {config.label}
            </div>
          </div>
        </motion.div>

        {/* Credits Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            Credits
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-foreground">
              {isUnlimited ? "∞" : balance}
            </span>
            <span className="text-sm text-muted-foreground">
              {isUnlimited ? "Unlimited" : "credits remaining"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="rounded-xl bg-background border border-border p-3">
              <p className="text-lg font-bold text-foreground">3</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">per generation</p>
            </div>
            <div className="rounded-xl bg-background border border-border p-3">
              <p className="text-lg font-bold text-foreground">2</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">per edit</p>
            </div>
            <div className="rounded-xl bg-background border border-border p-3">
              <p className="text-lg font-bold text-foreground">1</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">per analysis</p>
            </div>
          </div>
          {plan === "free" && (
            <p className="mt-3 text-xs text-muted-foreground">Free plan: 3 credits/day. Upgrade for more.</p>
          )}
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            Usage Stats
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div>
              <p className="text-2xl font-bold font-serif text-foreground">{totalGenerations}</p>
              <p className="text-xs text-muted-foreground">Total generations</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-foreground">{samples.length}</p>
              <p className="text-xs text-muted-foreground">Writing samples</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-foreground">{totalWordCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Words analyzed</p>
            </div>
          </div>
        </motion.div>

        {/* Writing Style Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            Writing Style
          </h3>
          {styleProfile ? (
            <div className="space-y-4">
              {/* Personality Traits */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Personality</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(styleProfile.personality_traits) ? styleProfile.personality_traits : []).map((trait, i) => (
                    <span key={i} className="rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-background border border-border p-3">
                  <p className="text-sm font-semibold text-foreground">{styleProfile.formality_score}/100</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Formality</p>
                </div>
                <div className="rounded-xl bg-background border border-border p-3">
                  <p className="text-sm font-semibold text-foreground">{(styleProfile.vocabulary_richness * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vocab richness</p>
                </div>
              </div>

              {/* Top Words */}
              {Array.isArray(styleProfile.top_words) && styleProfile.top_words.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Top words</p>
                  <div className="flex flex-wrap gap-1.5">
                    {styleProfile.top_words.slice(0, 10).map((word, i) => (
                      <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <PenLine className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No style analysis yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add writing samples and your style will be automatically analyzed.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
