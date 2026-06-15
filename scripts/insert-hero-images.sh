#!/bin/bash
# Hero image insertion script
# Maps generated images from brain sessions to blog posts

BLOG_DIR="/Users/gsf/.gemini/antigravity/scratch/GSF-Blog"
IMG_DIR="$BLOG_DIR/public/assets/images/blog"
SESSION1="/Users/gsf/.gemini/antigravity/brain/67678d06-f94e-4644-af65-36815d119fae"
SESSION2="/Users/gsf/.gemini/antigravity/brain/095e7493-1523-4c0b-96bf-ebc05ace184e"

mkdir -p "$IMG_DIR"

# Define mappings: image_basename -> post_slug
# Using session1 (more recent, higher quality) as primary source
declare -A IMAGE_MAP=(
  # Investment category
  ["hotel_reit_hero"]="hotel-reit-vs-office-reit-post-covid"
  ["j_reit_hero"]="j-reit-five-things-to-know"
  ["japan_tax_strategy_hero"]="japan-corporate-vs-personal-rental-after-tax-sketch"
  ["japan_rate_hike_hero"]="japan-rate-hike-cycle-j-reit-three-lessons"
  ["japan_realestate_hero"]="japan-real-estate-three-things"
  ["japan_visa_hero"]="japan-visa-paths-permanent-business-manager-asset-holders"
  ["inheritance_tax_hero"]="korea-japan-inheritance-gift-tax-cross-border-basics"
  ["nihonbashi_redevelopment_hero"]="nihonbashi-mitsui-redevelopment-pipeline-three"
  ["failure_postmortem_hero"]="one-failure-three-lessons-postmortem"
  ["seoul_tokyo_markets_hero"]="reading-korea-japan-markets-together"
  ["fx_volatility_hero"]="three-things-when-fx-shakes"
  ["tokyo_6wards_hero"]="tokyo-6-wards-real-estate-insight"
  ["tokyo_buying_hero"]="tokyo-buying-process-step-by-step"
  ["tokyo_tsubo_hero"]="tokyo-mansion-tsubo-chiyoda-chuo-minato"
  ["tokyo_office_vacancy_hero"]="tokyo-office-vacancy-five-wards-2026"
  ["tokyo_complete_guide_hero"]="tokyo-real-estate-investment-complete-guide"
  ["rental_yield_hero"]="tokyo-small-rental-yield-vs-capital-gain-breakeven"
  ["weak_yen_hero"]="weak-yen-korean-japan-asset-allocation-fx-scenarios"
  ["ginza_marunouchi_hero"]="ginza-marunouchi-walk-dna"
  ["nihonbashi_hamacho_hero"]="nihonbashi-hamacho-walking-guide"
  ["tokyo_earthquake_hero"]="tokyo-earthquake-vulnerable-five-areas"
  ["tokyo_korean_hero"]="tokyo-korean-community-beyond-shinokubo"
  ["tokyo_lease_hero"]="tokyo-moving-contracts-two-notes"
  ["tokyo_museums_hero"]="tokyo-museums-with-kids-five-picks"
  ["tokyo_transport_hero"]="tokyo-yokohama-fuji-transport-pass"
)

# Additional mappings from session2 for posts not covered by session1
declare -A SESSION2_MAP=(
  ["nihonbashi_origin"]="nihonbashi-the-origin-of-japan"
  ["tsukiji_toyosu"]="tsukiji-to-toyosu-morning-tokyo"
  ["tokyo_sophisticated"]="tokyo-five-sophisticated-spots"
)

# Posts that need special handling:
# - why-warm-investing-holds (essay)
# - coredo-nihonbashi-mitsui-redevelopment (already has ogImage)

echo "=== Hero Image Insertion Script ==="
echo ""

# Step 1: Copy images from session1
echo "--- Copying images from primary session ---"
for img_key in "${!IMAGE_MAP[@]}"; do
  slug="${IMAGE_MAP[$img_key]}"
  # Find the file (with timestamp suffix)
  src_file=$(find "$SESSION1" -maxdepth 1 -name "${img_key}_*.png" | head -1)
  if [ -n "$src_file" ]; then
    dest="$IMG_DIR/${slug}-hero.png"
    cp "$src_file" "$dest"
    echo "✅ Copied: $img_key -> ${slug}-hero.png"
  else
    echo "❌ Missing: $img_key"
  fi
done

# Step 2: Copy images from session2
echo ""
echo "--- Copying images from secondary session ---"
for img_key in "${!SESSION2_MAP[@]}"; do
  slug="${SESSION2_MAP[$img_key]}"
  src_file=$(find "$SESSION2" -maxdepth 1 -name "${img_key}_*.png" | head -1)
  if [ -n "$src_file" ]; then
    dest="$IMG_DIR/${slug}-hero.png"
    cp "$src_file" "$dest"
    echo "✅ Copied: $img_key -> ${slug}-hero.png"
  else
    echo "❌ Missing: $img_key"
  fi
done

# Step 3: Insert ogImage into frontmatter for all three locales
echo ""
echo "--- Inserting ogImage into frontmatter ---"

ALL_SLUGS=("${IMAGE_MAP[@]}" "${SESSION2_MAP[@]}")

for slug in "${ALL_SLUGS[@]}"; do
  img_path="/assets/images/blog/${slug}-hero.png"
  
  for lang in ko en ja; do
    post_file="$BLOG_DIR/src/data/blog/${lang}/${slug}.md"
    if [ -f "$post_file" ]; then
      # Check if ogImage already exists
      if grep -q "^ogImage:" "$post_file"; then
        echo "⏭️  Skip (already has ogImage): ${lang}/${slug}"
      else
        # Insert ogImage after 'draft:' line
        if grep -q "^draft:" "$post_file"; then
          sed -i '' "/^draft:/a\\
ogImage: \"${img_path}\"
" "$post_file"
          echo "✅ Inserted ogImage: ${lang}/${slug}"
        else
          # Fallback: insert before closing ---
          # Find line number of second ---
          echo "⚠️  No 'draft:' found, skipping: ${lang}/${slug}"
        fi
      fi
    fi
  done
done

# Step 4: Handle 'why-warm-investing-holds' (essay) - generate separately
echo ""
echo "--- Summary ---"
echo "Total images copied: $(ls "$IMG_DIR"/*.png 2>/dev/null | wc -l)"
echo ""
echo "Posts without hero image (need manual attention):"
echo "  - why-warm-investing-holds (essay, no image generated yet)"
echo "  - coredo-nihonbashi-mitsui-redevelopment (already has ogImage)"
echo "  - nihonbashi-the-origin-of-japan (covered from session2)"
