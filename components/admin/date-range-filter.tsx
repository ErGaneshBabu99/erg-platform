"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const PRESETS: { key: string; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "28d", label: "28 days" },
  { key: "90d", label: "90 days" },
];

export function DateRangeFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showCustom, setShowCustom] = useState(current === "custom");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function setRange(key: string) {
    const params = new URLSearchParams();
    params.set("range", key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyCustom() {
    if (!from || !to) return;
    const params = new URLSearchParams();
    params.set("range", "custom");
    params.set("from", from);
    params.set("to", to);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => {
            setShowCustom(false);
            setRange(p.key);
          }}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
            current === p.key
              ? "bg-navy-600 text-white"
              : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
          )}
        >
          {p.label}
        </button>
      ))}
      <button
        onClick={() => setShowCustom((v) => !v)}
        className={cn(
          "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
          current === "custom"
            ? "bg-navy-600 text-white"
            : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
        )}
      >
        Custom
      </button>

      {showCustom && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-white/15 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-white/15 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
          />
          <button
            onClick={applyCustom}
            disabled={!from || !to}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-navy-600 text-white disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
