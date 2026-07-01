/**
 * BlogHeroArticle Component
 * Uses plain <img> for Blogger hero image — no next.config changes needed.
 */

import Link from "next/link";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";
import { BlogPost } from "@/lib/blogger";

interface BlogHeroArticleProps {
  post: BlogPost;
}

export default function BlogHeroArticle({ post }: BlogHeroArticleProps) {
  const href = `/blog/${post.slug}`;

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-black/30">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden min-h-[280px]">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080C14] hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14]/80 to-transparent lg:hidden" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/90 backdrop-blur-sm text-white">
              Featured
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/80 backdrop-blur-sm text-white">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Latest Article
          </p>

          <Link href={href}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4 group-hover:text-blue-200 transition-colors duration-300 cursor-pointer">
              {post.title}
            </h2>
          </Link>

          <p className="text-white/55 text-sm leading-relaxed mb-6 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 text-xs text-white/40 mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-2 w-fit px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 text-sm font-medium text-blue-300 hover:text-blue-200 transition-all duration-300 group/btn"
          >
            Read Article
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
