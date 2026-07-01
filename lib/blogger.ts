/**
 * Blogger Feed Integration — Phase 6 Enhanced
 * Fetches posts from TheGaneshPost Blogger blog using the public JSON feed API.
 * No API key required. Frontend-only. Uses Next.js fetch caching.
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage: string;
  date: string;
  formattedDate: string;
  readTime: string;
  wordCount: number;
  category: string;
  tags: string[];
  image: string;
  url: string;
  featured: boolean;
}

const BLOG_ID = "theganeshpost";
const FEED_URL = `https://${BLOG_ID}.blogspot.com/feeds/posts/default?alt=json&max-results=50`;

// ─── Fallback Posts ───────────────────────────────────────────────────────────

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "fallback-1",
    slug: "civil-engineering-trends-nepal-2025-fallback1",
    title: "Civil Engineering Trends Shaping Nepal in 2025",
    excerpt:
      "Exploring the latest developments in infrastructure, sustainable construction, and engineering practices transforming Nepal's built environment.",
    content: "",
    author: "Ganesh Chapagain",
    authorImage: "/images/founder/ganesh-1.jpg",
    date: "2025-01-15",
    formattedDate: "January 15, 2025",
    readTime: "5 min read",
    wordCount: 1000,
    category: "Infrastructure",
    tags: ["Civil Engineering", "Nepal", "Infrastructure"],
    image: "/images/blog/placeholder.jpg",
    url: "https://theganeshpost.blogspot.com",
    featured: true,
  },
  {
    id: "fallback-2",
    slug: "district-rates-guide-nepal-fallback2",
    title: "Understanding District Rates for Construction in Nepal",
    excerpt:
      "A comprehensive guide to navigating Nepal's district rates system for accurate project cost estimation.",
    content: "",
    author: "Ganesh Chapagain",
    authorImage: "/images/founder/ganesh-1.jpg",
    date: "2025-01-08",
    formattedDate: "January 8, 2025",
    readTime: "7 min read",
    wordCount: 1400,
    category: "Cost Estimation",
    tags: ["District Rates", "Cost Estimation", "Nepal"],
    image: "/images/blog/placeholder.jpg",
    url: "https://theganeshpost.blogspot.com",
    featured: false,
  },
  {
    id: "fallback-3",
    slug: "sustainable-construction-practices-fallback3",
    title: "Sustainable Construction Practices for Himalayan Terrain",
    excerpt:
      "How modern civil engineers are adapting global sustainability standards to Nepal's unique geographical and climatic challenges.",
    content: "",
    author: "Ganesh Chapagain",
    authorImage: "/images/founder/ganesh-1.jpg",
    date: "2024-12-20",
    formattedDate: "December 20, 2024",
    readTime: "6 min read",
    wordCount: 1200,
    category: "Sustainability",
    tags: ["Sustainable", "Construction", "Environment"],
    image: "/images/blog/placeholder.jpg",
    url: "https://theganeshpost.blogspot.com",
    featured: false,
  },
];

// ─── Parse Helpers ────────────────────────────────────────────────────────────

/**
 * Strips HTML tags and returns plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Extracts a clean excerpt from HTML. Fixed encoding — uses proper ellipsis char.
 */
function extractExcerpt(html: string, maxLength = 200): string {
  const text = stripHtml(html);
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + "\u2026" : text;
}

/**
 * Counts words in HTML content for read time calculation.
 */
function countWords(html: string): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates read time. Average reading speed: 220 wpm.
 */
function estimateReadTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min read`;
}

/**
 * Extracts the best available image from a Blogger entry.
 * Priority: media$thumbnail → first <img> in content → og image → placeholder.
 * Upgrades to high-resolution version by replacing Blogger's size tokens.
 */
function extractImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entry: any,
  content: string
): string {
  let url = "";

  // 1. Blogger media thumbnail (most reliable)
  if (entry["media$thumbnail"]?.url) {
    url = entry["media$thumbnail"].url as string;
  }

  // 2. First <img src> or <img data-src> in content
  if (!url) {
    const match =
      content.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i) ||
      content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) url = match[1];
  }

  if (!url) return "/images/blog/placeholder.jpg";

  // Upgrade Blogger CDN image to high resolution
  // Patterns: /s72-c/, /s320/, /s640/, /w72-h72/, etc.
  url = url
    .replace(/\/s\d+-c\//, "/s800/")
    .replace(/\/s\d+\//, "/s800/")
    .replace(/\/w\d+-h\d+(-[^/]*)?\//, "/s800/");

  return url;
}

/**
 * Converts title to a URL-safe slug.
 * Handles Nepali unicode by stripping non-ASCII safely.
 */
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")                    // decompose unicode
    .replace(/[\u0300-\u036f]/g, "")     // strip diacritics
    .replace(/[^\x00-\x7F]/g, "-")      // replace non-ASCII (Nepali etc.) with hyphen
    .replace(/[^a-z0-9\s-]/g, "")       // strip remaining specials
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * Smart category extraction.
 * Prefers engineering-relevant labels over generic ones.
 */
const ENGINEERING_KEYWORDS = [
  "infrastructure", "hydropower", "bridge", "road", "construction",
  "survey", "estimation", "design", "environment", "sustainability",
  "nepal", "structure", "material", "concrete", "soil", "foundation",
  "irrigation", "water", "building", "earthquake", "geotechnical",
];

function extractCategory(labels: string[]): string {
  if (!labels || labels.length === 0) return "Engineering";

  // Prefer a label that matches engineering keywords
  const match = labels.find((l) =>
    ENGINEERING_KEYWORDS.some((kw) => l.toLowerCase().includes(kw))
  );
  return match ?? labels[0];
}

/**
 * Formats a date string to human-readable format.
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Extracts ISO date string (YYYY-MM-DD).
 */
function extractISODate(dateString: string): string {
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

// ─── Entry Parser ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBloggerEntry(entry: any, index: number): BlogPost {
  const title = (entry.title?.$t as string | undefined)?.trim() || "Untitled";
  const content = (entry.content?.$t || entry.summary?.$t || "") as string;
  const published = (entry.published?.$t as string | undefined) || new Date().toISOString();

  // Alternate (public HTML) link
  const links: { rel: string; href: string }[] = entry.link || [];
  const bloggerUrl =
    links.find((l) => l.rel === "alternate")?.href ||
    "https://theganeshpost.blogspot.com";

  // Stable post ID from Blogger entry ID string
  const rawId = (entry.id?.$t as string | undefined) || "";
  const postId = rawId.split(".post-")[1] || String(index + 1);

  // Labels / tags
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labels: string[] = (entry.category || []).map((c: any) => c.term as string);

  const image = extractImage(entry, content);
  const isoDate = extractISODate(published);
  const words = countWords(content);

  return {
    id: postId,
    slug: `${titleToSlug(title)}-${postId}`,
    title,
    excerpt: extractExcerpt(content),
    content,
    author: (entry.author?.[0]?.name?.$t as string | undefined) || "Ganesh Chapagain",
    authorImage: "/images/founder/ganesh-1.jpg",
    date: isoDate,
    formattedDate: formatDate(published),
    wordCount: words,
    readTime: estimateReadTime(words),
    category: extractCategory(labels),
    tags: labels,
    image,
    url: bloggerUrl,
    featured: index === 0,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches all posts from the Blogger JSON feed.
 * Cached by Next.js ISR — revalidates every hour.
 */
export async function fetchBloggerPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[blogger] Feed returned ${res.status}. Using fallback.`);
      return FALLBACK_POSTS;
    }

    const data = await res.json();
    const entries = data?.feed?.entry;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      console.warn("[blogger] No entries in feed. Using fallback.");
      return FALLBACK_POSTS;
    }

    return entries.map(parseBloggerEntry);
  } catch (err) {
    console.warn("[blogger] Fetch failed:", err);
    return FALLBACK_POSTS;
  }
}

/**
 * Fetches a single post by slug.
 */
export async function fetchBloggerPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchBloggerPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/**
 * Fetches N most recent posts.
 */
export async function fetchLatestPosts(count = 3): Promise<BlogPost[]> {
  const posts = await fetchBloggerPosts();
  return posts.slice(0, count);
}

/**
 * Fetches posts filtered by category.
 */
export async function fetchPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await fetchBloggerPosts();
  if (!category || category === "All") return posts;
  const q = category.toLowerCase();
  return posts.filter(
    (p) =>
      p.category.toLowerCase() === q ||
      p.tags.some((t) => t.toLowerCase() === q)
  );
}

/**
 * Returns unique categories with post counts.
 * Format: [{ name: "All", count: 12 }, { name: "Infrastructure", count: 4 }, ...]
 */
export async function fetchCategoriesWithCount(): Promise<{ name: string; count: number }[]> {
  const posts = await fetchBloggerPosts();
  const map = new Map<string, number>();

  posts.forEach((p) => {
    if (p.category) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
  });

  const cats = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1]) // sort by count descending
    .map(([name, count]) => ({ name, count }));

  return [{ name: "All", count: posts.length }, ...cats];
}

/**
 * Legacy: returns category names only (for backward compat).
 */
export async function fetchCategories(): Promise<string[]> {
  const cats = await fetchCategoriesWithCount();
  return cats.map((c) => c.name);
}

/**
 * Returns previous and next posts relative to a given post ID.
 * Useful for Prev/Next navigation on article page.
 */
export async function fetchAdjacentPosts(
  currentId: string
): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  const posts = await fetchBloggerPosts();
  const idx = posts.findIndex((p) => p.id === currentId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}
