import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

# Admin CMS — noindex at page level + disallow here for extra safety (AdSense protection)
Disallow: /admin/

# Legacy WordPress paths — no longer served (410 at edge); block crawl budget waste
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-content/
Disallow: /wp-json/
Disallow: /wp-login.php

# Thin / utility listings (noindex in HTML) — save crawl budget for posts & topics
Disallow: /tags/
Disallow: /ko/tags/
Disallow: /ja/tags/
Disallow: /archives/
Disallow: /ko/archives/
Disallow: /ja/archives/
Disallow: /search/
Disallow: /ko/search/
Disallow: /ja/search/

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
