import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { writingSamples, mode, prompt, history, tone, styleProfile } = await req.json();
    const formality = tone?.formality ?? 30;
    const length = tone?.length ?? 50;
    const creativity = tone?.creativity ?? 50;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // --- Daily limit check ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Get daily limit from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("daily_limit")
      .eq("user_id", userId)
      .single();

    const dailyLimit = profile?.daily_limit ?? 5;

    // Count today's generations using the DB function
    const { data: countData } = await supabase.rpc("get_daily_generation_count", { p_user_id: userId });
    const todayCount = countData ?? 0;

    if (todayCount >= dailyLimit) {
      return new Response(
        JSON.stringify({
          error: "Daily generation limit reached. Upgrade to Pro for unlimited generations.",
          limit_reached: true,
          used: todayCount,
          limit: dailyLimit,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log this generation
    await supabase.from("generation_logs").insert({ user_id: userId, mode });

    // --- Build prompt ---
    const hasSamples = writingSamples && writingSamples.trim().length > 20;

    // Build style analysis context if available
    let styleContext = "";
    if (styleProfile && typeof styleProfile === "object" && styleProfile.raw_analysis) {
      styleContext = `\n\nSTYLE ANALYSIS (use this to fine-tune your voice cloning):\n${styleProfile.raw_analysis}\n`;
    }

    const systemPrompt = hasSamples
      ? `You are a voice-clone writer. Your ONLY job is to write exactly like the person whose samples are below. Not "inspired by" — you must BE them on paper.

PRIORITY ORDER (most important first):

1. VOCABULARY — This is #1. Study every word they use. If they say "stuff" you say "stuff", not "materials". If they say "got" you never say "received". If they say "cool" you don't say "interesting". Only use words that THEY would actually use. If a word feels too fancy or too simple for them, swap it. Build a mental dictionary of THEIR words and ONLY pull from it.

2. TONE & PERSONALITY — Are they confident or uncertain? Do they hedge ("I think", "I feel", "maybe") or state things directly? Are they enthusiastic or laid-back? Funny or serious? Sarcastic or earnest? Match their energy exactly.

3. WRITING STYLE — Their sentence lengths, how they structure paragraphs, whether they use long run-ons or short punchy lines. Do they use contractions? Do they start sentences with "And" or "But"? Do they use commas a lot or barely at all? Copy their exact patterns.

4. Their transitions — do they say "so" or "anyway" or just jump to the next idea? If they never use fancy connectors, you never use them either.

5. What they DON'T do — If they never use metaphors, you don't. If they never write formally, you don't. If they never use big words, you keep it simple.

6. ABSOLUTELY NO SLANG — Never use slang, internet abbreviations, or informal shorthand (e.g. "tbh", "ngl", "lowkey", "bruh", "vibe", "fire", "slay", "cap", "bet", "fr", "imo"). Even if slang appears in their writing samples, convert it to clean, natural language that still matches their voice. The output must always read as proper, natural writing — casual is fine, but slang is not.

The samples are the absolute truth (except slang — always clean that up). Every word choice you make should pass this test: "Would THIS person actually write this word, and is it proper language?" If the answer is no, change it.
${styleContext}
Writing samples:
---
${writingSamples}
---

Tone dials (apply on top of their voice):
- Formality: ${formality}/100 (${formality < 30 ? "very casual" : formality < 60 ? "conversational" : formality < 80 ? "professional" : "formal"})
- Length: ${length}/100 (${length < 30 ? "concise" : length < 60 ? "standard" : length < 80 ? "detailed" : "long-form"})
- Creativity: ${creativity}/100 (${creativity < 30 ? "conventional" : creativity < 60 ? "balanced" : creativity < 80 ? "playful" : "experimental"})

Output only final text. No explanations.`
      : `You're a writing assistant. Write clearly and naturally.

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

    const chatMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    const conversationHistory = Array.isArray(history) ? history : [];
    if (conversationHistory.length > 0) {
      for (let i = 0; i < conversationHistory.length; i++) {
        const msg = conversationHistory[i];
        if (i === 0 && msg.role === "user") {
          chatMessages.push({ role: "user", content: taskPrompt.replace(prompt, msg.content) });
        } else {
          chatMessages.push({ role: msg.role, content: msg.content });
        }
      }
      chatMessages.push({ role: "user", content: prompt });
    } else {
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
          temperature: 0.9,
          top_p: 0.92,
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
