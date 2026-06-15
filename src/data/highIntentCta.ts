/**
 * Rules for HighIntentPostCta — see docs/HIGH_INTENT_POST_CTA.md
 */
export const HIGH_INTENT_FREELANCE_CATEGORIES = ["investment", "safety"] as const;

/** Posts that show the D-90 relocation checklist link */
export const LEAD_MAGNET_SLUGS = [
  "japan-visa-paths-permanent-business-manager-asset-holders",
  "tokyo-moving-contracts-two-notes",
  "korea-japan-inheritance-gift-tax-cross-border-basics",
  "japan-corporate-vs-personal-rental-after-tax-sketch",
  "tokyo-ward-guide-series-prologue",
  "tokyo-core-3-wards-chiyoda-chuo-minato",
  "tokyo-shinjuku-shibuya-bunkyo",
  "tokyo-6-wards-real-estate-insight",
  "tokyo-buying-process-step-by-step",
] as const;

export type LeadMagnetSlug = (typeof LEAD_MAGNET_SLUGS)[number];

export function postSlugFromId(postId: string): string {
  return postId.replace(/^(en|ko|ja)\//, "");
}

export function showsFreelanceCta(category: string | undefined): boolean {
  if (!category) return false;
  return (HIGH_INTENT_FREELANCE_CATEGORIES as readonly string[]).includes(
    category
  );
}

export function showsLeadMagnetCta(slug: string): boolean {
  return (LEAD_MAGNET_SLUGS as readonly string[]).includes(slug);
}

export function showsHighIntentBlock(
  category: string | undefined,
  slug: string
): boolean {
  return showsFreelanceCta(category) || showsLeadMagnetCta(slug);
}
