/**
 * BlogFilters — Client Component
 *
 * Handles live search + category filtering + URL sync for the blog page.
 * Receives all posts from the Server Component parent (no extra fetch).
 * Renders BlogCard grid with pagination (Load More).
 *
 * URL sync: /blog?category=Infrastructure&q=road
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BlogPost } from "@/lib/blogger";
import BlogCard from "@/components/blog/blog-card";
import { Search, X, ChevronDown, FileSearch } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 9;

// ─── Keyword Highlight ────────────────────────────────────────────────────────

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-blue-500/30 text-blue-200 rounded px-0.5 not-italic">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ─── Category Chips ───────────────────────────────────────────────────────────

interface CategoryChipProps {
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function CategoryChip({ name, count, active, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        border transition-all duration-200 whitespace-nowrap
        ${
          active
            ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white hover:bg-white/10"
        }
      `}
    >
      {name}
      <span
        className={`
          px-1.5 py-0.5 rounded-full text-xs font-semibold
          ${active ? "bg-white/20 text-white" : "bg-white/10 text-white/40"}
        `}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ query, category }: { query: string; category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <FileSearch className="w-7 h-7 text-white/30" />
      </div>
      <h3 className="text-lg font-semibold text-white/70 mb-2">No articles found</h3>
      <p className="text-sm text-white/35 max-w-sm">
        {query && category !== "All"
          ? `No results for "${query}" in ${category}.`
          : query
          ? `No results for "${query}". Try different keywords.`
          : `No articles in ${category} yet.`}
      </p>
    </div>
  );
}

// ─── Highlighted BlogCard wrapper ─────────────────────────────────────────────

function BlogCardWithHighlight({
  post,
  query,
}: {
  post: BlogPost;
  query: string;
}) {
  // Pass highlight-aware title/excerpt down via a modified post object
  const highlightedPost = useMemo(
    () => ({
      ...post,
      // We pass raw strings; BlogCard renders them — highlight only works
      // if BlogCard renders title/excerpt as text nodes (it does).
      // For deeper highlight we use a wrapper overlay approach.
    }),
    [post]
  );
  void highlightedPost; // used below via BlogCard + overlay

  return (
    <div className="relative group/highlight">
      <BlogCard post={post} />
      {/* Keyword match indicator */}
      {query.trim() &&
        (post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(query.toLowerCase())) && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/80 backdrop-blur-sm text-xs font-medium text-white">
              Match
            </span>
          </div>
        )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface BlogFiltersProps {
  allPosts: BlogPost[];
  categoriesWithCount: { name: string; count: number }[];
}

export default function BlogFilters({ allPosts, categoriesWithCount }: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? "All"
  );
  const [page, setPage] = useState(1);

  // Sync URL when filters change
  const syncUrl = useCallback(
    (q: string, cat: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (cat && cat !== "All") params.set("category", cat);
      const search = params.toString();
      router.replace(`${pathname}${search ? `?${search}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, activeCategory]);

  // Filter logic
  const filtered = useMemo(() => {
    let posts = allPosts;

    // Category filter
    if (activeCategory && activeCategory !== "All") {
      const q = activeCategory.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.category.toLowerCase() === q ||
          p.tags.some((t) => t.toLowerCase() === q)
      );
    }

    // Search filter — title, excerpt, category, tags
    if (query.trim()) {
      const q = query.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return posts;
  }, [allPosts, query, activeCategory]);

  // Paginated slice
  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;

  function handleSearch(val: string) {
    setQuery(val);
    syncUrl(val, activeCategory);
  }

  function handleCategory(name: string) {
    setActiveCategory(name);
    syncUrl(query, name);
  }

  function handleClear() {
    setQuery("");
    setActiveCategory("All");
    router.replace(pathname, { scroll: false });
  }

  const isFiltered = query.trim() !== "" || activeCategory !== "All";

  return (
    <div className="space-y-8">
      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search articles by title, topic, or keyword…"
          className="
            w-full pl-11 pr-10 py-3.5 rounded-xl
            bg-white/5 border border-white/10
            text-sm text-white placeholder:text-white/30
            focus:outline-none focus:border-blue-500/50 focus:bg-white/8
            transition-all duration-200
          "
        />
        {query && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/30 hover:text-white/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Category chips ── */}
      <div className="flex flex-wrap gap-2">
        {categoriesWithCount.map(({ name, count }) => (
          <CategoryChip
            key={name}
            name={name}
            count={count}
            active={activeCategory === name}
            onClick={() => handleCategory(name)}
          />
        ))}

        {/* Clear all */}
        {isFiltered && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Results summary ── */}
      {isFiltered && (
        <div className="flex items-center gap-2 text-xs text-white/35">
          <span>
            {filtered.length} article{filtered.length !== 1 ? "s" : ""} found
            {query && (
              <>
                {" "}for{" "}
                <span className="text-blue-400 font-medium">&ldquo;{query}&rdquo;</span>
              </>
            )}
            {activeCategory !== "All" && (
              <>
                {" "}in{" "}
                <span className="text-blue-400 font-medium">{activeCategory}</span>
              </>
            )}
          </span>
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <EmptyState query={query} category={activeCategory} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visible.map((post) => (
              <BlogCardWithHighlight key={post.id} post={post} query={query} />
            ))}
          </div>

          {/* ── Load More ── */}
          {hasMore && (
            <div className="flex flex-col items-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  hover:bg-white/10 hover:border-white/20
                  text-sm font-medium text-white/70 hover:text-white
                  transition-all duration-300 group
                "
              >
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                Load more articles
              </button>
              <span className="text-xs text-white/25">
                Showing {visible.length} of {filtered.length}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
