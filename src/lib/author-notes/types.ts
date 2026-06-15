export interface ParsedAuthorNotes {
  authorIntent: string;
  mustInclude: string[];
  mustAvoid: string[];
  toneProfile: {
    style: "analytical" | "conversational" | "executive";
    confidence: "careful" | "neutral" | "assertive";
  };
}
