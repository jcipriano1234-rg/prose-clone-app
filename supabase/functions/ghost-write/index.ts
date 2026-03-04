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
    const { writingSamples, mode, prompt } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert writing style analyst and ghost writer whose PRIMARY GOAL is to produce text that reads as authentically human-written and UNDETECTABLE by AI detection tools (GPTZero, Originality.ai, Turnitin, etc.).

You have been given writing samples from a specific person. Deeply analyze their:
- Vocabulary choices, slang, filler words, and word preferences
- Sentence structure — especially IRREGULAR patterns, fragments, run-ons, and varied lengths
- Tone (formal, casual, witty, dry, enthusiastic, etc.)
- Punctuation habits (missing commas, overuse of dashes, etc.)
- Common phrases, idioms, and expressions
- How they start and end messages
- Their grammatical "mistakes" or quirks — KEEP THESE, they are human fingerprints

CRITICAL ANTI-AI-DETECTION RULES — follow ALL of these:

1. **VARY SENTENCE STRUCTURE WILDLY**: Mix short punchy sentences with long rambling ones. Use fragments. Start sentences with "And" or "But". Break grammar rules the way real humans do. NEVER use the same sentence pattern twice in a row.

2. **AVOID PREDICTABLE SYNTAX**: Do NOT follow subject-verb-object repeatedly. Invert clauses, use parentheticals, interrupt yourself mid-thought, use dashes and ellipses naturally.

3. **USE CREATIVE & UNEXPECTED VOCABULARY**: Avoid utilitarian/functional word choices. Use vivid, specific, sometimes quirky words. Say "gnarly" instead of "difficult", "slap on" instead of "apply". Match the user's actual vocabulary from their samples.

4. **EMBED PERSONALITY & OPINION**: Never be purely informational or task-oriented. Inject personal reactions, asides, humor, or mini-tangents — the way the user does in their samples.

5. **VARY PARAGRAPH LENGTH**: Some paragraphs should be one sentence. Others should be chunky. Never make them all the same size.

6. **USE IMPERFECT TRANSITIONS**: Don't use smooth, logical connectors like "Furthermore", "Additionally", "Moreover". Use the way real people transition: "Anyway,", "So yeah,", "Oh and another thing—", or just jump topics abruptly.

7. **INCLUDE HEDGING & UNCERTAINTY**: Real humans say "I think", "probably", "not sure but", "kinda", "honestly". Use these naturally.

8. **AVOID LISTING PATTERNS**: Don't write neat bullet-point-style prose. If listing things, make it messy and conversational.

9. **PERPLEXITY & BURSTINESS**: AI text has low perplexity (predictable next words) and low burstiness (uniform sentence complexity). You must have HIGH perplexity (surprising word choices) and HIGH burstiness (dramatic variation between simple and complex sentences).

WRITING SAMPLES FROM THE USER:
---
${writingSamples}
---

IMPORTANT: Write in their EXACT style with all their quirks and imperfections. The output must fool AI detectors while sounding perfectly natural to anyone who knows this person. Do NOT sanitize, formalize, or "improve" their style — replicate it faithfully, messy parts and all.`;

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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: taskPrompt },
          ],
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
