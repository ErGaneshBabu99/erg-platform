/**
 * BlogCard Component — Phase 6 Polish
 * Premium card with smooth hover, image overlay, category badge.
 * "use client" required for onError handler.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { BlogPost } from "@/lib/blogger";

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export default function BlogCard({ post, className = "" }: BlogCardProps) {
  const href = `/blog/${post.slug}`;
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl
        bg-white/[0.03] border border-white/8
        hover:border-white/15 hover:bg-white/[0.05]
        transition-all duration-500 ease-out
        hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40
        ${className}
      `}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden aspect-[16/9] shrink-0">
        <img
          src={imgError ? "/images/blog/placeholder.jpg" : post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        {/* Gradient overlay — darkens on hover for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-80" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="
            inline-flex items-center px-2.5 py-1 rounded-full
            text-[11px] font-semibold tracking-wide
            bg-black/40 backdrop-blur-md border border-white/15 text-white/90
          ">
            {post.category}
          </span>
        </div>

        {/* Read time badge — bottom right of image */}
        <div className="absolute bottom-3 right-3">
          <span className="
            inline-flex items-center gap-1 px-2 py-1 rounded-full
            text-[11px] text-white/70
            bg-black/40 backdrop-blur-md border border-white/10
          ">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Title */}
        <Link href={href} className="block group/title">
          <h3 className="
            text-[15px] font-bold text-white/90 leading-snug line-clamp-2
            group-hover/title:text-blue-300
            transition-colors duration-300
          ">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-white/45 text-[13px] leading-relaxed line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/6">
          <span className="text-[11px] text-white/30">{post.formattedDate}</span>

          <Link
            href={href}
            className="
              inline-flex items-center gap-1 text-[12px] font-semibold
              text-blue-400/80 hover:text-blue-300
              transition-colors duration-200 group/cta
            "
          >
            Read article
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Subtle glow on hover */}
      <div className="
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
        transition-opacity duration-500 pointer-events-none
        ring-1 ring-blue-500/10
      " />
    </article>
  );
}
