/**
 * Blog 404 — app/(public)/blog/not-found.tsx
 * Shown when a blog article slug is not found.
 */

import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";

export default function BlogNotFound() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-4"
      role="main"
      aria-labelledby="blog-not-found-heading"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative text-center max-w-md mx-auto">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 mx-auto"
          aria-hidden="true"
        >
          <BookOpen className="w-7 h-7 text-white/30" />
        </div>

        <h1
          id="blog-not-found-heading"
          className="text-2xl sm:text-3xl font-bold text-white mb-3"
        >
          Article Not Found
        </h1>

        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          This article may have been moved, deleted, or the link may be incorrect.
          You can browse all articles or visit the original blog.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/blog"
            className="
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              px-5 py-3 rounded-xl
              bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold
              transition-all duration-200 active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]
            "
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            All Articles
          </Link>

          <a
            href="https://theganeshpost.blogspot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              px-5 py-3 rounded-xl
              bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
              text-white/70 hover:text-white text-sm font-semibold
              transition-all duration-200 active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]
            "
          >
            Visit Blogger
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </main>
  );
}
