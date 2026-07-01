"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  categories: { category: string; count: number }[];
  active: string;
  onChange: (category: string) => void;
}

export function CategoryChips({ categories, active, onChange }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("All")}
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
          active === "All"
            ? "bg-navy-600 text-white shadow-sm"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-900/30 hover:text-navy-700 dark:hover:text-navy-300"
        )}
      >
        All
      </button>
      {categories.map(({ category, count }) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
            active === category
              ? "bg-navy-600 text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-navy-50 dark:hover:bg-navy-900/30 hover:text-navy-700 dark:hover:text-navy-300"
          )}
        >
          {category}
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              active === category ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
            )}
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  );
}
