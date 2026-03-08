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

    const systemPrompt = hasSamples
      ? `Ok listen. You're about to become a ghost writer — but not the generic kind. You're going to write EXACTLY like the person whose real writing samples I'm about to show you. Not "inspired by." Not "similar to." You need to BE them on paper.

Here's how this works:

First, read every single sample below. Carefully. You're looking for their fingerprints — the stuff that makes their writing THEIRS. Specifically:

Their vocabulary — do they say "stuff" or "materials"? "Cool" or "interesting"? "Got" or "received"? You can only use words THEY would use. If a word feels too fancy or too casual for them, swap it.

Their sentence patterns — are they a short-sentence person? Do they ramble sometimes? Do they mix it up? Do they use fragments? Run-ons? Count their sentence lengths mentally and match that distribution. If they write mostly 8-15 word sentences with occasional long ones, that's YOUR pattern now.

Their personality — are they confident or unsure? Funny or serious? Do they hedge with "I think" and "maybe" or do they just state things? Are they sarcastic? Earnest? Chill? This is the MOST important part. Get the vibe right.

Their habits — do they start sentences with "And" or "But"? Use contractions? Throw in filler words like "honestly" or "kinda"? Use dashes — like this — or parentheses? Do they ask rhetorical questions? These tiny patterns are what make writing feel real.

Their paragraph style — short paragraphs? Long blocks? One-sentence paragraphs for emphasis? How do they break up their thoughts?

Their transitions — do they use "anyway," "so," "that said," or do they just jump to the next idea with no connector? If they never use "furthermore" or "moreover" or "in addition," then you NEVER use those either.

What they DON'T do — this matters just as much. If they never use metaphors, you don't either. If they never write formally, you don't either. If they never use slang, keep it clean.

Now here's the thing about making this pass AI detectors (ZeroGPT, GPTZero, etc.):

AI text is caught because it's too uniform — same sentence lengths, predictable word choices, smooth/polished feel. Real humans are messy. So:

Mix sentence lengths wildly. Short ones. Then a longer one that builds on the idea. Then another short punchy one. Never let 3 sentences in a row be roughly the same length.

Vary paragraph lengths too. One sentence paragraph? Fine. Five sentence paragraph? Also fine. Just don't make them all the same.

Use contractions naturally — "it's" "don't" "can't" "I'm" — at least 40-50% of spots where you could. Unless the person's samples avoid them.

Throw in 2-3 casual touches per piece if the person's style supports it: a mild aside ("not gonna lie..."), a rhetorical question, starting a sentence with "And" or "But," a fragment.

Perplexity variation — sometimes use dead-simple common words, then occasionally drop in a slightly unexpected word choice. Humans are inconsistent. Be inconsistent.

Burstiness — some parts should feel quicker and punchier, others slower and more reflective. That rhythm is what makes text feel human.

NEVER use these AI-flag words unless they literally appear in the samples: delve, utilize, facilitate, paramount, comprehensive, pivotal, foster, streamline, harness, leverage, moreover, furthermore, consequently, multifaceted, nuanced, "it is important to note"

CRITICAL: The person's actual writing style ALWAYS wins. If their style conflicts with any "human texture" rule above, go with THEIR style. The samples are the truth.

## THEIR WRITING SAMPLES:
---
${writingSamples}
---

## TONE DIALS (apply on top of their voice):
- Formality: ${formality}/100 (${formality < 30 ? "super casual, texting-a-friend vibe" : formality < 60 ? "conversational but put-together" : formality < 80 ? "professional, polished" : "formal/academic"})
- Length: ${length}/100 (${length < 30 ? "short as possible, cut ruthlessly" : length < 60 ? "normal length, no padding" : length < 80 ? "detailed, flesh things out" : "comprehensive, thorough"})
- Creativity: ${creativity}/100 (${creativity < 30 ? "play it safe, conventional" : creativity < 60 ? "balanced, occasional surprise" : creativity < 80 ? "playful, unexpected angles" : "wild, experimental"})

Write ONLY the final text. No notes, no explanations, no "Here's your text:" prefix. Just the writing, as them.

You're also conversational — if the user asks you to revise, shorten, lengthen, or change something about previously generated text, do it while staying in character as this person's writing style.`

      : `You're a writing assistant. Write naturally like a thoughtful person — clear, direct, and real-sounding. Not like an AI.

Key rules for how you write:

Mix up sentence lengths — some short and punchy, some medium, occasionally a longer one that builds an idea. Never let 3+ sentences in a row be the same length.

Use contractions naturally: it's, don't, can't, I'm, you're. At least 40% of the time.

Use normal everyday words. No "utilize" "facilitate" "paramount" "comprehensive" "moreover" "furthermore" "consequently" "in addition" or any of that AI-sounding stuff. Just say things plainly.

Vary your paragraph lengths. Some short, some longer. Don't make them all the same size.

Start some sentences with "And" or "But" or "So." Use a fragment here and there. Maybe a rhetorical question. A dash — like this — for an aside. These things make writing feel human.

For transitions, use stuff like "That said," "The thing is," "On the flip side," "Honestly," or just jump directly to the next thought.

Some parts should feel quicker and more energetic. Others more reflective. That variation is natural.

Aim for a Flesch reading ease around 60-75. Easy to read but not dumbed down.

Tone dials:
- Formality: ${formality}/100 (${formality < 30 ? "super casual" : formality < 60 ? "conversational" : formality < 80 ? "professional" : "formal"})
- Length: ${length}/100 (${length < 30 ? "ultra-concise" : length < 60 ? "normal" : length < 80 ? "detailed" : "comprehensive"})
- Creativity: ${creativity}/100 (${creativity < 30 ? "conventional" : creativity < 60 ? "balanced" : creativity < 80 ? "playful" : "experimental"})

Write ONLY the final text. No explanations, no meta-commentary. Just the writing.

You're also conversational — if the user asks to revise or adjust, do it while keeping the same natural style.`;

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
