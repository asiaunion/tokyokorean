/**
 * Four editorial hubs (Phase 3 plan) — file slugs shared across en/ko/ja.
 */
export const TOPIC_HUB_SLUGS = {
  urbanInvestment: [
    "tokyo-office-vacancy-five-wards-2026",
    "tokyo-mansion-tsubo-chiyoda-chuo-minato",
    "hotel-reit-vs-office-reit-post-covid",
    "nihonbashi-mitsui-redevelopment-pipeline-three",
    "tokyo-small-rental-yield-vs-capital-gain-breakeven",
  ],
  macroPolicy: [
    "weak-yen-korean-japan-asset-allocation-fx-scenarios",
    "japan-rate-hike-cycle-j-reit-three-lessons",
    "korea-japan-inheritance-gift-tax-cross-border-basics",
    "japan-visa-paths-permanent-business-manager-asset-holders",
    "japan-corporate-vs-personal-rental-after-tax-sketch",
  ],
  tokyoLife: [
    "nihonbashi-hamacho-walking-guide",
    "tsukiji-to-toyosu-morning-tokyo",
    "ginza-marunouchi-walk-dna",
    "tokyo-korean-community-beyond-shinokubo",
    "tokyo-museums-with-kids-five-picks",
  ],
  essay: [
    "why-warm-investing-holds",
    "tokyo-moving-contracts-two-notes",
    "three-things-when-fx-shakes",
    "reading-korea-japan-markets-together",
    "one-failure-three-lessons-postmortem",
  ],
} as const;

export type TopicHubKey = keyof typeof TOPIC_HUB_SLUGS;
