import { Mail, FileText, Sparkles, PenLine, Plus, BookOpen, ChevronDown, Clock, Trash2, LogOut, MessageSquare } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import type { ChatSession } from "@/hooks/useChatHistory";

type Mode = "email" | "essay" | "polish" | "freeform";

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
  chatSessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const modes = [
  { id: "email" as Mode, icon: Mail, title: "Ghost-Write Email", description: "Compose emails in your voice" },
  { id: "essay" as Mode, icon: FileText, title: "Write Essay", description: "Long-form pieces, your style" },
  { id: "polish" as Mode, icon: Sparkles, title: "Polish Text", description: "Rewrite anything as you" },
  { id: "freeform" as Mode, icon: PenLine, title: "Freeform Writing", description: "Any type of writing, your style" },
];

export function AppSidebar({
  mode, onModeChange, onNewSession,
  samples, onAddSample, onRemoveSample, totalWordCount,
  chatSessions, activeSessionId, onSelectSession, onDeleteSession,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [newSampleText, setNewSampleText] = useState("");
  const { signOut } = useAuth();
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PenLine className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-serif text-lg font-semibold text-foreground truncate">GhostInk</h1>
              <p className="text-[11px] text-muted-foreground truncate">AI that writes like you</p>
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
                  className="gap-3 rounded-lg border border-dashed border-border bg-card hover:bg-accent transition-colors"
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

        {/* Chat History */}
        {!collapsed && (
          <SidebarGroup>
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger className="w-full">
                <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center justify-between w-full cursor-pointer hover:text-foreground transition-colors">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat History
                    {chatSessions.length > 0 && (
                      <span className="text-[10px] font-normal rounded-full bg-primary/10 text-primary px-1.5 py-0.5">
                        {chatSessions.length}
                      </span>
                    )}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="mt-2 space-y-1 px-1">
                  {chatSessions.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-2">
                      No conversations yet.
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {chatSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`group flex items-start gap-2 rounded-md p-2 text-xs cursor-pointer transition-colors ${
                            activeSessionId === session.id
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-card border border-border hover:bg-accent"
                          }`}
                          onClick={() => onSelectSession(session.id)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground truncate font-medium">{session.title}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {session.updatedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 mt-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
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
                      className="w-full rounded-lg bg-primary text-primary-foreground text-xs font-medium py-1.5 hover:opacity-90 disabled:opacity-40 transition-all"
                    >
                      Add Sample
                    </button>
                  </div>

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

      <SidebarFooter className="p-4 space-y-2">
        {!collapsed && totalWordCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-card p-3 border border-border">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-foreground">
                {totalWordCount} words loaded
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{samples.length} sample{samples.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              tooltip="Sign out"
              className="gap-3 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="text-sm">Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
