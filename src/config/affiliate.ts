/**
 * Affiliate program IDs and pilot link templates.
 * Fill in after A8 / もしも approval — see docs/AFFILIATE_SETUP.md
 */
export const AFFILIATE_PROGRAMS = {
  a8: {
    enrolled: false,
    siteId: "",
  },
  moshimo: {
    enrolled: false,
    siteId: "",
  },
} as const;

/** Example slugs approved for affiliate CTAs (AdSense approval后) */
export const AFFILIATE_PILOT_SLUGS = [
  "japan-visa-paths-permanent-business-manager-asset-holders",
  "tokyo-moving-contracts-two-notes",
  "korea-japan-inheritance-gift-tax-cross-border-basics",
] as const;
