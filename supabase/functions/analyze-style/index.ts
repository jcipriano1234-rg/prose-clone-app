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
    const { writingSamples } = await req.json();

    if (!writingSamples || writingSamples.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Not enough writing samples to analyze. Add more text." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Auth check
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

    // Use AI to analyze writing style
    const analysisPrompt = `Analyze the following writing samples and extract a detailed writing style profile. Return a JSON object with these exact fields:

{
  "avg_sentence_length": <number of words per sentence on average>,
  "avg_word_length": <number of characters per word on average>,
  "contraction_rate": <0 to 1, how often contractions are used vs full forms>,
  "vocabulary_richness": <0 to 1, ratio of unique words to total words>,
  "top_words": [<top 20 most characteristic words/phrases they use, excluding common words like "the", "a", "is">],
  "top_phrases": [<top 10 multi-word phrases or patterns they repeat>],
  "punctuation_habits": {
    "exclamation_marks": <frequency 0-10>,
    "question_marks": <frequency 0-10>,
    "ellipsis": <frequency 0-10>,
    "dashes": <frequency 0-10>,
    "commas_per_sentence": <average number>
  },
  "formality_score": <0-100, where 0 is extremely casual and 100 is very formal>,
  "personality_traits": [<list of 5-8 personality descriptors like "sarcastic", "enthusiastic", "laid-back", "direct", "hedging">],
  "raw_analysis": "<a 2-3 paragraph natural language description of how this person writes — their voice, quirks, vocabulary patterns, sentence rhythm, and personality that comes through in their writing. Write this as instructions for another AI to clone their style.>"
}

Writing samples:
---
${writingSamples}
---

Return ONLY the JSON object, no markdown, no explanation.`;

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
            { role: "system", content: "You are a linguistics expert specializing in writing style analysis. Return only valid JSON." },
            { role: "user", content: analysisPrompt },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Style analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || "";

    // Parse the JSON from AI response
    let analysis;
    try {
      // Strip markdown code fences if present
      const cleaned = rawContent.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI analysis:", rawContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse style analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert the style profile
    const { error: upsertError } = await supabase
      .from("style_profiles")
      .upsert({
        user_id: userId,
        avg_sentence_length: analysis.avg_sentence_length || 0,
        avg_word_length: analysis.avg_word_length || 0,
        contraction_rate: analysis.contraction_rate || 0,
        vocabulary_richness: analysis.vocabulary_richness || 0,
        top_words: analysis.top_words || [],
        top_phrases: analysis.top_phrases || [],
        punctuation_habits: analysis.punctuation_habits || {},
        formality_score: analysis.formality_score || 50,
        personality_traits: analysis.personality_traits || [],
        raw_analysis: analysis.raw_analysis || "",
        analyzed_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertError) {
      console.error("Failed to save style profile:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save style profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-style error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
