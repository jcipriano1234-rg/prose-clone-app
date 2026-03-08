import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { writingSamples, mode, prompt, history, tone } = await req.json();
    const formality = tone?.formality ?? 30;
    const length = tone?.length ?? 50;
    const creativity = tone?.creativity ?? 50;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const hasSamples = writingSamples && writingSamples.trim().length > 20;

    const sampleLines = hasSamples
      ? writingSamples
          .split(/\n+/)
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 30 && !/^\d+[\.)]/.test(line))
      : [];

    const cadenceSnippets = sampleLines.slice(0, 5).map((line: string) =>
      line
        .replace(/\s+/g, " ")
        .slice(0, 140)
        .trim()
    );

    const systemPrompt = hasSamples
      ? `You are a voice-clone writer. Match the person's writing DNA from the samples exactly.

Non-negotiables:
- Mirror their vocabulary level, punctuation habits, rhythm, and paragraph shape.
- Keep their natural imperfections when appropriate (slightly uneven phrasing, occasional repetition, informal transitions) unless the user asks for formal perfection.
- Do NOT smooth everything into polished "assistant" writing.
- Never use generic AI-transition language unless it appears in the samples.
- Prefer concrete wording over abstract filler.
- Keep sentence lengths mixed and irregular.
- Use qualifiers only if they do in samples (like "I think", "I feel", "from what I've seen").
- If writing an email, keep it like a real person wrote it in one pass, not a template.

Hard banned unless present in samples:
moreover, furthermore, consequently, in addition, delve, utilize, pivotal, paramount, comprehensive, multifaceted, nuanced, streamline, harness, leverage, foster, facilitate, "it is important to note"

Reference cadence snippets from their real writing:
${cadenceSnippets.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

Full writing samples (source of truth):
---
${writingSamples}
---

Tone dials:
- Formality: ${formality}/100 (${formality < 30 ? "very casual" : formality < 60 ? "conversational" : formality < 80 ? "professional" : "formal"})
- Length: ${length}/100 (${length < 30 ? "concise" : length < 60 ? "standard" : length < 80 ? "detailed" : "long-form"})
- Creativity: ${creativity}/100 (${creativity < 30 ? "conventional" : creativity < 60 ? "balanced" : creativity < 80 ? "playful" : "experimental"})

Output only final text. No explanations.`
      : `You're a natural writing assistant.

Write like a real person, not a polished template:
- Use mixed sentence lengths and natural paragraph variation.
- Use everyday wording.
- Avoid generic AI transitions and inflated vocabulary.
- Keep the tone clear, direct, and human.

Tone dials:
- Formality: ${formality}/100 (${formality < 30 ? "very casual" : formality < 60 ? "conversational" : formality < 80 ? "professional" : "formal"})
- Length: ${length}/100 (${length < 30 ? "concise" : length < 60 ? "standard" : length < 80 ? "detailed" : "long-form"})
- Creativity: ${creativity}/100 (${creativity < 30 ? "conventional" : creativity < 60 ? "balanced" : creativity < 80 ? "playful" : "experimental"})

Output only final text. No explanations.`;

    let taskPrompt = "";
    if (mode === "email") {
      taskPrompt = `Write an email in this person's exact writing style. The email should be about: ${prompt}\n\nWrite the full email with subject line, greeting, body, and sign-off — all matching their style.`;
    } else if (mode === "essay") {
      taskPrompt = `Write an essay or long-form piece in this person's exact writing style. The topic is: ${prompt}\n\nMake it feel natural and authentic to how they would actually write this.`;
    } else if (mode === "polish") {
      taskPrompt = `Here is a draft that needs to be rewritten/polished to sound like this person wrote it:\n\n${prompt}\n\nRewrite it completely in their voice and style while keeping the core message.`;
    } else if (mode === "freeform") {
      taskPrompt = `Write the following in this person's exact writing style. The request is: ${prompt}\n\nThis could be anything — a cover letter, social media post, speech, article, message, or any other type of writing. Match their voice, quirks, and style perfectly. Make it feel like they actually wrote it.`;
    }

    // Build messages array with conversation history
    const chatMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    const conversationHistory = Array.isArray(history) ? history : [];
    if (conversationHistory.length > 0) {
      // First message in history was the original request - add it with the task prompt framing
      for (let i = 0; i < conversationHistory.length; i++) {
        const msg = conversationHistory[i];
        if (i === 0 && msg.role === "user") {
          // Frame the first user message with the mode-specific task prompt
          chatMessages.push({ role: "user", content: taskPrompt.replace(prompt, msg.content) });
        } else {
          chatMessages.push({ role: msg.role, content: msg.content });
        }
      }
      // Current message is a follow-up
      chatMessages.push({ role: "user", content: prompt });
    } else {
      // First message - use the task prompt
      chatMessages.push({ role: "user", content: taskPrompt });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: chatMessages,
          temperature: 1.15,
          top_p: 0.95,
          frequency_penalty: 0.5,
          presence_penalty: 0.35,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ghost-write error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
