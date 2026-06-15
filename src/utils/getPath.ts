import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` in return value
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true
) {
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => slugifyStr(segment)); // slugify each segment path

  let prefix = "";
  
  if (pathSegments && pathSegments.length > 0) {
    const locale = pathSegments[0];
    // Set locale prefix for routing
    if (locale === "ko" || locale === "ja") {
      prefix = `/${locale}`;
    }
    // Remove the locale from the segments so it isn't appended after /posts
    if (["en", "ko", "ja"].includes(locale)) {
      pathSegments.shift();
    }
  }

  const basePath = includeBase ? `${prefix}/posts` : `${prefix}`;

  // Making sure `id` does not contain the directory
  const blogId = id.split("/");
  const slug = blogId.length > 0 ? blogId.slice(-1) : blogId;

  // If not inside the sub-dir, simply return the file path
  let path: string;
  if (!pathSegments || pathSegments.length < 1) {
    path = [basePath, slug].join("/").replace("//", "/");
  } else {
    path = [basePath, ...pathSegments, slug].join("/").replace("//", "/");
  }

  return path.endsWith("/") ? path : `${path}/`;
}
