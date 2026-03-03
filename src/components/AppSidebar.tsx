import { Mail, FileText, Sparkles, PenLine, Plus, BookOpen, ChevronDown, Clock, Trash2, Shield, TrendingUp } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

type Mode = "email" | "essay" | "polish";

export interface WritingSample {
  id: string;
  text: string;
  addedAt: Date;
  wordCount: number;
}

interface AppSidebarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onNewSession: () => void;
  samples: WritingSample[];
  onAddSample: (text: string) => void;
  onRemoveSample: (id: string) => void;
  totalWordCount: number;
}

const modes = [
  { id: "email" as Mode, icon: Mail, title: "Ghost-Write Email", description: "Compose emails in your voice" },
  { id: "essay" as Mode, icon: FileText, title: "Write Essay", description: "Long-form pieces, your style" },
  { id: "polish" as Mode, icon: Sparkles, title: "Polish Text", description: "Rewrite anything as you" },
];

// IKEA Effect — progress steps make users feel invested
function StyleStrengthMeter({ wordCount, sampleCount }: { wordCount: number; sampleCount: number }) {
  const strength = wordCount === 0 ? 0 : wordCount < 100 ? 1 : wordCount < 300 ? 2 : wordCount < 600 ? 3 : 4;
  const labels = ["No data", "Weak", "Learning", "Strong", "Expert"];
  const colors = [
    "bg-muted",
    "bg-destructive",
    "bg-yellow-500",
    "bg-primary",
    "bg-green-500",
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          Style Strength
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          strength >= 3 ? "bg-primary/10 text-primary" : strength >= 2 ? "bg-yellow-500/10 text-yellow-600" : "bg-muted text-muted-foreground"
        }`}>
          {labels[strength]}
        </span>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < strength ? colors[strength] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {strength === 0 && "Add writing samples to get started"}
        {strength === 1 && "Add more samples for better results"}
        {strength === 2 && "Getting there — a few more samples helps"}
        {strength === 3 && "Great coverage of your writing style"}
        {strength === 4 && "Maximum accuracy — your voice is locked in"}
      </p>
    </div>
  );
}

export function AppSidebar({ mode, onModeChange, onNewSession, samples, onAddSample, onRemoveSample, totalWordCount }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [newSampleText, setNewSampleText] = useState("");
  const [samplesOpen, setSamplesOpen] = useState(true);

  const handleSubmitSample = () => {
    if (newSampleText.trim()) {
      onAddSample(newSampleText.trim());
      setNewSampleText("");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <PenLine className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-serif text-lg font-bold text-foreground truncate">GhostInk</h1>
              <p className="text-[11px] text-muted-foreground truncate">Undetectable AI writing</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* New Session */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onNewSession}
                  className="gap-3 rounded-xl border border-dashed border-border bg-card hover:bg-accent transition-colors"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  {!collapsed && <span className="text-sm font-medium">New Session</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Writing Mode */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Writing Mode
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modes.map((m) => (
                <SidebarMenuItem key={m.id}>
                  <SidebarMenuButton
                    onClick={() => onModeChange(m.id)}
                    isActive={mode === m.id}
                    tooltip={m.title}
                    className="gap-3"
                  >
                    <m.icon className="h-4 w-4" />
                    {!collapsed && (
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{m.title}</span>
                        <span className="text-[11px] text-muted-foreground truncate">{m.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* IKEA Effect — Style Strength Meter */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupContent className="px-2">
              <StyleStrengthMeter wordCount={totalWordCount} sampleCount={samples.length} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Writing Samples */}
        {!collapsed && (
          <SidebarGroup>
            <Collapsible open={samplesOpen} onOpenChange={setSamplesOpen}>
              <CollapsibleTrigger className="w-full">
                <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center justify-between w-full cursor-pointer hover:text-foreground transition-colors">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Writing Samples
                    {totalWordCount > 0 && (
                      <span className="text-[10px] font-normal rounded-full bg-primary/10 text-primary px-1.5 py-0.5">
                        {totalWordCount}w
                      </span>
                    )}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${samplesOpen ? "rotate-180" : ""}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="mt-2 space-y-2 px-1">
                  {/* Add new sample */}
                  <div className="space-y-1.5">
                    <textarea
                      value={newSampleText}
                      onChange={(e) => setNewSampleText(e.target.value)}
                      placeholder="Paste your writing here…"
                      className="w-full resize-none rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all h-20"
                    />
                    <button
                      onClick={handleSubmitSample}
                      disabled={!newSampleText.trim()}
                      className="w-full rounded-lg text-primary-foreground text-xs font-medium py-1.5 hover:opacity-90 disabled:opacity-40 transition-all"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      Add Sample
                    </button>
                  </div>

                  {/* Sample history */}
                  {samples.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">
                        Submitted ({samples.length})
                      </p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {samples.map((sample) => (
                          <div
                            key={sample.id}
                            className="group flex items-start gap-2 rounded-md bg-card border border-border p-2 text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground truncate">{sample.text.slice(0, 60)}…</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {sample.addedAt.toLocaleDateString()} · {sample.wordCount}w
                              </p>
                            </div>
                            <button
                              onClick={() => onRemoveSample(sample.id)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 mt-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {samples.length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-2">
                      No samples yet. Add your writing above.
                    </p>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer — Mere Exposure (consistent trust branding) */}
      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="space-y-2">
            {totalWordCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-card p-3 border border-border">
                <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-foreground">
                    {totalWordCount} words loaded
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{samples.length} sample{samples.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3" />
              Private & encrypted
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
