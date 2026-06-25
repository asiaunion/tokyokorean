/**
 * Four editorial hubs (Phase 3 plan) — file slugs shared across en/ko/ja.
 */
export const TOPIC_HUB_SLUGS = {
  practical: [
    "japan-garbage-disposal-rules",
    "japan-banking-credit-card",
    "tokyo-housing-rental-process",
    "japan-healthcare-hospital-visit",
    "tokyo-public-transportation-tips",
  ],
  culture: [
    "japan-korea-work-culture-diff",
    "japan-married-to-japanese-culture-diff",
    "japan-life-8years-honest",
    "japan-language-learning-survival-japanese",
    "japan-seasons-matsuri-culture",
  ],
  local: [
    "nihonbashi-history-and-modern-life",
    "nihonbashi-why-i-live-here",
    "nihonbashi-hidden-cafes",
    "tokyo-supermarket-guide",
    "japan-convenience-store-must-buys",
    "tokyo-weekend-getaway-spots",
  ],
  essay: [
    "nihonbashi-buying-property-foreigner",
    "tokyo-life-cost-of-living",
    "tokyo-korean-community-culture",
    "japan-elderly-care-frontline",
  ],
} as const;

export type TopicHubKey = keyof typeof TOPIC_HUB_SLUGS;
export type HubCategory = "practical" | "culture" | "local" | "essay";

export function hubCategoryForSlug(slug: string): HubCategory | undefined {
  for (const [hub, slugs] of Object.entries(TOPIC_HUB_SLUGS) as [HubCategory, readonly string[]][]) {
    if ((slugs as readonly string[]).includes(slug)) return hub;
  }
  return undefined;
}
