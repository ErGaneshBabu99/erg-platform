import React from "react";
import Link from "next/link";
import { Landmark, ArrowUpRight } from "lucide-react";
import { ALL_77_DISTRICTS } from "@/lib/district-nepali-names";
import { getCanonicalRateSlug } from "@/lib/slug-migration";

// Group districts by province
const PROVINCES = [
  { name: "Koshi Province", nameNp: "कोशी प्रदेश", slug: "koshi" },
  { name: "Madhesh Province", nameNp: "मधेश प्रदेश", slug: "madhesh" },
  { name: "Bagmati Province", nameNp: "बागमती प्रदेश", slug: "bagmati" },
  { name: "Gandaki Province", nameNp: "गण्डकी प्रदेश", slug: "gandaki" },
  { name: "Lumbini Province", nameNp: "लुम्बिनी प्रदेश", slug: "lumbini" },
  { name: "Karnali Province", nameNp: "कर्णाली प्रदेश", slug: "karnali" },
  { name: "Sudurpashchim Province", nameNp: "सुदूरपश्चिम प्रदेश", slug: "sudurpashchim" },
];

export function AllDistrictsDirectory() {
  return (
    <section className="card-base p-6 md:p-8 mt-12 border border-gray-200 dark:border-gray-800">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 dark:bg-navy-900/40 text-navy-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Landmark className="w-3.5 h-3.5" /> All 77 Districts Directory
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">
          Nepal District Rates Database (सबै ७७ जिल्ला दररेट)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 max-w-2xl">
          Quickly browse and download verified official government district rates (जिल्ला दररेट) for fiscal year 2083/84 across all 7 provinces of Nepal.
        </p>
      </div>

      <div className="space-y-6">
        {PROVINCES.map((province) => {
          const districts = ALL_77_DISTRICTS.filter((d) => d.provinceSlug === province.slug);
          return (
            <div
              key={province.slug}
              className="p-4 md:p-5 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5"
            >
              <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 dark:border-gray-800 pb-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                  <span>{province.name}</span>
                  <span className="text-xs text-navy-600 dark:text-blue-400 font-medium">({province.nameNp})</span>
                </h3>
                <span className="text-xs text-gray-400 font-medium">{districts.length} Districts</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {districts.map((district) => {
                  const targetSlug = getCanonicalRateSlug(district.slug, "2083-84");
                  return (
                    <Link
                      key={district.slug}
                      href={`/district-rate/${targetSlug}`}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 hover:border-navy-400 dark:hover:border-navy-500 hover:shadow-sm transition-all"
                    >
                      <div className="min-w-0 pr-1">
                        <div className="font-semibold text-xs text-gray-800 dark:text-gray-200 group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {district.name}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {district.nameNp}
                        </div>
                      </div>
                      <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
