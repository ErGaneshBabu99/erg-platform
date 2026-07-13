"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DistrictAutocomplete } from "./district-autocomplete";

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
        {/* Search — autocomplete combobox */}
        <DistrictAutocomplete
          defaultValue={currentParams.q ?? ""}
          onCommit={(value) => updateParams({ q: value })}
          isPending={isPending}
        />

        {/* Province */}
        <select
          defaultValue={currentParams.province ?? ""}
          onChange={(e) => updateParams({ province: e.target.value || undefined })}
          className="input-base lg:w-56 transition-all duration-200 focus:ring-4 focus:ring-navy-100 dark:focus:ring-navy-900/40 focus:border-navy-400"
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
          className="input-base lg:w-48 transition-all duration-200 focus:ring-4 focus:ring-navy-100 dark:focus:ring-navy-900/40 focus:border-navy-400"
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
          className="input-base lg:w-48 transition-all duration-200 focus:ring-4 focus:ring-navy-100 dark:focus:ring-navy-900/40 focus:border-navy-400"
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
        <p
          className={cn(
            "text-sm transition-colors duration-200 flex items-center gap-2",
            isPending ? "text-navy-500" : "text-gray-500"
          )}
          aria-live="polite"
        >
          {isPending && (
            <span className="inline-block w-3.5 h-3.5 border-2 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
          )}
          {isPending ? "Searching..." : `${total} district rate${total !== 1 ? "s" : ""} found`}
        </p>
        {hasActiveFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
