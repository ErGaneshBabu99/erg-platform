/**
 * RelatedPosts Component
 * Uses plain <img> for Blogger thumbnail images — no next.config changes needed.
 */

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { BlogPost } from "@/lib/blogger";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-transparent" />
        <h2 className="text-xl font-bold text-white">Related Articles</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
          >
            <div className="relative overflow-hidden aspect-[16/9]">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="p-4">
              <span className="text-xs font-medium text-blue-400 mb-2 block">
                {post.category}
              </span>
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors cursor-pointer">
                  {post.title}
                </h3>
              </Link>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-white/35">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors group/link"
                >
                  Read
                  <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
