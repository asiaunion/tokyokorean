/**
 * Source URL quality scoring (P2-2). Complements domain-string checks in validationGates.
 */

const TIER1_HOSTS = [
  ".go.jp",
  ".go.kr",
  ".gov",
  ".or.jp",
  ".ac.jp",
  "nikkei.com",
  "reuters.com",
  "bloomberg.com",
  "wsj.com",
  "bbc.com",
];

export function scoreSourceUrl(url: string) {
  let score = 0;
  const reasons: string[] = [];
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.replace(/\/+$/, "") || "/";

    if (TIER1_HOSTS.some(s => host.includes(s.replace(/^\./, "")) || host.endsWith(s))) {
      score += 40;
      reasons.push("tier1-host");
    }
    if (path !== "/" && path.length > 3) {
      score += 35;
      reasons.push("specific-path");
    } else {
      reasons.push("homepage-only");
    }
    if (u.protocol === "https:") {
      score += 10;
      reasons.push("https");
    }
  } catch {
    return { score: 0, reasons: ["invalid-url"] };
  }
  return { score: Math.min(100, score), reasons };
}

export function scoreSourcesList(urls: string[]) {
  if (!urls.length) return { ok: false, average: 0, min: 0, details: [] as ReturnType<typeof scoreSourceUrl>[] };
  const details = urls.map(url => ({ url, ...scoreSourceUrl(url) }));
  const scores = details.map(d => d.score);
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const ok = min >= 50 && average >= 60;
  return { ok, average, min, details };
}
