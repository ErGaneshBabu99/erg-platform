import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { ALL_77_DISTRICTS } from "@/lib/district-nepali-names";
import { getCanonicalRateSlug } from "@/lib/slug-migration";

interface NeighboringDistrictsProps {
  currentDistrictSlug: string;
  provinceName: string;
  provinceSlug: string;
}

export function NeighboringDistricts({
  currentDistrictSlug,
  provinceName,
  provinceSlug,
}: NeighboringDistrictsProps) {
  // Find other districts in the same province
  const provinceDistricts = ALL_77_DISTRICTS.filter(
    (d) => d.provinceSlug === provinceSlug && d.slug !== currentDistrictSlug
  );

  if (provinceDistricts.length === 0) return null;

  return (
    <div className="card-base p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" /> Other Districts in {provinceName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Compare official district rates across neighbouring districts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {provinceDistricts.map((d) => {
          const targetSlug = getCanonicalRateSlug(d.slug, "2083-84");
          return (
            <Link
              key={d.slug}
              href={`/district-rate/${targetSlug}`}
              className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-navy-300 dark:hover:border-navy-600 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all text-xs"
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors">
                  {d.name}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {d.nameNp} दररेट
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
