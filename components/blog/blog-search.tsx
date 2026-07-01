"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Clock, FileSearch } from "lucide-react";

interface BlogSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

const RECENT_KEY = "erg_blog_recent_searches";

export function BlogSearch({ value, onChange, resultCount }: BlogSearchProps) {
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {
      // sessionStorage unavailable — fail silently, search still works
    }
  }, []);

  function commitSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(0, 5);
      try {
        sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <div className="relative">
      <div className="focus-glow relative flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
        <Search className="absolute left-4 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitSearch(value);
          }}
          placeholder="Search articles — BOQ, hydropower, AutoCAD..."
          className="w-full pl-11 pr-10 py-3.5 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none rounded-2xl"
          aria-label="Search blog articles"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Recent searches dropdown */}
      {focused && !value && recent.length > 0 && (
        <div className="animate-erg-fade-up absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg p-3 z-20">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">
            Recent Searches
          </p>
          <div className="space-y-1">
            {recent.map((term) => (
              <button
                key={term}
                onClick={() => onChange(term)}
                className="flex items-center gap-2 w-full text-left px-2.5 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-gray-300" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {value && (
        <p className="text-xs text-gray-400 mt-2 px-1">
          {resultCount} result{resultCount !== 1 ? "s" : ""} for &ldquo;{value}&rdquo;
        </p>
      )}
    </div>
  );
}

export function BlogNoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
        <FileSearch className="w-9 h-9 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
        No articles found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try a different keyword or
        browse by category instead.
      </p>
    </div>
  );
}
