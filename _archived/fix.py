import os
from PIL import Image

# 1. Update text files
files_to_update = [
    "src/config.ts",
    "src/data/about/ko.md",
    "src/data/blog/ko/tokyo-life-cost-of-living.md",
    "src/i18n/ui.ts"
]

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content.replace("8년", "6년")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {file_path}")

# 2. Recrop image
profile_path = "public/assets/images/gsf-author-profile.webp"
im = Image.open("/Users/gsf/.gemini/antigravity/brain/5c651f10-4695-4f0c-85a6-b555dbc4481e/media__1781603148533.jpg")
# Shift the box to the right by 70 pixels
box = (140, 220, 440, 520)
im_crop = im.crop(box)
im_crop.save(profile_path, "WEBP", quality=85)
print("Recropped image.")
