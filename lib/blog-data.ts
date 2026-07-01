/**
 * blog-data.ts
 *
 * Re-exports from blogger.ts for backward compatibility.
 * All blog data is now live-fetched from TheGaneshPost Blogger feed.
 *
 * Legacy static imports still work via the BlogPost type and FALLBACK_POSTS.
 */

export type { BlogPost } from "./blogger";
export {
  fetchBloggerPosts,
  fetchBloggerPostBySlug,
  fetchLatestPosts,
  fetchPostsByCategory,
  fetchCategories,
} from "./blogger";

/**
 * Legacy named export for any component still using `import { posts } from '@/lib/blog-data'`
 * Returns a promise — components should be made async or use the fetch functions above.
 *
 * @deprecated Use fetchBloggerPosts() instead
 */
export async function getPosts() {
  const { fetchBloggerPosts } = await import("./blogger");
  return fetchBloggerPosts();
}
