/**
 * Custom 404 Page — app/not-found.tsx
 * Fixed: removed javascript:history.back() — replaced with proper client component.
 */

import Link from "next/link";
import { Home, Search, FileQuestion } from "lucide-react";
import GoBackButton from "@/components/ui/go-back-button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-4"
      role="main"
      aria-labelledby="not-found-heading"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative text-center max-w-lg mx-auto">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-8 mx-auto"
          aria-hidden="true"
        >
          <FileQuestion className="w-9 h-9 text-white/30" />
        </div>

        <div
          className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-white/15 to-white/3 bg-clip-text text-transparent mb-4 select-none"
          aria-hidden="true"
        >
          404
        </div>

        <h1
          id="not-found-heading"
          className="text-2xl sm:text-3xl font-bold text-white mb-3"
        >
          Page Not Found
        </h1>

        <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go Home
          </Link>

          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            Browse Blog
          </Link>
        </div>

        {/* Safe go-back — client component */}
        <div className="mt-8">
          <GoBackButton />
        </div>
      </div>
    </main>
  );
}
