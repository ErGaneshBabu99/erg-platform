import React from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface ReviewCompleteProps {
  message: string;
  issuesFound: number;
  onStartOver: () => void;
}

export function ReviewComplete({ message, issuesFound, onStartOver }: ReviewCompleteProps) {
  return (
    <div className="card-base p-8 sm:p-10 text-center animate-pop-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
      </div>
      <h3 className="font-display font-bold text-xl text-navy-800 dark:text-white mb-2">
        Review complete
      </h3>
      <p className="prose-erg text-sm max-w-md mx-auto mb-1.5">{message}</p>
      {issuesFound > 0 && (
        <p className="text-xs text-gray-400 mb-6">
          {issuesFound} issue{issuesFound === 1 ? "" : "s"} reviewed in this session.
        </p>
      )}
      <button
        type="button"
        onClick={onStartOver}
        className="btn-secondary mt-4"
      >
        <RotateCcw className="w-4 h-4" />
        Review Another Document
      </button>
    </div>
  );
}
