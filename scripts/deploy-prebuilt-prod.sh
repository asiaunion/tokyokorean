#!/usr/bin/env bash
# Build with PUBLIC_* analytics env inlined, then prebuilt deploy (avoids 100MB source upload).
set -euo pipefail
cd "$(dirname "$0")/.."

: "${PUBLIC_GA4_MEASUREMENT_ID:?Set PUBLIC_GA4_MEASUREMENT_ID (e.g. G-1JZH2YCS3Z)}"
: "${PUBLIC_ADSENSE_PUBLISHER_ID:?Set PUBLIC_ADSENSE_PUBLISHER_ID (e.g. ca-pub-…)}"

export PUBLIC_GA4_MEASUREMENT_ID
export PUBLIC_ADSENSE_PUBLISHER_ID

pnpm run build
node scripts/patch-robots-txt.mjs
node scripts/merge-vercel-json-into-output.mjs
if ! grep -q "$PUBLIC_GA4_MEASUREMENT_ID" dist/client/index.html 2>/dev/null; then
  echo "error: GA4 id not found in dist/client/index.html — env not inlined" >&2
  exit 1
fi
npx vercel@latest deploy --prebuilt --prod --yes
