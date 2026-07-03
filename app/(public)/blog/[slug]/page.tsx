/**
 * Blog Article Page — /blog/[slug]
 * Fixed for Next.js 15: params is now a Promise — must be awaited.
 *
 * Features:
 * - Dynamic SEO metadata
 * - JSON-LD Article schema
 * - Reading progress bar
 * - Prev/Next navigation
 * - Sticky Table of Contents
 * - Author card + Article info
 * - Share buttons
 * - Related posts
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ergplatform.com";

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const posts = await fetchBloggerPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBloggerPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | TheGaneshPost",
      description: "The requested article could not be found.",
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.image.startsWith("/") ? `${SITE_URL}${post.image}` : post.image;

  return {
    title: `${post.title} | TheGaneshPost`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: "TheGaneshPost — Er G Platform",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

function ArticleJsonLd({
  title, excerpt, date, author, image, url, slug, tags,
}: {
  title: string; excerpt: string; date: string; author: string;
  image: string; url: string; slug: string; tags: string[];
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
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: tags.join(", "),
    url: canonicalUrl,
    sameAs: [url],
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
  params: Promise<{ slug: string }>;
}) {
  // Next.js 15 — params must be awaited
  const { slug } = await params;

  const post = await fetchBloggerPostBySlug(slug);
  if (!post) notFound();

  if (!post.content || post.content.trim() === "") {
    redirect(post.url);
  }

  const [adjacent, allPosts] = await Promise.all([
    fetchAdjacentPosts(post.id),
    fetchBloggerPosts(),
  ]);

  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <>
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

      <ReadingProgress />

      <main
        id="main-content"
        className="min-h-screen bg-[#080C14] text-white"
        role="main"
      >
        {/* ── Hero Banner ── */}
        <div className="relative h-[55vh] min-h-[360px] sm:min-h-[420px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/55 to-black/20" />

          {/* Back */}
          <div className="absolute top-6 sm:top-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              Back to Blog
            </Link>
          </div>

          {/* Hero text */}
          <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/80 backdrop-blur-sm text-xs font-semibold text-white mb-3 sm:mb-4">
              <Tag className="w-3 h-3" aria-hidden="true" />
              {post.category}
            </span>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 sm:mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/55">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                {post.formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                {post.readTime}
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                {post.wordCount.toLocaleString()} words
              </span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">

            {/* Article */}
            <article className="lg:col-span-3 min-w-0">
              {post.excerpt && (
                <p className="text-base sm:text-lg text-white/55 leading-relaxed mb-8 pb-8 border-b border-white/10">
                  {post.excerpt}
                </p>
              )}

              <ArticleProse content={post.content} />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-3">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?category=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 hover:border-blue-500/30 hover:text-blue-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8">
                <div>
                  <p className="text-sm font-semibold text-white/60 mb-2">Share this article</p>
                  <ShareButtons url={post.url} title={post.title} />
                </div>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-blue-500/35 hover:bg-blue-500/5 text-sm text-white/55 hover:text-white transition-all duration-300 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  aria-label="View original article on Blogger (opens in new tab)"
                >
                  View on Blogger
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>

              <PrevNextNav prev={adjacent.prev} next={adjacent.next} />
            </article>

            {/* Sidebar */}
            <aside className="space-y-5" aria-label="Article sidebar">
              <div className="sticky top-24 space-y-5">
                <TableOfContents content={post.content} />

                {/* Author */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-blue-500/25 shrink-0">
                      <Image
                        src="/images/founder/ganesh-1.jpg"
                        alt={post.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{post.author}</p>
                      <p className="text-xs text-white/35">Registered Civil Engineer</p>
                      <p className="text-xs text-white/25">NEC, Nepal</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed">
                    Nepal Engineering Council registered engineer specializing in
                    infrastructure, cost estimation, and sustainable construction.
                  </p>
                </div>

                {/* Article info */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/20 mb-3">
                    Article Info
                  </p>
                  <dl className="space-y-2">
                    {[
                      { label: "Read time", value: post.readTime },
                      { label: "Words", value: post.wordCount.toLocaleString() },
                      { label: "Published", value: post.formattedDate },
                      { label: "Category", value: post.category, highlight: true },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <dt className="text-white/35">{label}</dt>
                        <dd className={highlight ? "text-blue-400 font-medium" : "text-white/55 font-medium"}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </aside>
          </div>

          {/* Related */}
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
