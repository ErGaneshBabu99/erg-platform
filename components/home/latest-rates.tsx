"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Download, FileText, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { DistrictRateCardSkeleton } from "@/components/ui/skeleton";

interface DistrictRateCardProps {
  id: string;
  slug: string;
  district: { name: string; province: { name: string } };
  fiscalYear: { year: string };
  downloadCount: number;
  publishedAt: Date | null;
  featured?: boolean;
}

export function DistrictRateCard({
  slug,
  district,
  fiscalYear,
  downloadCount,
  featured = false,
}: DistrictRateCardProps) {
  return (
    <Link
      href={"/district-rate/" + slug}
      className="hover-lift relative flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-navy-200 dark:hover:border-navy-700 hover:shadow-card-hover transition-all duration-300 group"
    >
      {featured && (
        <span className="animate-pop-in absolute -top-2 -left-2 inline-flex items-center gap-1 text-[10px] font-bold text-navy-900 bg-accent px-2 py-0.5 rounded-full shadow-sm z-10">
          <Sparkles className="w-2.5 h-2.5" />
          Latest
        </span>
      )}
      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
        <FileText className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors truncate">
          {district.name} District Rate
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-400">{district.province.name}</span>
          <span className="text-xs font-medium text-navy-600 dark:text-blue-400 bg-navy-50 dark:bg-navy-900/30 px-2 py-0.5 rounded-full">
            {fiscalYear.year}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
        <Download className="w-3.5 h-3.5" />
        {formatNumber(downloadCount)}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = "/district-rate/" + slug;
        }}
        className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-navy-50 dark:bg-navy-900/40 text-navy-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 hover:bg-navy-100 dark:hover:bg-navy-800"
        aria-label={`Download ${district.name} district rate`}
        tabIndex={-1}
      >
        <Download className="w-3.5 h-3.5" />
      </button>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-navy-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" />
    </Link>
  );
}

interface LatestRatesProps {
  rates: DistrictRateCardProps[];
  loading?: boolean;
}

export function LatestRates({ rates, loading = false }: LatestRatesProps) {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container-erg">
        <Reveal className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-navy-600 dark:text-blue-400 uppercase tracking-widest mb-3">Recent</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">
              Latest District Rates
            </h2>
          </div>
          <Link
            href="/district-rate"
            className="link-underline flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors whitespace-nowrap"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DistrictRateCardSkeleton key={i} />
            ))}
          </div>
        ) : rates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rates.map((rate, i) => (
              <Reveal key={rate.id} delay={((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6}>
                <DistrictRateCard {...rate} featured={i === 0} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="text-center py-16 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
            <FileText className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No district rates published yet.</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
              Add district rates from the admin panel.
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
