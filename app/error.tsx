/**
 * Custom Error Page — app/error.tsx
 * Shown on unhandled runtime errors (500-level).
 * Must be a Client Component (Next.js requirement).
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    // In production, replace with your error tracking (e.g. Sentry)
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-4"
      role="main"
      aria-labelledby="error-heading"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative text-center max-w-lg mx-auto">
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 mb-8 mx-auto"
          aria-hidden="true"
        >
          <AlertTriangle className="w-9 h-9 text-red-400" />
        </div>

        {/* Error code */}
        <div
          className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-white/15 to-white/3 bg-clip-text text-transparent mb-4 select-none"
          aria-hidden="true"
        >
          500
        </div>

        <h1
          id="error-heading"
          className="text-2xl sm:text-3xl font-bold text-white mb-3"
        >
          Something Went Wrong
        </h1>

        <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-3 max-w-sm mx-auto">
          An unexpected error occurred. This has been logged and we&apos;re working on it.
        </p>

        {/* Error digest for support reference */}
        {error.digest && (
          <p className="text-xs text-white/20 font-mono mb-8">
            Error ID: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-8" />}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              px-5 py-3 rounded-xl
              bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold
              transition-all duration-200 active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]
            "
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>

          <Link
            href="/"
            className="
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              px-5 py-3 rounded-xl
              bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
              text-white/70 hover:text-white text-sm font-semibold
              transition-all duration-200 active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]
            "
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
