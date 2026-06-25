/**
 * Admin CMS 사이트별 설정 집중화
 * 아내 블로그 이식 시 이 파일만 변경하면 됨.
 */
export const ADMIN_CONFIG = {
  siteName: "TokyoKorean",
  siteUrl: "https://tokyokorean.net",
  adminPath: "/admin",
  defaultLocale: "ko" as const,
  supportedLocales: ["ko", "en", "ja"] as const,
  categories: ["practical", "culture", "local", "essay"] as const,
  /** 이미지 업로드 최대 크기 (MB) */
  maxImageSizeMB: 20,
  /** 이미지 리사이즈 최대 폭 (px) */
  maxImageWidth: 1920,
  /** 썸네일 폭 (px) */
  thumbnailWidth: 400,
  /** WebP 품질 (0–100) */
  webpQuality: 80,
  /** 자동저장 debounce (ms) */
  autoSaveIntervalMs: 2000,
  /** JWT 유효기간 (일) */
  jwtExpiryDays: 7,
} as const;

export type SupportedLocale = (typeof ADMIN_CONFIG.supportedLocales)[number];
export type PostCategory = (typeof ADMIN_CONFIG.categories)[number];
export type PostStatus = "memo" | "draft" | "editing" | "review" | "published";
export type MemoStatus = "pending" | "expanded" | "archived";
