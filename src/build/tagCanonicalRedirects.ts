export type VercelRoute = {
  src?: string;
  status?: number;
  headers?: { Location?: string };
  handle?: string;
  dest?: string;
  continue?: boolean;
};

/** 단방향 태그 리다이렉트: /ko/tags/도쿄 -> /tags/도쿄/ */
export const TAG_SAFETY_NET: VercelRoute = {
  src: "^/(?:ko|ja|en)/tags/([^/]+)(?:/\\d+)?/?$",
  headers: { Location: "/tags/$1/" },
  status: 308,
};

/** Legacy WordPress / Yoast paths still in GSC index from the prior site. */
export const WP_LEGACY_ROUTES: VercelRoute[] = [
  {
    src: "^/author/?$",
    headers: { Location: "/about/" },
    status: 308,
  },
  {
    src: "^/author/.+",
    headers: { Location: "/about/" },
    status: 308,
  },
  {
    src: "^/feed/?$",
    headers: { Location: "/rss.xml" },
    status: 308,
  },
  {
    src: "^/.+?/feed/?$",
    headers: { Location: "/" },
    status: 308,
  },
  /** Gone — tell crawlers to drop legacy WP system URLs (not 308 to home). */
  {
    src: "^/wp-(?:admin|content|includes|json|login\\.php)(?:/.*)?$",
    status: 410,
  },
  /** /ko/posts/* → /posts/* : getPath.ts가 ko 콘텐츠에 /ko/ prefix를 붙이는 문제 우회 */
  {
    src: "^/ko/posts/(.+)$",
    headers: { Location: "/posts/$1" },
    status: 307,
  },
];
