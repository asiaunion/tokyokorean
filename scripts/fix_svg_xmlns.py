#!/usr/bin/env python3
"""
fix_svg_xmlns.py
Scan all SVG files under public/assets/images/blog/svg/
and add xmlns="http://www.w3.org/2000/svg" to the root <svg> tag if missing.
"""

import re
from pathlib import Path

SVG_DIR = Path("public/assets/images/blog/svg")

fixed_count = 0

for svg_file in sorted(SVG_DIR.glob("*.svg")):
    content = svg_file.read_text(encoding="utf-8")
    
    # Check if xmlns is already present
    if 'xmlns="http://www.w3.org/2000/svg"' in content or "xmlns='http://www.w3.org/2000/svg'" in content:
        continue
    
    # Try to insert xmlns in the root <svg> tag
    # Match <svg followed by spaces or other attributes
    new_content = re.sub(
        r'<svg\b',
        r'<svg xmlns="http://www.w3.org/2000/svg"',
        content,
        count=1
    )
    
    if new_content != content:
        svg_file.write_text(new_content, encoding="utf-8")
        print(f"✅ Fixed namespace: {svg_file.name}")
        fixed_count += 1

print(f"\nCompleted! Fixed {fixed_count} SVG files.")
