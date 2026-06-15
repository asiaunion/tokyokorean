#!/usr/bin/env python3
"""
Escape bare &, <, > inside SVG <text> nodes so browsers and resvg can parse files.
Run before render-diagrams-to-webp.mjs. Idempotent for already-escaped entities.
"""
import re
from pathlib import Path

SVG_DIR = Path("public/assets/images/blog/svg")


def escape_text_inner(s: str) -> str:
    s = s.replace("\\~", "~")
    # Order matters: & first (avoid double-escape)
    s = re.sub(r"&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-fA-F]+;)", "&amp;", s)
    s = s.replace("<", "&lt;").replace(">", "&gt;")
    return s


def sanitize_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    original = content

    def repl_text(m: re.Match) -> str:
        open_tag, inner, close = m.group(1), m.group(2), m.group(3)
        return f"{open_tag}{escape_text_inner(inner)}{close}"

    content = re.sub(
        r"(<text\b[^>]*>)([\s\S]*?)(</text>)",
        repl_text,
        content,
        flags=re.IGNORECASE,
    )

    if content != original:
        path.write_text(content, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for svg in sorted(SVG_DIR.glob("*.svg")):
        if sanitize_file(svg):
            print(f"  sanitized: {svg.name}")
            changed += 1
    print(f"Done. {changed} file(s) updated.")


if __name__ == "__main__":
    main()
