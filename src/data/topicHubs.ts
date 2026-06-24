/**
 * Four editorial hubs (Phase 3 plan) — file slugs shared across en/ko/ja.
 */
export const TOPIC_HUB_SLUGS = {
  urbanInvestment: [
    "japan-garbage-disposal-rules",
    "japan-banking-credit-card",
    "tokyo-housing-rental-process",
    "japan-healthcare-hospital-visit",
    "tokyo-public-transportation-tips",
  ],
  macroPolicy: [
    "japan-korea-work-culture-diff",
    "japan-married-to-japanese-culture-diff",
    "japan-life-8years-honest",
    "japan-language-learning-survival-japanese",
    "japan-seasons-matsuri-culture",
  ],
  tokyoLife: [
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
