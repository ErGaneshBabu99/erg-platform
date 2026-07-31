import React from "react";
import { Loader2 } from "lucide-react";

interface ReviewLoadingProps {
  label?: string;
}

export function ReviewLoading({ label = "Reviewing your document..." }: ReviewLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-pop-in">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-navy-100 dark:border-white/10" />
        <Loader2 className="absolute inset-0 w-16 h-16 text-navy-600 dark:text-blue-300 animate-spin" strokeWidth={2.5} />
      </div>
      <p className="font-display font-semibold text-navy-800 dark:text-white text-lg">{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">This can take a moment for longer documents.</p>
    </div>
  );
}
