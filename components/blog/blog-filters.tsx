/**
 * BlogFilters — Client Component
 * Step 5+6: Performance + Mobile responsiveness improvements.
 *
 * - Horizontal scroll category chips on mobile
 * - Full-width search on mobile
 * - 1 col grid on mobile, 2 on md, 3 on xl
 * - Load More button centered properly on all sizes
 * - URL sync: /blog?category=X&q=keyword
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BlogPost } from "@/lib/blogger";
import BlogCard from "@/components/blog/blog-card";
import { Search, X, ChevronDown, FileSearch, SlidersHorizontal } from "lucide-react";

const PAGE_SIZE = 9;

// ─── Category Chip ────────────────────────────────────────────────────────────

function CategoryChip({
  name,
  count,
  active,
  onClick,
}: {
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-xs font-medium border whitespace-nowrap
        transition-all duration-200 active:scale-95
        ${
          active
            ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white hover:bg-white/8"
        }
      `}
    >
      {name}
      <span
        className={`
          px-1.5 py-0.5 rounded-full text-[10px] font-bold
          ${active ? "bg-white/25 text-white" : "bg-white/8 text-white/40"}
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
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <FileSearch className="w-6 h-6 sm:w-7 sm:h-7 text-white/30" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-white/70 mb-2">
        No articles found
      </h3>
      <p className="text-sm text-white/35 max-w-xs">
        {query && category !== "All"
          ? `No results for "${query}" in ${category}.`
          : query
          ? `No results for "${query}". Try different keywords.`
          : `No articles in ${category} yet.`}
      </p>
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
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? "All"
  );
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const syncUrl = useCallback(
    (q: string, cat: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (cat && cat !== "All") params.set("category", cat);
      const search = params.toString();
      startTransition(() => {
        router.replace(`${pathname}${search ? `?${search}` : ""}`, { scroll: false });
      });
    },
    [router, pathname]
  );

  useEffect(() => {
    setPage(1);
  }, [query, activeCategory]);

  const filtered = useMemo(() => {
    let posts = allPosts;
    if (activeCategory && activeCategory !== "All") {
      const q = activeCategory.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.category.toLowerCase() === q ||
          p.tags.some((t) => t.toLowerCase() === q)
      );
    }
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

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;
  const isFiltered = query.trim() !== "" || activeCategory !== "All";

  function handleSearch(val: string) {
    setQuery(val);
    syncUrl(val, activeCategory);
  }

  function handleCategory(name: string) {
    setActiveCategory(name);
    setShowFilters(false);
    syncUrl(query, name);
  }

  function handleClear() {
    setQuery("");
    setActiveCategory("All");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  return (
    <div className="space-y-6">

      {/* ── Search + filter toggle (mobile) ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search articles…"
            className="
              w-full pl-10 pr-9 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-sm text-white placeholder:text-white/30
              focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07]
              transition-all duration-200
            "
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile: toggle category panel */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`
            sm:hidden flex items-center justify-center w-12 h-12 rounded-xl border transition-all duration-200
            ${showFilters
              ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
              : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }
          `}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* ── Category chips ── */}
      {/* Desktop: always visible wrap */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {categoriesWithCount.map(({ name, count }) => (
          <CategoryChip
            key={name}
            name={name}
            count={count}
            active={activeCategory === name}
            onClick={() => handleCategory(name)}
          />
        ))}
        {isFiltered && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Mobile: collapsible panel */}
      {showFilters && (
        <div className="sm:hidden flex flex-wrap gap-2 p-4 rounded-xl bg-white/3 border border-white/8">
          {categoriesWithCount.map(({ name, count }) => (
            <CategoryChip
              key={name}
              name={name}
              count={count}
              active={activeCategory === name}
              onClick={() => handleCategory(name)}
            />
          ))}
          {isFiltered && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Results count ── */}
      {isFiltered && (
        <p className="text-xs text-white/35">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""} found
          {query && (
            <> for <span className="text-blue-400 font-medium">&ldquo;{query}&rdquo;</span></>
          )}
          {activeCategory !== "All" && (
            <> in <span className="text-blue-400 font-medium">{activeCategory}</span></>
          )}
          {isPending && <span className="ml-2 text-white/20">updating…</span>}
        </p>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <EmptyState query={query} category={activeCategory} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {visible.map((post) => (
              <div key={post.id} className="relative">
                <BlogCard post={post} />
                {/* Match badge */}
                {query.trim() &&
                  (post.title.toLowerCase().includes(query.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(query.toLowerCase())) && (
                    <div className="absolute top-3 right-3 z-10 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/80 backdrop-blur-sm text-[10px] font-semibold text-white">
                        Match
                      </span>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* ── Load More ── */}
          {hasMore && (
            <div className="flex flex-col items-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="
                  w-full sm:w-auto inline-flex items-center justify-center gap-2
                  px-6 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  hover:bg-white/8 hover:border-white/18
                  active:scale-[0.98]
                  text-sm font-medium text-white/70 hover:text-white
                  transition-all duration-300 group
                "
              >
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                Load more articles
              </button>
              <span className="text-xs text-white/25">
                {visible.length} of {filtered.length} articles
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
