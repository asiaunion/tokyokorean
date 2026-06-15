import os
import re

def fix_strikethrough(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into frontmatter and body
    parts = content.split('---', 2)
    if len(parts) < 3:
        return
        
    frontmatter = parts[1]
    body = parts[2]
    
    # In the body, replace ~ with \~, but avoid double escaping
    # Also avoid replacing ~ inside code blocks or inline code if possible?
    # Actually, for this blog, ~ is mostly used for ranges.
    
    # Regex to find ~ not preceded by \
    # We use a negative lookbehind if possible, but python's re supports it.
    fixed_body = re.sub(r'(?<!\\)~', r'\~', body)
    
    new_content = '---' + frontmatter + '---' + fixed_body
    
    if content != new_content:
        print(f"Fixed strikethrough in {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

base_dir = "src/data/blog"
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".md"):
            fix_strikethrough(os.path.join(root, file))
