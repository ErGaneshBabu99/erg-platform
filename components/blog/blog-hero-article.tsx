/**
 * BlogHeroArticle — Step 5+6 Polish
 * Mobile-first layout, performance improvements.
 * "use client" for onError handler.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";
import { BlogPost } from "@/lib/blogger";

interface BlogHeroArticleProps {
  post: BlogPost;
}

export default function BlogHeroArticle({ post }: BlogHeroArticleProps) {
  const href = `/blog/${post.slug}`;
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-black/30">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* ── Image ── */}
        <div className="relative overflow-hidden min-h-[220px] sm:min-h-[280px] lg:min-h-[340px]">
          <img
            src={imgError ? "/images/blog/placeholder.jpg" : post.image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {/* Gradient — right fade on desktop, bottom fade on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14]/90 via-[#080C14]/30 to-transparent lg:hidden" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#080C14] hidden lg:block" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/85 backdrop-blur-sm text-white">
              Featured
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/40 backdrop-blur-sm border border-white/15 text-white/90">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-3">
            Latest Article
          </p>

          <Link href={href}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-3 group-hover:text-blue-100 transition-colors duration-300 cursor-pointer line-clamp-3">
              {post.title}
            </h2>
          </Link>

          <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-2 sm:line-clamp-3">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/35 mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.formattedDate}
            </span>
            <span className="w-px h-3 bg-white/15" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-2 w-fit px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 text-sm font-semibold text-blue-300 hover:text-blue-200 transition-all duration-300 group/btn active:scale-[0.98]"
          >
            Read Article
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
