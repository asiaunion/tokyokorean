#!/usr/bin/env python3
"""Hero image insertion script: copies generated images and inserts ogImage into frontmatter."""

import shutil
import glob
import os
import re

BLOG_DIR = "/Users/gsf/.gemini/antigravity/scratch/GSF-Blog"
IMG_DIR = os.path.join(BLOG_DIR, "public/assets/images/blog")
SESSION1 = "/Users/gsf/.gemini/antigravity/brain/67678d06-f94e-4644-af65-36815d119fae"
SESSION2 = "/Users/gsf/.gemini/antigravity/brain/095e7493-1523-4c0b-96bf-ebc05ace184e"

os.makedirs(IMG_DIR, exist_ok=True)

# Session 1 mappings (primary, more recent)
SESSION1_MAP = {
    "hotel_reit_hero": "hotel-reit-vs-office-reit-post-covid",
    "j_reit_hero": "j-reit-five-things-to-know",
    "japan_tax_strategy_hero": "japan-corporate-vs-personal-rental-after-tax-sketch",
    "japan_rate_hike_hero": "japan-rate-hike-cycle-j-reit-three-lessons",
    "japan_realestate_hero": "japan-real-estate-three-things",
    "japan_visa_hero": "japan-visa-paths-permanent-business-manager-asset-holders",
    "inheritance_tax_hero": "korea-japan-inheritance-gift-tax-cross-border-basics",
    "nihonbashi_redevelopment_hero": "nihonbashi-mitsui-redevelopment-pipeline-three",
    "failure_postmortem_hero": "one-failure-three-lessons-postmortem",
    "seoul_tokyo_markets_hero": "reading-korea-japan-markets-together",
    "fx_volatility_hero": "three-things-when-fx-shakes",
    "tokyo_6wards_hero": "tokyo-6-wards-real-estate-insight",
    "tokyo_buying_hero": "tokyo-buying-process-step-by-step",
    "tokyo_tsubo_hero": "tokyo-mansion-tsubo-chiyoda-chuo-minato",
    "tokyo_office_vacancy_hero": "tokyo-office-vacancy-five-wards-2026",
    "tokyo_complete_guide_hero": "tokyo-real-estate-investment-complete-guide",
    "rental_yield_hero": "tokyo-small-rental-yield-vs-capital-gain-breakeven",
    "weak_yen_hero": "weak-yen-korean-japan-asset-allocation-fx-scenarios",
    "ginza_marunouchi_hero": "ginza-marunouchi-walk-dna",
    "nihonbashi_hamacho_hero": "nihonbashi-hamacho-walking-guide",
    "tokyo_earthquake_hero": "tokyo-earthquake-vulnerable-five-areas",
    "tokyo_korean_hero": "tokyo-korean-community-beyond-shinokubo",
    "tokyo_lease_hero": "tokyo-moving-contracts-two-notes",
    "tokyo_museums_hero": "tokyo-museums-with-kids-five-picks",
    "tokyo_transport_hero": "tokyo-yokohama-fuji-transport-pass",
}

# Session 2 mappings (for posts not covered by session 1)
SESSION2_MAP = {
    "nihonbashi_origin": "nihonbashi-the-origin-of-japan",
    "tsukiji_toyosu": "tsukiji-to-toyosu-morning-tokyo",
    "tokyo_sophisticated": "tokyo-five-sophisticated-spots",
}

def find_image(session_dir, key_prefix):
    """Find image file matching the key prefix in a session directory."""
    pattern = os.path.join(session_dir, f"{key_prefix}_*.png")
    matches = glob.glob(pattern)
    return matches[0] if matches else None

def insert_og_image(post_file, img_path):
    """Insert ogImage into frontmatter of a markdown file."""
    with open(post_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if ogImage already exists
    if 'ogImage:' in content:
        return 'skip'
    
    # Find the frontmatter section (between --- markers)
    parts = content.split('---', 2)
    if len(parts) < 3:
        return 'no_frontmatter'
    
    frontmatter = parts[1]
    
    # Insert ogImage after 'draft:' line if it exists
    if 'draft:' in frontmatter:
        frontmatter = re.sub(
            r'(draft:\s*\w+)',
            f'\\1\nogImage: "{img_path}"',
            frontmatter,
            count=1
        )
    elif 'category:' in frontmatter:
        frontmatter = re.sub(
            r'(category:\s*\w+)',
            f'\\1\nogImage: "{img_path}"',
            frontmatter,
            count=1
        )
    else:
        # Fallback: add before closing
        frontmatter = frontmatter.rstrip() + f'\nogImage: "{img_path}"\n'
    
    new_content = f'---{frontmatter}---{parts[2]}'
    
    with open(post_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return 'inserted'


print("=== Hero Image Insertion Script ===\n")

# Step 1: Copy images
copied = 0
print("--- Copying images from Session 1 (primary) ---")
for img_key, slug in SESSION1_MAP.items():
    src = find_image(SESSION1, img_key)
    if src:
        dest = os.path.join(IMG_DIR, f"{slug}-hero.png")
        shutil.copy2(src, dest)
        print(f"  ✅ {img_key} -> {slug}-hero.png ({os.path.getsize(dest) // 1024}KB)")
        copied += 1
    else:
        print(f"  ❌ Missing: {img_key}")

print(f"\n--- Copying images from Session 2 (secondary) ---")
for img_key, slug in SESSION2_MAP.items():
    src = find_image(SESSION2, img_key)
    if src:
        dest = os.path.join(IMG_DIR, f"{slug}-hero.png")
        shutil.copy2(src, dest)
        print(f"  ✅ {img_key} -> {slug}-hero.png ({os.path.getsize(dest) // 1024}KB)")
        copied += 1
    else:
        print(f"  ❌ Missing: {img_key}")

print(f"\nTotal images copied: {copied}")

# Step 2: Insert ogImage into frontmatter
print("\n--- Inserting ogImage into frontmatter ---")
all_slugs = {**SESSION1_MAP, **SESSION2_MAP}
inserted = 0
skipped = 0

for img_key, slug in all_slugs.items():
    img_path = f"/assets/images/blog/{slug}-hero.png"
    
    for lang in ['ko', 'en', 'ja']:
        post_file = os.path.join(BLOG_DIR, f"src/data/blog/{lang}/{slug}.md")
        if os.path.exists(post_file):
            result = insert_og_image(post_file, img_path)
            if result == 'inserted':
                print(f"  ✅ {lang}/{slug}")
                inserted += 1
            elif result == 'skip':
                print(f"  ⏭️  {lang}/{slug} (already has ogImage)")
                skipped += 1
            else:
                print(f"  ⚠️  {lang}/{slug} ({result})")

print(f"\n--- Summary ---")
print(f"  Images copied: {copied}")
print(f"  Frontmatter updated: {inserted}")
print(f"  Skipped (existing): {skipped}")

# Check for uncovered posts
all_covered_slugs = set(all_slugs.values())
all_covered_slugs.add("coredo-nihonbashi-mitsui-redevelopment")  # Already has ogImage
ko_dir = os.path.join(BLOG_DIR, "src/data/blog/ko")
for f in os.listdir(ko_dir):
    if f.endswith('.md') and not f.startswith('_'):
        slug = f[:-3]
        if slug not in all_covered_slugs:
            print(f"  ⚠️  Uncovered post: {slug}")
