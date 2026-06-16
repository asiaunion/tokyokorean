from PIL import Image
import os

profile_path = "public/assets/images/gsf-author-profile.webp"

im = Image.open("/Users/gsf/.gemini/antigravity/brain/5c651f10-4695-4f0c-85a6-b555dbc4481e/media__1781603148533.jpg")
box = (70, 220, 370, 520)
im_crop = im.crop(box)
im_crop.save(profile_path, "WEBP", quality=85)
print("Saved!")
