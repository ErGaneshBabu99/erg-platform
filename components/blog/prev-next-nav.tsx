/**
 * PrevNextNav — Server Component
 * No hooks used — "use client" was unnecessary. Removed.
 */

import Link from "next/link";
import { BlogPost } from "@/lib/blogger";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PrevNextNavProps {
  prev: BlogPost | null;
  next: BlogPost | null;
}

export default function PrevNextNav({ prev, next }: PrevNextNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-10 border-t border-white/10"
      aria-label="Article navigation"
    >
      {/* Previous */}
      <div>
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex flex-col gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            aria-label={`Previous article: ${prev.title}`}
          >
            <span className="flex items-center gap-1.5 text-xs text-white/35 group-hover:text-white/50 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              Previous article
            </span>
            <span className="text-sm font-semibold text-white/70 group-hover:text-white line-clamp-2 transition-colors">
              {prev.title}
            </span>
            <span className="text-xs text-white/30">{prev.formattedDate}</span>
          </Link>
        ) : (
          <div aria-hidden="true" />
        )}
      </div>

      {/* Next */}
      <div>
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex flex-col gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 text-right h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            aria-label={`Next article: ${next.title}`}
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-white/35 group-hover:text-white/50 transition-colors">
              Next article
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-white/70 group-hover:text-white line-clamp-2 transition-colors">
              {next.title}
            </span>
            <span className="text-xs text-white/30">{next.formattedDate}</span>
          </Link>
        ) : (
          <div aria-hidden="true" />
        )}
      </div>
    </nav>
  );
}
