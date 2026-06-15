const HARD_CLAIM_PATTERNS = [
  /반드시/g,
  /확실히 보장/g,
  /무조건/g,
  /must insist/gi,
  /guaranteed/gi,
  /絶対に/gi,
  /必ず/gi,
];

export function softenHardClaims(text: string) {
  let next = text;
  next = next.replaceAll("반드시", "우선");
  next = next.replaceAll("무조건", "가능하면");
  next = next.replaceAll("must insist", "may prioritize");
  next = next.replaceAll("guaranteed", "potential");
  next = next.replaceAll("絶対に", "優先的に");
  next = next.replaceAll("必ず", "まず");
  return next;
}

export function containsHardClaims(text: string) {
  return HARD_CLAIM_PATTERNS.some(pattern => pattern.test(text));
}

/** @deprecated Markdown footers removed; disclaimers render via PostDisclaimer in PostDetails. */
export function disclaimerFor(_locale: "ko" | "en" | "ja") {
  return "";
}
