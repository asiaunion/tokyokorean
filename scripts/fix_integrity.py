import os
import re

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    if not lines or lines[0].strip() != '---':
        return
        
    end_index = -1
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            end_index = i
            break
    
    if end_index == -1:
        return
        
    frontmatter_lines = lines[1:end_index]
    
    sources = []
    references = []
    
    in_sources = False
    in_references = False
    
    source_start = -1
    reference_start = -1
    
    for i, line in enumerate(frontmatter_lines):
        if line.startswith('sources:'):
            in_sources = True
            in_references = False
            source_start = i
        elif line.startswith('references:'):
            in_references = True
            in_sources = False
            reference_start = i
        elif line.strip().startswith('-') and (in_sources or in_references):
            url = line.strip()[1:].strip().strip('"').strip("'")
            if in_sources:
                sources.append(url)
            else:
                references.append(url)
        elif line.strip() and not line.strip().startswith('-'):
            in_sources = False
            in_references = False
            
    missing = [ref for ref in references if ref not in sources]
    
    if missing:
        print(f"Fixing {file_path}")
        # Add missing to sources list in the file
        # Find where sources list ends
        insert_pos = -1
        for i in range(source_start + 1, len(frontmatter_lines)):
            if not frontmatter_lines[i].strip().startswith('-'):
                insert_pos = i
                break
        if insert_pos == -1: insert_pos = len(frontmatter_lines)
        
        for m in missing:
            frontmatter_lines.insert(insert_pos, f"  - \"{m}\"\n")
            insert_pos += 1
            
        new_content = "---\n" + "".join(frontmatter_lines) + "---\n" + "".join(lines[end_index+1:])
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

for root, dirs, files in os.walk("src/data/blog"):
    for file in files:
        if file.endswith(".md"):
            fix_file(os.path.join(root, file))
