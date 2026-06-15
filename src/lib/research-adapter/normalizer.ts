import { detectTier, scoreByTier } from "@/lib/research-adapter/tiering";
import type {
  NormalizedResearchItem,
  RawResearchItem,
  ResearchPack,
} from "@/lib/research-adapter/types";

function toDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "invalid-domain";
  }
}

export function normalizeResearchItems(rawItems: RawResearchItem[]): NormalizedResearchItem[] {
  return rawItems
    .map(item => {
      const domain = toDomain(item.url);
      const tier = detectTier(domain);
      return {
        title: item.title?.trim() || "Untitled source",
        url: item.url,
        excerpt: item.excerpt?.trim() || "",
        domain,
        tier,
        credibilityScore: scoreByTier(tier),
      };
    })
    .filter(item => item.url.startsWith("http"));
}

export function buildResearchPack(keyword: string, rawItems: RawResearchItem[], maxItems = 12): ResearchPack {
  const normalized = normalizeResearchItems(rawItems)
    .sort((a, b) => b.credibilityScore - a.credibilityScore)
    .slice(0, maxItems);

  const uniqueSources = Array.from(new Set(normalized.map(item => item.url)));
  const references = uniqueSources.slice(0, Math.min(6, uniqueSources.length));
  return {
    keyword,
    generatedAt: new Date().toISOString(),
    items: normalized,
    references,
    sources: uniqueSources,
  };
}
