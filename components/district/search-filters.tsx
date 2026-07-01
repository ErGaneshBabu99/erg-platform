"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  provinces: string[];
  fiscalYears: string[];
  currentParams: Record<string, string>;
  total: number;
}

export function SearchFilters({ provinces, fiscalYears, currentParams, total }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(currentParams as any);
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page"); // Reset page on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const hasActiveFilters = currentParams.q || currentParams.province || currentParams.fiscalYear;

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="search"
            defaultValue={currentParams.q ?? ""}
            placeholder="Search district name..."
            className="input-base pl-11"
            onChange={(e) => updateParams({ q: e.target.value || undefined })}
            aria-label="Search districts"
          />
        </div>

        {/* Province */}
        <select
          defaultValue={currentParams.province ?? ""}
          onChange={(e) => updateParams({ province: e.target.value || undefined })}
          className="input-base lg:w-56"
          aria-label="Filter by province"
        >
          <option value="">All Provinces</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Fiscal Year */}
        <select
          defaultValue={currentParams.fiscalYear ?? ""}
          onChange={(e) => updateParams({ fiscalYear: e.target.value || undefined })}
          className="input-base lg:w-48"
          aria-label="Filter by fiscal year"
        >
          <option value="">All Fiscal Years</option>
          {fiscalYears.map((fy) => (
            <option key={fy} value={fy}>{fy}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          defaultValue={currentParams.sort ?? "newest"}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="input-base lg:w-48"
          aria-label="Sort results"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="downloads">Most Downloaded</option>
          <option value="name">District Name</option>
        </select>
      </div>

      {/* Results count and clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500" aria-live="polite">
          {isPending ? "Searching..." : `${total} district rate${total !== 1 ? "s" : ""} found`}
        </p>
        {hasActiveFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
