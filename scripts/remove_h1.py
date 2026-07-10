import os
import glob

directory = "/Users/gsf/.gemini/antigravity/scratch/projects/TokyoKorean/src/data/blog/ko/"
md_files = glob.glob(os.path.join(directory, "*.md"))

for file_path in md_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = [line for line in lines if not line.startswith("# ")]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
        
print("Removed H1 titles from all markdown files.")
