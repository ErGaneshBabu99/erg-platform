"use client";

import React, { useEffect, useState } from "react";
import { Download, Eye, Sparkles, Check, Share2, ShieldCheck, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface DistrictStatsLiveProps {
  slug: string;
  districtName?: string;
  initialTotalDownloads: number;
  initialDirectDownloads?: number;
  initialViews?: number;
}

export function DistrictStatsLive({
  slug,
  districtName = "District Rate",
  initialTotalDownloads,
  initialDirectDownloads = 0,
  initialViews = 0,
}: DistrictStatsLiveProps) {
  const [totalDownloads, setTotalDownloads] = useState(initialTotalDownloads);
  const [directDownloads, setDirectDownloads] = useState(initialDirectDownloads);
  const [views, setViews] = useState(initialViews);
  const [justIncremented, setJustIncremented] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Record view (once per session per slug)
    const sessionKey = `viewed_rate_${slug}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");
      fetch(`/api/district-rate/${encodeURIComponent(slug)}/view`, {
        method: "POST",
      }).catch(() => {});
    }

    // 2. Fetch fresh live numbers from server
    fetch(`/api/district-rate/${encodeURIComponent(slug)}/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.totalDownloads === "number") {
          setTotalDownloads(data.totalDownloads);
          if (typeof data.downloads === "number") setDirectDownloads(data.downloads);
          if (typeof data.views === "number") setViews(data.views);
        }
      })
      .catch(() => {});

    // 3. Listen to instant download event from DownloadButton & PdfViewerButton
    const handleDownloadEvent = () => {
      setTotalDownloads((prev) => prev + 1);
      setDirectDownloads((prev) => prev + 1);
      setJustIncremented(true);
      setTimeout(() => setJustIncremented(false), 3500);
    };

    window.addEventListener("district-rate-download-triggered", handleDownloadEvent);
    return () => {
      window.removeEventListener("district-rate-download-triggered", handleDownloadEvent);
    };
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card-base p-5 md:p-6 border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white via-white to-gray-50/60 dark:from-navy-900/90 dark:via-navy-900/60 dark:to-navy-950/80 shadow-sm hover:shadow-md transition-all rounded-2xl">
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Live Rate Activity
          </span>
          <span className="text-[11px] text-gray-400">· Official Records</span>
        </div>

        <div className="flex items-center gap-2">
          {justIncremented && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800/60 px-2.5 py-0.5 rounded-full animate-bounce">
              <Sparkles className="w-3 h-3" /> +1 Downloaded!
            </span>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-navy-600 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Copy page link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Total Downloads Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Big Total Counter */}
        <div className="md:col-span-1 p-4 rounded-xl bg-navy-50/60 dark:bg-navy-950/50 border border-navy-100/80 dark:border-navy-800/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-navy-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Total Downloads
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-display font-extrabold text-navy-900 dark:text-white tabular-nums tracking-tight">
              {formatNumber(totalDownloads)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">all-time</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Combined views + downloads for {districtName}
          </p>
        </div>

        {/* Detailed Interactive Metric Pills */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Direct PDF Downloads</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
              {formatNumber(directDownloads)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Verified document saves</div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Document Views</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
              {formatNumber(views)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Online preview requests</div>
          </div>
        </div>
      </div>

      {/* Trust & Verification Footer Note */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          <span>Approved Government Rate Document (DCC / DAO Fixation)</span>
        </span>
        <span className="hidden sm:inline text-navy-600 dark:text-blue-400 font-medium">
          Er G Platform Certified
        </span>
      </div>
    </div>
  );
}
