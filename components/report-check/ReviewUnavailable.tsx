import React from "react";
import { RotateCcw } from "lucide-react";

interface ReviewUnavailableProps {
  onRetry: () => void;
  isRetrying: boolean;
}

export function ReviewUnavailable({ onRetry, isRetrying }: ReviewUnavailableProps) {
  return (
    <div className="card-base p-8 text-center animate-pop-in">
      <p className="text-sm font-semibold text-navy-500 dark:text-navy-300 mb-2">👷 AI Reviewer</p>
      <p className="prose-erg text-sm max-w-md mx-auto mb-6">
        Hold on a second... I&apos;m double-checking your report to make sure I don&apos;t miss
        anything. I&apos;ll be right back with the next issue.
      </p>
      <button type="button" onClick={onRetry} disabled={isRetrying} className="btn-secondary">
        <RotateCcw className={isRetrying ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
        {isRetrying ? "Retrying..." : "Retry"}
      </button>
    </div>
  );
}