"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const previewPosts = [
  {
    slug: "how-to-read-district-rate",
    title: "How to Read and Use District Rates in Construction Estimates",
    excerpt: "A step-by-step guide for engineers on applying district rates in BOQ preparation.",
    category: "District Rates",
    dateAd: "Jan 1, 2026",
  },
  {
    slug: "district-rate-vs-market-rate",
    title: "District Rate vs Market Rate: What Engineers Need to Know",
    excerpt: "Understanding when to use government district rates versus actual market rates.",
    category: "Engineering",
    dateAd: "Dec 5, 2025",
  },
  {
    slug: "boq-preparation-guide",
    title: "Complete BOQ Preparation Guide for Civil Engineers in Nepal",
    excerpt: "How to prepare a Bill of Quantities using Nepali standard norms and district rates.",
    category: "Engineering",
    dateAd: "Sep 21, 2025",
  },
];

export function BlogPreview() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950/50">
      <div className="container-erg">
        <Reveal className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-navy-600 dark:text-blue-400 uppercase tracking-widest mb-3">Blog</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">
              Engineering Resources
            </h2>
          </div>
          <Link
            href="/blog"
            className="link-underline flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-700 dark:text-blue-400 transition-colors whitespace-nowrap"
          >
            All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {previewPosts.map((post, i) => (
            <Reveal key={post.slug} delay={(i + 1) as 1 | 2 | 3}>
              <Link
                href={"/blog/" + post.slug}
                className="hover-lift bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:border-navy-200 dark:hover:border-navy-700 hover:shadow-card-hover transition-all duration-300 group flex flex-col h-full"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 dark:text-blue-400 bg-navy-50 dark:bg-navy-900/30 px-2.5 py-1 rounded-full w-fit mb-3">
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2 group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.dateAd}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
