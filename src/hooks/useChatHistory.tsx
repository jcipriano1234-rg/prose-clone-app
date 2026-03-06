import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/lib/stream-chat";

export interface ChatSession {
  id: string;
  title: string;
  mode: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("id, title, mode, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch sessions:", error);
      setLoading(false);
      return;
    }

    setSessions(
      (data || []).map((s) => ({
        id: s.id,
        title: s.title,
        mode: s.mode,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const loadSessionMessages = useCallback(async (sessionId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load messages:", error);
      return [];
    }

    return (data || []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }, []);

  const createSession = useCallback(async (mode: string, firstMessage: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const title = firstMessage.slice(0, 60) + (firstMessage.length > 60 ? "…" : "");

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id, title, mode })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create session:", error);
      return null;
    }

    const newSession: ChatSession = {
      id: data.id,
      title,
      mode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(data.id);
    return data.id;
  }, []);

  const saveMessage = useCallback(async (sessionId: string, role: "user" | "assistant", content: string) => {
    await supabase.from("chat_messages").insert({ session_id: sessionId, role, content });
    // Update session's updated_at
    await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
    // Move session to top
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === sessionId);
      if (idx <= 0) return prev;
      const session = { ...prev[idx], updatedAt: new Date() };
      return [session, ...prev.filter((_, i) => i !== idx)];
    });
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) setActiveSessionId(null);
  }, [activeSessionId]);

  const startNewSession = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    loading,
    loadSessionMessages,
    createSession,
    saveMessage,
    deleteSession,
    startNewSession,
  };
}
