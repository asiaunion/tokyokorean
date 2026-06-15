import os
import re
from datetime import datetime
import random
from datetime import timedelta

# Regex to find modDatetime in Markdown frontmatter
MOD_DATE_PATTERN = re.compile(r"modDatetime:\s*.*")

def bump_all_dates(blog_dir="src/data/blog"):
    """
    Randomly bumps the modDatetime of all markdown files in the given directory
    to a datetime within the last 48 hours to trigger a crawl budget reset (Dormancy Revival).
    """
    if not os.path.exists(blog_dir):
        print(f"Directory {blog_dir} not found. Please run this script at the root of GSF-Blog.")
        return

    count = 0
    now = datetime.now()
    
    for root, _, files in os.walk(blog_dir):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                
                # Generate a random time within the last 48 hours to simulate organic human editing
                random_hours = random.randint(1, 48)
                random_minutes = random.randint(0, 59)
                new_date = now - timedelta(hours=random_hours, minutes=random_minutes)
                formatted_date = new_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Only update if modDatetime exists in frontmatter
                if MOD_DATE_PATTERN.search(content):
                    new_content = MOD_DATE_PATTERN.sub(f"modDatetime: {formatted_date}", content)
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"✅ Bumped {file} -> {formatted_date}")
                    count += 1
                
    print(f"\n🎉 Successfully bumped {count} files.")
    print("To trigger Google SEO Crawler: Run `git commit -am 'chore: revive domains' && git push`")

if __name__ == "__main__":
    bump_all_dates()
