import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentParams: Record<string, string>;
  basePath?: string;
}

export function Pagination({ currentPage, totalPages, currentParams, basePath = "" }: PaginationProps) {
  function pageUrl(page: number) {
    const params = new URLSearchParams(currentParams);
    if (page === 1) params.delete("page");
    else params.set("page", String(page));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  // Calculate page range
  const delta = 2;
  const range: (number | "...")[] = [];
  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
    range.push(i);
  }
  if (currentPage - delta > 2) range.unshift("...");
  if (currentPage + delta < totalPages - 1) range.push("...");
  range.unshift(1);
  if (totalPages > 1) range.push(totalPages);

  const btnBase = "flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      {currentPage > 1 && (
        <Link
          href={pageUrl(currentPage - 1)}
          className={cn(btnBase, "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800")}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      )}

      {range.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className={cn(btnBase, "text-gray-400 cursor-default")}>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageUrl(page as number)}
            className={cn(
              btnBase,
              page === currentPage
                ? "bg-navy-600 text-white shadow-sm"
                : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={pageUrl(currentPage + 1)}
          className={cn(btnBase, "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800")}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </nav>
  );
}
