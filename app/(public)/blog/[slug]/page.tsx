/**
 * Blog Article Page — /blog/[slug]
 *
 * Features:
 * - Dynamic SEO metadata (title, description, OG, Twitter Card)
 * - JSON-LD Article schema for Google
 * - Reading progress bar
 * - Prev / Next article navigation
 * - Sticky Table of Contents
 * - Author card
 * - Share buttons
 * - Related posts
 *
 * Uses plain <img> for Blogger images (no next.config changes needed).
 * Local author image uses next/image.
 */

import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  fetchBloggerPostBySlug,
  fetchBloggerPosts,
  fetchAdjacentPosts,
} from "@/lib/blogger";
import ArticleProse from "@/components/blog/article-prose";
import TableOfContents from "@/components/blog/table-of-contents";
import RelatedPosts from "@/components/blog/related-posts";
import ShareButtons from "@/components/blog/share-buttons";
import ReadingProgress from "@/components/blog/reading-progress";
import PrevNextNav from "@/components/blog/prev-next-nav";
import { ArrowLeft, Clock, Calendar, Tag, ExternalLink, User, BookOpen } from "lucide-react";

const SITE_URL = "https://ergplatform.com"; // update to your actual domain

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const posts = await fetchBloggerPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

// ─── Dynamic Metadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await fetchBloggerPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Article Not Found | TheGaneshPost",
      description: "The requested article could not be found.",
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.image.startsWith("/")
    ? `${SITE_URL}${post.image}`
    : post.image;

  return {
    title: `${post.title} | TheGaneshPost`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: "TheGaneshPost — Er G Platform",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

// ─── JSON-LD Schema ───────────────────────────────────────────────────────────

function ArticleJsonLd({
  title,
  excerpt,
  date,
  author,
  image,
  url,
  slug,
  tags,
}: {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  url: string;
  slug: string;
  tags: string[];
}) {
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;
  const ogImage = image.startsWith("/") ? `${SITE_URL}${image}` : image;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    image: ogImage,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Person",
      name: author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Er G Platform",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    keywords: tags.join(", "),
    url: canonicalUrl,
    sameAs: [url], // original Blogger URL
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await fetchBloggerPostBySlug(params.slug);

  if (!post) notFound();

  // No content → redirect to original Blogger post
  if (!post.content || post.content.trim() === "") {
    redirect(post.url);
  }

  // Fetch adjacent + related posts in parallel
  const [adjacent, allPosts] = await Promise.all([
    fetchAdjacentPosts(post.id),
    fetchBloggerPosts(),
  ]);

  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD in <head> */}
      <ArticleJsonLd
        title={post.title}
        excerpt={post.excerpt}
        date={post.date}
        author={post.author}
        image={post.image}
        url={post.url}
        slug={post.slug}
        tags={post.tags}
      />

      {/* Reading progress bar — fixed at top */}
      <ReadingProgress />

      <main className="min-h-screen bg-[#080C14] text-white">
        {/* ── Hero Banner ── */}
        <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/60 to-black/30" />

          {/* Back button */}
          <div className="absolute top-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Blog
            </Link>
          </div>

          {/* Hero text */}
          <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/80 backdrop-blur-sm text-xs font-semibold text-white mb-4">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {post.wordCount.toLocaleString()} words
              </span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Article */}
            <article className="lg:col-span-3">
              {post.excerpt && (
                <p className="text-lg text-white/60 leading-relaxed mb-8 pb-8 border-b border-white/10">
                  {post.excerpt}
                </p>
              )}

              <ArticleProse content={post.content} />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?category=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 hover:border-blue-500/30 hover:text-blue-400 transition-all duration-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share + Blogger link */}
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white/70 mb-2">
                    Share this article
                  </p>
                  <ShareButtons url={post.url} title={post.title} />
                </div>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:border-blue-500/40 hover:bg-blue-500/5 text-sm text-white/60 hover:text-white transition-all duration-300 shrink-0"
                >
                  View on Blogger
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Prev / Next navigation */}
              <PrevNextNav prev={adjacent.prev} next={adjacent.next} />
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Table of Contents — sticky */}
              <div className="sticky top-24">
                <TableOfContents content={post.content} />

                {/* Author card */}
                <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500/30 shrink-0">
                      <Image
                        src="/images/founder/ganesh-1.jpg"
                        alt={post.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{post.author}</p>
                      <p className="text-xs text-white/40">Registered Civil Engineer</p>
                      <p className="text-xs text-white/30">NEC, Nepal</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Nepal Engineering Council registered engineer with expertise in
                    infrastructure, cost estimation, and sustainable construction.
                  </p>
                </div>

                {/* Reading stats */}
                <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-3">
                    Article Info
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Read time</span>
                      <span className="text-white/60 font-medium">{post.readTime}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Word count</span>
                      <span className="text-white/60 font-medium">
                        {post.wordCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Published</span>
                      <span className="text-white/60 font-medium">{post.formattedDate}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Category</span>
                      <span className="text-blue-400 font-medium">{post.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-white/10">
              <RelatedPosts posts={relatedPosts} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
