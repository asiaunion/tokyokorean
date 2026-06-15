import type { ParsedAuthorNotes } from "@/lib/author-notes/types";

function pickStyle(raw: string): ParsedAuthorNotes["toneProfile"]["style"] {
  const lower = raw.toLowerCase();
  if (lower.includes("임원") || lower.includes("executive")) return "executive";
  if (lower.includes("친근") || lower.includes("conversational")) return "conversational";
  return "analytical";
}

function pickConfidence(raw: string): ParsedAuthorNotes["toneProfile"]["confidence"] {
  const lower = raw.toLowerCase();
  if (lower.includes("확정") || lower.includes("단정")) return "assertive";
  if (lower.includes("신중") || lower.includes("보수")) return "careful";
  return "neutral";
}

function parseBulletLine(raw: string, prefix: string) {
  return raw
    .split("\n")
    .filter(line => line.trim().startsWith(prefix))
    .map(line => line.replace(prefix, "").trim())
    .filter(Boolean);
}

export function parseAuthorNotes(rawMemo: string): ParsedAuthorNotes {
  const cleaned = rawMemo.trim();
  return {
    authorIntent: cleaned.slice(0, 300) || "User provided contextual memo.",
    mustInclude: parseBulletLine(cleaned, "+"),
    mustAvoid: parseBulletLine(cleaned, "-"),
    toneProfile: {
      style: pickStyle(cleaned),
      confidence: pickConfidence(cleaned),
    },
  };
}
