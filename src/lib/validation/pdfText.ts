/**
 * Extract plain text from a remote PDF for tier-1 source verification.
 */
export async function fetchPdfAsPlainText(
  url: string
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GSF-Blog-Trust-Verify/1.0 (fact-check pipeline)",
        Accept: "application/pdf,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };

    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(await res.arrayBuffer());
    const doc = await getDocument({ data, useSystemFonts: true }).promise;

    const parts: string[] = [];
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const line = content.items
        .map(item => ("str" in item && typeof item.str === "string" ? item.str : ""))
        .join(" ");
      parts.push(line);
    }
    return { ok: true, text: parts.join("\n") };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "pdf extract failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export function isPdfUrl(url: string) {
  return /\.pdf(\?|#|$)/i.test(url);
}
