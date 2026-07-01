/**
 * TheGaneshPost Preview Section
 * Async server component — fetches latest 3 posts from Blogger feed automatically.
 * Uses plain <img> for external Blogger URLs to avoid next.config changes.
 */

import Link from "next/link";
import { fetchLatestPosts, BlogPost } from "@/lib/blogger";
import { ArrowRight, Clock, Tag, ExternalLink } from "lucide-react";

// ─── Post Card ───────────────────────────────────────────────────────────────

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const isLarge = index === 0;

  if (isLarge) {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20">
        <div className="relative overflow-hidden aspect-[16/9]">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/90 backdrop-blur-sm text-white">
              {post.category}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/90 backdrop-blur-sm text-white">
              Latest
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
            {post.title}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
              <span>{post.formattedDate}</span>
            </div>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors group/link"
            >
              Read
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex items-center gap-1 text-xs text-blue-400">
            <Tag className="w-3 h-3" />
            {post.category}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
          {post.title}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">{post.formattedDate}</span>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
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
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-transparent" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                The Ganesh Post
              </span>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Latest from the{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Blog
              </span>
            </h2>
            <p className="mt-2 text-white/50 text-sm max-w-md">
              Insights on civil engineering, infrastructure, and Nepal&apos;s built environment —
              updated directly from{" "}
              <a
                href="https://theganeshpost.blogspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                TheGaneshPost
              </a>
              .
            </p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors shrink-0"
          >
            View all articles
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {posts[0] && <PostCard post={posts[0]} index={0} />}
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4 justify-between">
            {posts.slice(1).map((post, i) => (
              <PostCard key={post.id} post={post} index={i + 1} />
            ))}
            <a
              href="https://theganeshpost.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-4 rounded-xl border border-dashed border-white/15 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300"
            >
              <div>
                <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Read more on TheGaneshPost
                </p>
                <p className="text-xs text-white/30">theganeshpost.blogspot.com</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors" />
            </a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/25">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>Auto-synced with Blogger feed · Updates every hour</span>
        </div>
      </div>
    </section>
  );
}
