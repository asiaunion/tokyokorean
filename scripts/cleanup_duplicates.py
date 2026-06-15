import os
import re

def cleanup_duplicates(directory):
    action_headers = [
        "## Investor Action",
        "## Walking Action",
        "## Family Action",
        "## Practical Action"
    ]
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".md"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                modified = False
                new_content = content
                
                for header in action_headers:
                    # Find all occurrences of the section starting with the header
                    # and ending before the next header (## ) or end of file
                    pattern = rf"(?m)^{re.escape(header)}.*?(?=\n## |\Z)"
                    sections = re.findall(pattern, new_content, re.DOTALL)
                    
                    if len(sections) > 1:
                        print(f"Found {len(sections)} duplicates of '{header}' in {filepath}")
                        # Keep only the first occurrence
                        first_occurrence = sections[0].strip()
                        
                        # Replace all occurrences with just the first one
                        # We use a trick to replace the whole sequence of matches
                        # but that might be tricky if they are scattered.
                        # However, they seem to be contiguous in the files I saw.
                        
                        # Let's try to remove all occurrences and then re-insert one at the location of the first one.
                        # Actually, a simpler way: just replace the redundant ones with empty string.
                        
                        # To avoid replacing parts of other text, we'll replace the full matched sections.
                        # But since they might be identical, we can't just use .replace() easily for 'all but one'.
                        
                        # Refined approach: split by the pattern and join back with only one instance.
                        parts = re.split(pattern, new_content, flags=re.DOTALL)
                        # parts will have (len(sections) + 1) elements.
                        # We want: part[0] + sections[0] + part[1] + (empty) + part[2] ...
                        
                        # Reconstruct:
                        reconstructed = parts[0] + sections[0].strip() + "\n\n"
                        for i in range(1, len(parts)):
                            # Only add the part if it's not just whitespace between duplicates
                            part_content = parts[i].strip()
                            if part_content:
                                reconstructed += parts[i]
                            elif i < len(parts) - 1:
                                # Skip whitespace between duplicates
                                pass
                        
                        new_content = reconstructed
                        modified = True
                
                if modified:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content.strip() + "\n")
                    print(f"Cleaned up {filepath}")

if __name__ == "__main__":
    blog_dir = "src/data/blog"
    cleanup_duplicates(blog_dir)
