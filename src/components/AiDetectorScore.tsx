import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface AiDetectorScoreProps {
  content: string;
}

function estimateHumanScore(text: string): number {
  if (!text || text.length < 50) return 0;

  let score = 50; // baseline

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);

  // Sentence length variance (humans are chaotic)
  if (sentences.length > 2) {
    const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, l) => a + Math.pow(l - avg, 2), 0) / lengths.length;
    if (variance > 40) score += 12;
    else if (variance > 20) score += 6;
    else score -= 5;
  }

  // Contractions boost
  const contractions = (text.match(/\b(I'm|don't|can't|won't|it's|you're|they're|we're|isn't|aren't|didn't|couldn't|wouldn't|shouldn't|gonna|wanna|gotta|kinda|sorta)\b/gi) || []).length;
  const contractionRate = contractions / words.length;
  if (contractionRate > 0.03) score += 10;
  else if (contractionRate > 0.015) score += 5;

  // Casual markers
  const casualMarkers = (text.match(/\b(honestly|kinda|tbh|like|you know|I mean|sorta|anyway|basically|literally|actually)\b/gi) || []).length;
  if (casualMarkers > 2) score += 8;
  else if (casualMarkers > 0) score += 4;

  // Starts with And/But (human pattern)
  const andButStarts = sentences.filter((s) => /^\s*(And|But|So|Or)\b/i.test(s)).length;
  if (andButStarts > 0) score += 5;

  // Fragments (short sentences < 5 words)
  const fragments = sentences.filter((s) => s.trim().split(/\s+/).length < 5).length;
  if (fragments / sentences.length > 0.2) score += 6;

  // AI red flags (penalize)
  const aiMarkers = (text.match(/\b(moreover|furthermore|consequently|in addition|it is important to note|in conclusion|thus|hence|therefore|delve|utiliz|pivotal|paramount|streamlin|harness|leverage|foster)\b/gi) || []).length;
  score -= aiMarkers * 6;

  // Paragraph variance
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  if (paragraphs.length > 1) {
    const pLengths = paragraphs.map((p) => p.split(/\s+/).length);
    const pVariance = pLengths.reduce((a, l) => a + Math.pow(l - pLengths.reduce((x, y) => x + y, 0) / pLengths.length, 2), 0) / pLengths.length;
    if (pVariance > 100) score += 6;
  }

  // Questions (humans ask more)
  const questions = (text.match(/\?/g) || []).length;
  if (questions > 0) score += 4;

  // Ellipses and dashes (human texture)
  if (text.includes("...") || text.includes("—") || text.includes("–")) score += 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function AiDetectorScore({ content }: AiDetectorScoreProps) {
  const score = estimateHumanScore(content);

  if (score === 0) return null;

  const getColor = () => {
    if (score >= 75) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-500";
  };

  const getIcon = () => {
    if (score >= 75) return ShieldCheck;
    if (score >= 50) return Shield;
    return ShieldAlert;
  };

  const getLabel = () => {
    if (score >= 85) return "Very Human";
    if (score >= 70) return "Mostly Human";
    if (score >= 50) return "Mixed";
    return "AI-like";
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full border border-border bg-card text-[11px]"
    >
      <Icon className={`h-3.5 w-3.5 ${getColor()}`} />
      <span className={`font-medium ${getColor()}`}>{score}%</span>
      <span className="text-muted-foreground">{getLabel()}</span>
    </motion.div>
  );
}
