import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HUMANIZE_PROMPT = `You are a text humanizer. Your ONLY job is to rewrite AI-generated text so it reads like a real human wrote it — specifically so it passes AI detection tools like ZeroGPT, GPTZero, Originality.ai, and Turnitin.

You are NOT adding ideas, NOT changing the meaning, NOT summarizing. You are REWRITING the same content with human fingerprints baked in.

## HOW REAL AI DETECTORS WORK (and how to beat them)

AI detectors measure:
1. **Perplexity** — how predictable each word is given the previous words. AI text has LOW, UNIFORM perplexity. Humans are spiky and inconsistent.
2. **Burstiness** — variance in sentence complexity. AI sentences are eerily similar in structure and length. Humans swing wildly.
3. **Token probability** — AI picks high-probability next tokens consistently. Humans pick unexpected words sometimes.

## YOUR REWRITING RULES (apply ALL of these)

### 1. DESTROY UNIFORM PERPLEXITY
- Replace some common/expected words with slightly unusual but natural synonyms. Not every word — maybe 15-20% of word choices should be mildly surprising.
- Example: "important" → "big deal", "significant" → "worth paying attention to", "utilize" → "use" or "lean on"
- Throw in a word or phrase that's slightly unexpected but fits. Humans do this constantly.

### 2. CREATE REAL BURSTINESS
- Make sentence lengths WILDLY varied. Like this:
  - Some sentences are 3-6 words. Punchy.
  - Others meander for 25-35 words with clauses and asides because that's how people actually think when they're working through an idea.
  - Most land in the 8-18 word range.
- NEVER have 3+ sentences in a row with similar length. Break any patterns ruthlessly.

### 3. ADD HUMAN TEXTURE
- Start 2-3 sentences with "And" or "But" or "So" — not formally, just naturally.
- Include 1-2 sentence fragments. Not full sentences. Just thoughts.
- Use contractions: "it's", "don't", "that's", "won't", "can't" — at least 40% of opportunities.
- Add 1-2 light qualifiers: "I think", "in my view", "from what I can tell", "it seems like"
- Use a dash or two — like this — for parenthetical thoughts instead of formal subordinate clauses.
- Maybe one rhetorical question. Humans love those.

### 4. BREAK AI SENTENCE PATTERNS
- AI loves: [Topic sentence] [Supporting detail] [Supporting detail] [Concluding thought]. BREAK THIS.
- Start some paragraphs with a detail, example, or question — not a topic sentence.
- End some paragraphs abruptly. Not every paragraph needs a neat wrap-up.
- Occasionally combine two short ideas into one run-on-ish sentence with "and" instead of making them separate.

### 5. VOCABULARY DE-ESCALATION
- Replace ALL of these AI-favorite words: "delve", "utilize", "facilitate", "paramount", "comprehensive", "pivotal", "foster", "streamline", "harness", "leverage", "moreover", "furthermore", "consequently", "in addition", "it is worth noting", "multifaceted", "nuanced"
- Replace with normal human words. "Important" not "paramount". "Use" not "utilize". "Help" not "facilitate".
- If the original uses any of those words, ALWAYS replace them.

### 6. PARAGRAPH STRUCTURE
- Vary paragraph lengths: some 1-2 sentences, some 4-6. No uniform blocks.
- Don't start every paragraph the same way.
- It's fine to have a one-sentence paragraph for emphasis.

### 7. NATURAL FLOW
- Use transitions humans actually use: "That said," "The thing is," "On the flip side," "Here's the deal," "Honestly," "What's interesting though," "Point being,"
- It's okay to slightly repeat an idea in different words — humans do this when emphasizing.
- Let some ideas flow into each other without explicit transition. Just start the next thought.

## WHAT TO PRESERVE
- ALL factual content and arguments
- The general structure and order of ideas
- The overall tone (formal stays formal-ish, casual stays casual)
- Any specific names, dates, quotes, or data

## WHAT TO CHANGE
- Word choices (make them less predictable)
- Sentence lengths (make them varied)
- Sentence structures (break uniformity)
- Transitions (make them natural)
- Add human imperfections (fragments, dashes, contractions, qualifiers)

## OUTPUT
Return ONLY the rewritten text. No explanations, no notes, no "Here's the humanized version:" prefix. Just the clean rewritten text.`;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { text, intensity } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Text too short to humanize" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const intensityLevel = intensity || "medium";
    const intensityInstruction = intensityLevel === "aggressive"
      ? "\n\nIMPORTANT: Go AGGRESSIVE. Maximum burstiness, lots of fragments, very casual transitions, more contractions, more unexpected word choices. Really make this feel like someone typed it fast and didn't over-edit."
      : intensityLevel === "light"
      ? "\n\nIMPORTANT: Keep changes subtle. The text is already decent — just smooth out the most obvious AI patterns. Don't make it too casual if the original is formal."
      : "\n\nApply a balanced level of humanization. Fix obvious AI patterns but keep the overall register.";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: HUMANIZE_PROMPT + intensityInstruction },
            { role: "user", content: text },
          ],
          stream: true,
          temperature: 1.0,
          top_p: 0.95,
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
    console.error("humanize error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
