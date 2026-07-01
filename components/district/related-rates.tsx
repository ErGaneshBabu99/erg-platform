import React from "react";
import Link from "next/link";
import { FileText, Download, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

interface RelatedRate {
  id: string;
  slug: string;
  downloadCount: number;
  district: { name: string; province: { name: string } };
  fiscalYear: { year: string };
}

interface RelatedRatesProps {
  rates: RelatedRate[];
  districtName: string;
}

export function RelatedRates({ rates, districtName }: RelatedRatesProps) {
  return (
    <div className="card-base p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Other Fiscal Years – {districtName}
      </h2>
      <div className="space-y-3">
        {rates.map((rate) => (
          <Link
            key={rate.id}
            href={`/district-rate/${rate.slug}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors">
                {rate.district.name} District Rate
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="navy" className="text-xs">{rate.fiscalYear.year}</Badge>
                <span className="text-xs text-gray-400">{formatNumber(rate.downloadCount)} downloads</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
