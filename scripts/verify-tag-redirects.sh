#!/usr/bin/env bash
# Tag redirect verification matrix. Covers locale × encoding × case × pagination
# × trailing-slash variants for representative tags (JA/EN/KO canonical) plus
# WP legacy and the catch-all safety net.
#
# Usage:  ./scripts/verify-tag-redirects.sh [BASE_URL]
# Default BASE_URL: https://gsfark.com
#   Local preview:  ./scripts/verify-tag-redirects.sh http://127.0.0.1:4321

set -u

CURL="/usr/bin/curl"
BASE="${1:-https://gsfark.com}"
PASS=0
FAIL=0
FAILS=()

# check <url> <expected_first_hop_status> [expected_final_url_substring]
#   * expected_first_hop_status: 200 or 308 — the immediate response
#   * expected_final_url_substring: must appear in the final URL after following
#     up to 5 redirects (mirrors what Googlebot/users actually see)
check() {
  local url="$1"
  local want_code="$2"
  local want_loc="${3:-}"
  local first_code final_code final_url
  first_code=$($CURL -sI -o /dev/null -w '%{http_code}' "$BASE$url" 2>/dev/null)
  final_url=$($CURL -sIL --max-redirs 5 -o /dev/null -w '%{url_effective}' "$BASE$url" 2>/dev/null)
  final_code=$($CURL -sIL --max-redirs 5 -o /dev/null -w '%{http_code}' "$BASE$url" 2>/dev/null)
  local ok=1
  if [ "$first_code" != "$want_code" ]; then ok=0; fi
  if [ "$want_code" = "308" ] && [ "$final_code" != "200" ] && [ "$final_code" != "404" ]; then ok=0; fi
  if [ -n "$want_loc" ] && ! printf '%s' "$final_url" | /usr/bin/grep -qF "$want_loc"; then ok=0; fi
  if [ "$ok" = 1 ]; then
    PASS=$((PASS+1))
    if [ "$first_code" = "308" ]; then
      printf '  OK   %s→%s %s → %s\n' "$first_code" "$final_code" "$url" "$final_url"
    else
      printf '  OK   %s %s\n' "$first_code" "$url"
    fi
  else
    FAIL=$((FAIL+1))
    FAILS+=("$url want=$want_code/$want_loc got first=$first_code final=$final_code url=$final_url")
    printf '  FAIL %s→%s %s\n        want %s %s\n        final %s\n' \
      "$first_code" "$final_code" "$url" "$want_code" "$want_loc" "$final_url"
  fi
}

echo "=== BASE: $BASE ==="

echo "--- 日本橋 (JA canonical, 5 posts → 2 pages) ---"
check "/tags/日本橋/2/"                       308 "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"
check "/tags/日本橋/2"                        308 "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"
check "/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/2/"  308 "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"
check "/tags/%e6%97%a5%e6%9c%ac%e6%a9%8b/2/"  308 "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"
check "/ko/tags/日本橋/"                       308 "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"
check "/tags/日本橋/"                          308 "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"
check "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/"     200
check "/ja/tags/%E6%97%A5%E6%9C%AC%E6%A9%8B/2/"   200

echo "--- Investment (EN canonical) ---"
check "/tags/Investment/"                    308 "/tags/investment/"
check "/ko/tags/Investment/"                 308 "/tags/investment/"
check "/ja/tags/Investment/"                 308 "/tags/investment/"
check "/tags/investment/"                    200
check "/tags/Real%20Estate/"                 308 "/tags/real-estate/"
check "/tags/real-estate/"                   200

echo "--- 부동산 / 不動産 (KO canonical) ---"
check "/tags/부동산/"                         308 "/ko/tags/%EB%B6%80%EB%8F%99%EC%82%B0/"
check "/tags/%EB%B6%80%EB%8F%99%EC%82%B0/"    308 "/ko/tags/%EB%B6%80%EB%8F%99%EC%82%B0/"
check "/ja/tags/%EB%B6%80%EB%8F%99%EC%82%B0/" 308 "/ko/tags/%EB%B6%80%EB%8F%99%EC%82%B0/"
check "/ko/tags/%EB%B6%80%EB%8F%99%EC%82%B0/" 200

echo "--- nihonbashi (multi-page canonical EN) ---"
check "/tags/nihonbashi/"                    200
check "/tags/nihonbashi/2/"                  200

echo "--- WP legacy ---"
check "/author/gsf/"        308 "/about/"
check "/feed/"              308 "/rss.xml"
check "/wp-admin/foo/"      308 "/"
check "/wp-login.php"       308 "/"
check "/wp-json/foo/"       308 "/"

echo "--- Safety net (unknown tag) ---"
check "/tags/완전임의새태그/"   308 "/tags/"
check "/ko/tags/zzzunknown/"   308 "/tags/"

echo "--- Sitemap & robots ---"
check "/robots.txt"             200
check "/sitemap-index.xml"      200
check "/sitemap.xml"            308 "/sitemap-index.xml"

echo
echo "=== Result: $PASS pass, $FAIL fail ==="
if [ "$FAIL" -ne 0 ]; then
  echo "Failures:"
  for f in "${FAILS[@]}"; do echo "  $f"; done
  exit 1
fi
