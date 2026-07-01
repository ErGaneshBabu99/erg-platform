import React from "react";
import Link from "next/link";
import { FileText, Download, Eye, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { formatNumber, formatDate, formatFileSize } from "@/lib/utils";

interface DistrictRate {
  id: string;
  slug: string;
  downloadCount: number;
  viewCount: number;
  publishedAt: Date | null;
  pdfSize: number | null;
  district: {
    name: string;
    province: { name: string };
  };
  fiscalYear: { year: string };
}

interface Props {
  rates: DistrictRate[];
  total: number;
  page: number;
  limit: number;
  currentParams: Record<string, string>;
}

export function DistrictRateGrid({ rates, total, page, limit, currentParams }: Props) {
  if (rates.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No district rates found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {rates.map((rate) => (
          <article key={rate.id} className="card-base group hover:border-navy-200 dark:hover:border-navy-600 transition-all">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/district-rate/${rate.slug}`}
                    className="font-bold text-gray-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 block"
                  >
                    {rate.district.name} District Rate
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {rate.district.province.name}
                  </div>
                </div>
                <Badge variant="navy">{rate.fiscalYear.year}</Badge>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  {formatNumber(rate.downloadCount)} downloads
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {formatNumber(rate.viewCount)} views
                </span>
                {rate.pdfSize && (
                  <span className="ml-auto">{formatFileSize(rate.pdfSize)}</span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                {rate.publishedAt && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(rate.publishedAt)}
                  </span>
                )}
                <Link
                  href={`/district-rate/${rate.slug}`}
                  className="flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-blue-400 hover:text-navy-700 dark:hover:text-blue-300 ml-auto"
                  aria-label={`View ${rate.district.name} district rate ${rate.fiscalYear.year}`}
                >
                  View & Download
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            currentParams={currentParams}
          />
        </div>
      )}
    </>
  );
}
