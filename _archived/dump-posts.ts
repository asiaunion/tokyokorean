import { getCollection } from "astro:content";
import fs from "fs";
const posts = await getCollection("blog");
fs.writeFileSync("posts-dump.json", JSON.stringify(posts, null, 2));
