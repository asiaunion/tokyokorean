export type SourceTier = "government" | "public" | "media" | "general" | "personal";

export interface RawResearchItem {
  title: string;
  url: string;
  excerpt?: string;
  publishedAt?: string;
  sourceType?: string;
}

export interface NormalizedResearchItem {
  title: string;
  url: string;
  excerpt: string;
  domain: string;
  tier: SourceTier;
  credibilityScore: number;
}

export interface ResearchPack {
  keyword: string;
  generatedAt: string;
  items: NormalizedResearchItem[];
  references: string[];
  sources: string[];
}
