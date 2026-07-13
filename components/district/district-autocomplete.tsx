"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { rankDistricts, type DistrictRow, type RankedDistrict } from "@/lib/districtMatch";
import { loadDistricts } from "@/lib/districtCache";

interface DistrictAutocompleteProps {
  defaultValue?: string;
  onCommit: (value: string | undefined) => void;
  isPending?: boolean;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return text; // fuzzy/abbreviation matches won't have a literal
  // substring to underline — that's expected, the row itself is still correct.
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-navy-700 dark:text-blue-400">
        {text.slice(idx, idx + query.trim().length)}
      </span>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

export function DistrictAutocomplete({ defaultValue = "", onCommit, isPending }: DistrictAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [allDistricts, setAllDistricts] = useState<DistrictRow[] | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load the full 77-district list exactly once. loadDistricts() is a
  // module-level singleton promise, so even if multiple instances of this
  // component mount (or this one remounts on navigation), only a single
  // network/Prisma call ever happens for the whole page session.
  useEffect(() => {
    let cancelled = false;
    setIsLoadingList(true);
    loadDistricts()
      .then((data) => {
        if (!cancelled) setAllDistricts(data);
      })
      .catch((err) => {
        console.error("Failed to load district list:", err);
        if (!cancelled) setAllDistricts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Instant, synchronous, in-memory ranking — no network round-trip and no
  // debounce needed. 77 rows rank in well under a millisecond, so this can
  // safely re-run on every keystroke, exactly like Google Search.
  const suggestions: RankedDistrict[] = useMemo(() => {
    if (!allDistricts || !query.trim()) return [];
    return rankDistricts(allDistricts, query, 8);
  }, [allDistricts, query]);

  // Keep the active (keyboard-highlighted) row in sync whenever the
  // suggestion set changes underneath it.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query, allDistricts]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commitValue = useCallback(
    (value: string) => {
      setQuery(value);
      setIsOpen(false);
      onCommit(value.trim() || undefined);
    },
    [onCommit]
  );

  function handleSelect(s: RankedDistrict) {
    commitValue(s.name);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") commitValue(query);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex]);
      } else {
        commitValue(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleClear() {
    setQuery("");
    setIsOpen(false);
    onCommit(undefined);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <Search
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-all duration-300 z-10",
          isPending ? "text-navy-500 animate-pulse" : "text-gray-400"
        )}
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="district-suggestion-listbox"
        aria-activedescendant={activeIndex >= 0 ? `district-option-${activeIndex}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search district name..."
        autoComplete="off"
        className="input-base pl-11 pr-10 transition-all duration-200 focus:ring-4 focus:ring-navy-100 dark:focus:ring-navy-900/40 focus:border-navy-400"
        aria-label="Search districts"
      />

      {/* Spinner now only reflects the ONE-TIME initial list load, not
          per-keystroke filtering, which is instant and needs no indicator. */}
      {isLoadingList && (
        <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 animate-spin" />
      )}

      {query && !isLoadingList && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          id="district-suggestion-listbox"
          role="listbox"
          className="absolute z-20 mt-2 w-full max-h-80 overflow-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg opacity-0 animate-[fadeInUp_0.15s_ease-out_forwards]"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.slug}
              id={`district-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault(); // keep input focus, avoid blur closing before click registers
                handleSelect(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm transition-colors",
                i === activeIndex ? "bg-navy-50 dark:bg-navy-900/40" : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
              )}
            >
              <span className="text-gray-400 shrink-0">📍</span>
              <span className="flex-1 min-w-0">
                <span className="block text-gray-900 dark:text-white">
                  {highlightMatch(s.name, query)}
                </span>
                <span className="block text-xs text-gray-400">{s.province}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoadingList && query.trim() && suggestions.length === 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg px-4 py-3 text-sm text-gray-400 opacity-0 animate-[fadeInUp_0.15s_ease-out_forwards]">
          No matching districts
        </div>
      )}
    </div>
  );
}
