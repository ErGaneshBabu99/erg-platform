"use client";

import React, { useEffect, useState } from "react";
import { Download, Eye, Clock, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface DistrictStatsLiveProps {
  slug: string;
  initialDownloadsBefore: number;
  initialViewsBefore: number;
  initialDownloadsAfter?: number;
  initialViewsAfter?: number;
  baselineDateStr?: string;
}

export function DistrictStatsLive({
  slug,
  initialDownloadsBefore,
  initialViewsBefore,
  initialDownloadsAfter = 0,
  initialViewsAfter = 0,
  baselineDateStr = "October 6, 2026",
}: DistrictStatsLiveProps) {
  const [stats, setStats] = useState({
    downloadsBefore: initialDownloadsBefore,
    viewsBefore: initialViewsBefore,
    downloadsAfter: initialDownloadsAfter,
    viewsAfter: initialViewsAfter,
    baselineDate: baselineDateStr,
  });

  useEffect(() => {
    // 1. Record view (once per session per slug)
    const sessionKey = `viewed_rate_${slug}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");
      fetch(`/api/district-rate/${encodeURIComponent(slug)}/view`, {
        method: "POST",
      }).catch(() => {});
    }

    // 2. Fetch fresh live numbers
    fetch(`/api/district-rate/${encodeURIComponent(slug)}/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.downloadsBefore === "number") {
          setStats({
            downloadsBefore: data.downloadsBefore,
            viewsBefore: data.viewsBefore,
            downloadsAfter: data.downloadsAfter,
            viewsAfter: data.viewsAfter,
            baselineDate: data.baselineDate ? formatDateLabel(data.baselineDate) : baselineDateStr,
          });
        }
      })
      .catch(() => {});
  }, [slug, baselineDateStr]);

  return (
    <div className="card-base p-5 border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" /> Rate Statistics
        </h3>
        <span className="text-[11px] text-gray-400 font-medium">Verified Records</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Baseline (Before latest update) */}
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Before latest update
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Download className="w-3 h-3 text-gray-400" /> Downloads:
            </span>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums">
              {formatNumber(stats.downloadsBefore)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Eye className="w-3 h-3 text-gray-400" /> Views:
            </span>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums">
              {formatNumber(stats.viewsBefore)}
            </span>
          </div>
        </div>

        {/* After latest update */}
        <div className="p-3.5 rounded-xl bg-accent/5 dark:bg-accent/[0.07] border border-accent/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-accent dark:text-accent font-semibold uppercase text-[10px] tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> After latest update, since {stats.baselineDate}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Download className="w-3 h-3 text-accent" /> Downloads:
            </span>
            <span className="font-bold text-accent dark:text-accent tabular-nums">
              {formatNumber(stats.downloadsAfter)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Eye className="w-3 h-3 text-accent" /> Views:
            </span>
            <span className="font-bold text-accent dark:text-accent tabular-nums">
              {formatNumber(stats.viewsAfter)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateLabel(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "October 6, 2026";
  }
}
