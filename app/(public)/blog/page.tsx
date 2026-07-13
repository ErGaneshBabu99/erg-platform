/**
 * Blog Page — /blog
 *
 * Server Component. Fetches all posts + categories once,
 * passes them to BlogFilters (Client Component) for live search/filter/pagination.
 * Hero article stays server-rendered above the filter section.
 */

import { Suspense } from "react";
import {
  fetchBloggerPosts,
  fetchCategoriesWithCount,
  BlogPost,
} from "@/lib/blogger";
import BlogHeroArticle from "@/components/blog/blog-hero-article";
import BlogFilters from "@/components/blog/blog-filters";
import BlogSidebar from "@/components/blog/blog-sidebar";
import { NewsletterCard } from "@/components/blog/newsletter-card";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { ExternalLink, Rss } from "lucide-react";
import { buildMetadata, SITE_URL } from "@/lib/seo";

// ─── Skeleton fallback ─────────────────────────────────────────────────────────

function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Hero Article (server) ─────────────────────────────────────────────────────

async function HeroArticleSection() {
  const posts = await fetchBloggerPosts();
  const featuredPost = posts.find((p: BlogPost) => p.featured) ?? posts[0];
  if (!featuredPost) return null;
  return <BlogHeroArticle post={featuredPost} />;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPage() {
  // Fetch everything server-side — passed as props to client filter component
  const [allPosts, categoriesWithCount] = await Promise.all([
    fetchBloggerPosts(),
    fetchCategoriesWithCount(),
  ]);

  // Exclude the hero post from the filterable grid
  const gridPosts = allPosts.slice(1);

  return (
    <main className="min-h-screen bg-[#080C14] text-white">
      {/* ── Page Header ── */}
      <div className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              {/* Live feed badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Rss className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Live Feed
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold">
                The{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Ganesh Post
                </span>
              </h1>
              <p className="mt-3 text-white/50 max-w-lg">
                Engineering insights, infrastructure analysis, and professional knowledge
                from Nepal&apos;s civil engineering community — auto-synced from Blogger.
              </p>
            </div>

            <a
              href="https://theganeshpost.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 text-sm font-medium text-white/70 hover:text-white transition-all duration-300 shrink-0"
            >
              Visit Blogger
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Hero Article */}
        <div className="mb-12">
          <Suspense
            fallback={
              <div className="h-96 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            }
          >
            <HeroArticleSection />
          </Suspense>
        </div>

        {/* Grid + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Filters + Articles */}
          <div className="lg:col-span-2">
            <Suspense fallback={<BlogGridSkeleton />}>
              <BlogFilters
                allPosts={gridPosts}
                categoriesWithCount={categoriesWithCount}
              />
            </Suspense>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-6">
            <BlogSidebar />
            <NewsletterCard />
          </aside>
        </div>
      </div>
    </main>
  );
}
