import type { SourceTier } from "@/lib/research-adapter/types";

const GOVERNMENT_HOSTS = ["go.jp", "gov", "moef.go.jp", "mlit.go.jp", "mhlw.go.jp"];
const PUBLIC_HOSTS = ["or.jp", "ac.jp", "reins.or.jp", "stat.go.jp", "boj.or.jp"];
const MEDIA_HOSTS = [
  "nikkei.com",
  "reuters.com",
  "bloomberg.com",
  "ft.com",
  "wsj.com",
  "bbc.com",
];

const SCORE_MAP: Record<SourceTier, number> = {
  government: 100,
  public: 85,
  media: 70,
  general: 55,
  personal: 30,
};

export function detectTier(host: string): SourceTier {
  const normalized = host.toLowerCase();
  if (GOVERNMENT_HOSTS.some(h => normalized.includes(h))) return "government";
  if (PUBLIC_HOSTS.some(h => normalized.includes(h))) return "public";
  if (MEDIA_HOSTS.some(h => normalized.includes(h))) return "media";
  if (normalized.includes("medium.com") || normalized.includes("substack.com")) return "personal";
  return "general";
}

export function scoreByTier(tier: SourceTier) {
  return SCORE_MAP[tier];
}
