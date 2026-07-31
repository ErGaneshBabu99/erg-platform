import React from "react";
import { MapPin, Quote, Lightbulb, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewIssue } from "@/lib/report-check/types";

const SEVERITY_STYLES: Record<ReviewIssue["severity"], string> = {
  Low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  High: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

interface ReviewCardProps {
  issue: ReviewIssue;
  onFindAnother: () => void;
  isLoadingNext: boolean;
}

export function ReviewCard({ issue, onFindAnother, isLoadingNext }: ReviewCardProps) {
  const locationLabel = [
    issue.location.page ? `Page ${issue.location.page}` : null,
    issue.location.section,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="card-base p-6 sm:p-8 animate-pop-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="badge-navy">Issue #{issue.issueNumber}</span>
          <span className={cn("badge", SEVERITY_STYLES[issue.severity])}>{issue.severity} severity</span>
          <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {issue.category}
          </span>
        </div>
        {locationLabel && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            {locationLabel}
          </div>
        )}
      </div>

      <h3 className="font-display font-bold text-xl text-navy-800 dark:text-white mb-4">
        {issue.title}
      </h3>

      {issue.currentText && (
        <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 mb-4">
          <Quote className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
            &ldquo;{issue.currentText}&rdquo;
          </p>
        </div>
      )}

      <p className="prose-erg text-sm mb-5">{issue.explanation}</p>

      <div className="flex gap-3 p-4 rounded-xl bg-navy-50/60 dark:bg-navy-900/20 border border-navy-100 dark:border-navy-800/60">
        <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-sm text-navy-800 dark:text-navy-100 leading-relaxed">
          <span className="font-semibold">Suggested revision: </span>
          {issue.suggestion}
        </p>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onFindAnother}
          disabled={isLoadingNext}
          className="shine inline-flex items-center gap-2 px-6 py-3 bg-navy-600 hover:bg-navy-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          {isLoadingNext ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Finding next issue...
            </>
          ) : (
            <>
              Find Another Issue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
