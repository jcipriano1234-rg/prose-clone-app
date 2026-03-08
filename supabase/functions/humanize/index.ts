import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Written in a casual voice ON PURPOSE — LLMs mirror prompt style
const HUMANIZE_PROMPT = `Ok so here's the deal. You're gonna take whatever text I give you and rewrite it so it sounds like an actual person wrote it. Not an AI. Not ChatGPT. Not some polished essay machine. A real human being who types fast, thinks out loud, and doesn't obsess over perfect structure.

Why? Because AI detectors (ZeroGPT, GPTZero, Originality, Turnitin) catch text that's too uniform, too predictable, too "clean." They measure how predictable each word is and how similar all the sentences look. AI text is weirdly consistent — same sentence lengths, same rhythm, same vocabulary patterns. Humans are messy and inconsistent. That's what you need to be.

Here's what you gotta do:

Sentence lengths — go wild. Some sentences? Four words. Done. Others should ramble a bit, like when you're explaining something and you keep adding clauses because the thought isn't quite finished yet and you want to make sure the reader gets it. Most should land somewhere in the middle. But NEVER let three sentences in a row be roughly the same length. That's the #1 thing detectors catch.

Paragraphs — same deal. One sentence paragraph sometimes. Then a chunky 5-6 sentence paragraph. Then maybe two medium ones. No pattern. No rhythm. Just... how people actually write.

Contractions — use them. A lot. "It's" not "it is." "Don't" not "do not." "Can't" "won't" "they're" "we're." Hit like 40-50% of the spots where you could use one. Not all of them though, that'd be weird too.

Throw in some casual stuff. Words like "honestly" or "kinda" or "basically" or "I mean" or "not gonna lie." Not in every sentence obviously but sprinkle them in. Maybe 4-5 times per 500 words. Makes it sound like someone's actually talking.

Personal asides — add a couple. "I always thought..." or "funny enough..." or "which is wild when you think about it" or "side note —" Just little moments where the writer's brain wanders for a sec. Humans do this ALL the time.

Words you are NEVER allowed to use: delve, utilize, facilitate, paramount, comprehensive, pivotal, foster, streamline, harness, leverage, moreover, furthermore, consequently, multifaceted, nuanced, "it is important to note", "it is worth noting", "in conclusion", thus, hence, therefore. These are AI red flags. Replace them with normal words. "Use" not "utilize." "Important" not "paramount." "Help" not "facilitate." "Look into" not "delve into."

Don't start sentences the same way back to back. If one starts with "The" the next one better not. Mix it up — start with "And" or "But" or "So" sometimes. Start with a question. Start with a fragment. Start with "Look," or "Here's the thing —"

For transitions between ideas, use stuff real people say: "That said," or "The thing is," or "On the flip side," or "Honestly," or "Point being," or just... don't use a transition at all. Just start the next thought. People do that.

Throw in a rhetorical question here and there. Maybe a fragment that isn't a complete sentence. Like this one. Use dashes — like this — for parenthetical thoughts. Maybe an ellipsis... if it fits.

Some parts should feel quick and punchy. Others should slow down and get a little more thoughtful. That rhythm — fast then slow then fast — is what burstiness looks like and it's the second biggest thing detectors measure.

Reading level: aim for like a 70-85 Flesch score. Easy to read. Think smart person writing a blog post or a decent Reddit comment. Not an academic paper.

Keep ALL the facts, arguments, meaning, names, dates, data. Change HOW it's written, not WHAT it says.

Output: Just give me the rewritten text. Nothing else. No "here's the humanized version" or any preamble. Just the text.`;

const INTENSITY_MAP = {
  light: `\n\nKeep it pretty close to the original vibe. Just sand off the obvious AI edges — fix the robotic transitions, vary the sentences a bit, add a couple contractions. Don't go crazy casual if the original was formal-ish.`,
  medium: `\n\nDo a solid rewrite. Hit all the rules above. Make it clearly sound like a person wrote it but don't go overboard with slang or casualness. Natural and real.`,
  aggressive: `\n\nGo hard. Maximum human energy. Lots of fragments, casual transitions, contractions everywhere, throw in more filler words, make it feel like someone banged this out in 20 minutes and hit send without proofreading much. Messy-human, not polished-AI.`,
};

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

    const intensityLevel = (intensity || "medium") as keyof typeof INTENSITY_MAP;
    const intensityInstruction = INTENSITY_MAP[intensityLevel] || INTENSITY_MAP.medium;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: HUMANIZE_PROMPT + intensityInstruction },
            { role: "user", content: `Rewrite this so it passes AI detection:\n\n${text}` },
          ],
          stream: true,
          max_tokens: 8192,
          temperature: 1.3,
          top_p: 0.97,
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
