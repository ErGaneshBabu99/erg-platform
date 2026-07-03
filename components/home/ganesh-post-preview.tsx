/**
 * GaneshPostPreview — Step 7 Homepage Polish
 * Async Server Component — fetches latest 3 posts from Blogger feed.
 * Mobile-first layout: stacked on mobile, 5-col grid on desktop.
 * Plain <img> — no next.config changes needed.
 */

import Link from "next/link";
import { fetchLatestPosts, BlogPost } from "@/lib/blogger";
import { ArrowRight, Clock, ExternalLink, Rss } from "lucide-react";

// ─── Large Featured Card ──────────────────────────────────────────────────────

function LargeCard({ post }: { post: BlogPost }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 h-full">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/85 backdrop-blur-sm text-white">
            Latest
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/40 backdrop-blur-sm border border-white/15 text-white/90">
            {post.category}
          </span>
        </div>

        {/* Read time */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] text-white/70 bg-black/40 backdrop-blur-sm border border-white/10">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
          {post.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/30">{post.formattedDate}</span>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors group/link"
          >
            Read
            <ExternalLink className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Compact Horizontal Card ──────────────────────────────────────────────────

function CompactCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">
            {post.category}
          </span>
          <h4 className="text-sm font-semibold text-white/85 line-clamp-2 mt-0.5 group-hover:text-blue-300 transition-colors">
            {post.title}
          </h4>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-white/30">{post.formattedDate}</span>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            Read <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default async function GaneshPostPreview() {
  const posts = await fetchLatestPosts(3);

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/8 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-3">
              <Rss className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                The Ganesh Post
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Latest from the{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Blog
              </span>
            </h2>
            <p className="mt-2 text-white/45 text-sm max-w-md">
              Engineering insights synced live from{" "}
              <a
                href="https://theganeshpost.blogspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                TheGaneshPost
              </a>
              .
            </p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors shrink-0"
          >
            View all articles
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Large card — full width on mobile, 3 cols on desktop */}
          <div className="lg:col-span-3">
            {posts[0] && <LargeCard post={posts[0]} />}
          </div>

          {/* Right column — 2 compact + CTA */}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
            {posts[1] && <CompactCard post={posts[1]} />}
            {posts[2] && <CompactCard post={posts[2]} />}

            {/* Visit Blogger CTA */}
            <a
              href="https://theganeshpost.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-4 rounded-xl border border-dashed border-white/10 hover:border-blue-500/35 hover:bg-blue-500/5 transition-all duration-300 mt-auto"
            >
              <div>
                <p className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors">
                  Read more on TheGaneshPost
                </p>
                <p className="text-xs text-white/25">theganeshpost.blogspot.com</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/25 group-hover:text-blue-400 transition-colors shrink-0" />
            </a>
          </div>
        </div>

        {/* ── Live sync badge ── */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>Auto-synced · Updates every hour</span>
        </div>
      </div>
    </section>
  );
}
