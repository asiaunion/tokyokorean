import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
console.log("Total posts:", posts.length);
console.log("Post IDs:", posts.map(p => p.id));
