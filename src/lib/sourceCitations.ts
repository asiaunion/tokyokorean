/** Structured citations for numbered footnotes → #source-N anchors */

export type CiteSource = {
  label: string;
  url: string;
  archive?: string;
  portal?: string;
  secondaryUrl?: string;
};

export function urlsFromCiteSources(items: CiteSource[]): string[] {
  const urls: string[] = [];
  for (const item of items) {
    urls.push(item.url);
    if (item.secondaryUrl) urls.push(item.secondaryUrl);
    if (item.portal) urls.push(item.portal);
  }
  return urls;
}
