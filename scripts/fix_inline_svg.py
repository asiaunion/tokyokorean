#!/usr/bin/env python3
"""
fix_inline_svg.py
모든 .md 파일에서 인라인 SVG 블록을 찾아:
  1) public/assets/images/blog/svg/<slug>.svg 로 저장
  2) 원본 SVG 블록을 ![alt text](/assets/images/blog/svg/<slug>.svg) 로 교체

실행: python3 scripts/fix_inline_svg.py
"""

import re, sys
from pathlib import Path

BLOG_DIR  = Path("src/data/blog")
SVG_DIR   = Path("public/assets/images/blog/svg")
SVG_DIR.mkdir(parents=True, exist_ok=True)

# <svg ...> ... </svg> 블록 매칭 (줄이 <svg 로 시작하는 것만)
SVG_PATTERN = re.compile(
    r'(?m)^<svg\b[^>]*>.*?</svg>',
    re.DOTALL
)

fixed_files = []
skipped     = []

for md_file in sorted(BLOG_DIR.rglob("*.md")):
    text = md_file.read_text(encoding="utf-8")
    matches = list(SVG_PATTERN.finditer(text))
    if not matches:
        continue

    new_text = text
    for i, m in enumerate(matches):
        svg_code = m.group(0)

        # aria-label에서 alt 텍스트 추출
        aria = re.search(r'aria-label="([^"]*)"', svg_code)
        alt_text = aria.group(1) if aria else "Chart"

        # 파일명: {lang}-{slug}-chart[-N].svg
        lang = md_file.parent.name          # en / ko / ja
        slug = md_file.stem                  # post slug
        suffix = f"-{i+1}" if len(matches) > 1 else ""
        svg_name = f"{lang}-{slug}{suffix}.svg"
        svg_path = SVG_DIR / svg_name
        public_path = f"/assets/images/blog/svg/{svg_name}"

        # SVG 파일 저장
        svg_path.write_text(svg_code, encoding="utf-8")

        # 마크다운 이미지 태그로 교체
        replacement = f"![{alt_text}]({public_path})"
        new_text = new_text.replace(svg_code, replacement, 1)

        print(f"  ✅ {md_file.relative_to('.')} → {public_path}")

    if new_text != text:
        md_file.write_text(new_text, encoding="utf-8")
        fixed_files.append(str(md_file))

print(f"\n{'='*60}")
print(f"완료: {len(fixed_files)}개 파일 수정, SVG {sum(len(list(SVG_PATTERN.finditer(Path(f).read_text()))) for f in [])}개 추출")
print(f"수정된 파일 목록:")
for f in fixed_files:
    print(f"  - {f}")
