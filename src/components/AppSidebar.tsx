import { Mail, FileText, Sparkles, PenLine, Plus, BookOpen } from "lucide-react";
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

type Mode = "email" | "essay" | "polish";

interface AppSidebarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onNewSession: () => void;
  wordCount: number;
}

const modes = [
  { id: "email" as Mode, icon: Mail, title: "Ghost-Write Email", description: "Compose emails in your voice" },
  { id: "essay" as Mode, icon: FileText, title: "Write Essay", description: "Long-form pieces, your style" },
  { id: "polish" as Mode, icon: Sparkles, title: "Polish Text", description: "Rewrite anything as you" },
];

export function AppSidebar({ mode, onModeChange, onNewSession, wordCount }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

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
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2 rounded-lg bg-card p-3 border border-border">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[11px] text-muted-foreground truncate">Style samples</p>
              <p className="text-xs font-medium text-foreground">
                {wordCount > 0 ? `${wordCount} words loaded` : "No samples yet"}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
