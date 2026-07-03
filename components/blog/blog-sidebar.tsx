/**
 * BlogSidebar — Step 5 Performance
 * Converted to pure Server Component (was unnecessarily client-side).
 * Static content — no interactivity needed, no "use client" required.
 */

import Link from "next/link";
import { fetchLatestPosts, fetchCategoriesWithCount } from "@/lib/blogger";
import { TrendingUp, Tag, ExternalLink } from "lucide-react";

export default async function BlogSidebar() {
  const [recentPosts, categories] = await Promise.all([
    fetchLatestPosts(5),
    fetchCategoriesWithCount(),
  ]);

  // Remove "All" from sidebar categories
  const sidebarCategories = categories.filter((c) => c.name !== "All").slice(0, 8);

  return (
    <aside className="space-y-6" aria-label="Blog sidebar">

      {/* ── Recent Posts ── */}
      <section
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/8"
        aria-labelledby="recent-posts-heading"
      >
        <h2
          id="recent-posts-heading"
          className="flex items-center gap-2 text-sm font-bold text-white mb-4"
        >
          <TrendingUp className="w-4 h-4 text-blue-400" aria-hidden="true" />
          Recent Posts
        </h2>

        <ol className="space-y-4" role="list">
          {recentPosts.map((post, i) => (
            <li key={post.id} className="flex gap-3 group">
              {/* Number */}
              <span
                className="text-[11px] font-bold text-white/15 mt-0.5 w-4 shrink-0 tabular-nums"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div className="min-w-0">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-[13px] font-medium text-white/70 leading-snug
                    hover:text-blue-300 transition-colors duration-200
                    line-clamp-2 block
                    focus-visible:outline-none focus-visible:text-blue-300
                  "
                >
                  {post.title}
                </a>
                <span className="text-[11px] text-white/25 mt-1 block">
                  {post.formattedDate}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Categories ── */}
      <section
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/8"
        aria-labelledby="categories-heading"
      >
        <h2
          id="categories-heading"
          className="flex items-center gap-2 text-sm font-bold text-white mb-4"
        >
          <Tag className="w-4 h-4 text-blue-400" aria-hidden="true" />
          Categories
        </h2>

        <ul className="space-y-1.5" role="list">
          {sidebarCategories.map(({ name, count }) => (
            <li key={name}>
              <Link
                href={`/blog?category=${encodeURIComponent(name)}`}
                className="
                  flex items-center justify-between
                  px-3 py-2 rounded-lg
                  text-[13px] text-white/55 hover:text-white
                  bg-transparent hover:bg-white/5
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:rounded-lg
                "
              >
                <span>{name}</span>
                <span className="text-[11px] font-semibold text-white/25 tabular-nums">
                  {count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Visit Blogger CTA ── */}
      <a
        href="https://theganeshpost.blogspot.com"
        target="_blank"
        rel="noopener noreferrer"
        className="
          flex items-center justify-between
          p-4 rounded-xl
          border border-dashed border-white/10
          hover:border-blue-500/30 hover:bg-blue-500/5
          transition-all duration-300 group
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
        "
        aria-label="Visit TheGaneshPost on Blogger (opens in new tab)"
      >
        <div>
          <p className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors">
            TheGaneshPost
          </p>
          <p className="text-[11px] text-white/25">theganeshpost.blogspot.com</p>
        </div>
        <ExternalLink
          className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors shrink-0"
          aria-hidden="true"
        />
      </a>
    </aside>
  );
}
