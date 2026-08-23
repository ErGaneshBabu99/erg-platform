"use client";

import React, { useEffect, useState } from "react";
import { UploadCloud, FileSearch, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Staged, time-based progress. We don't have real granular progress from
// the server for this phase (extraction + AI review happen inside one
// request), so this reflects typical timing for each step closely enough
// to feel accurate — better than a bare spinner with a static label for a
// wait that's usually 5-20s.
const STAGES = [
  { icon: UploadCloud, label: "Uploading your document", atMs: 0 },
  { icon: FileSearch, label: "Extracting text and structure", atMs: 1800 },
  { icon: Sparkles, label: "Reviewing with AI", atMs: 5000 },
  { icon: CheckCircle2, label: "Wrapping up", atMs: 14000 },
];

export function ReviewLoading() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timers = STAGES.slice(1).map((stage, i) =>
      setTimeout(() => setStageIndex(i + 1), stage.atMs)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const current = STAGES[stageIndex];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-pop-in">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-navy-100 dark:border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-navy-600 dark:border-blue-400 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon key={stageIndex} className="w-6 h-6 text-navy-600 dark:text-blue-300 animate-pop-in" strokeWidth={2.2} />
        </div>
      </div>

      <p key={stageIndex} className="font-display font-semibold text-navy-800 dark:text-white text-lg animate-pop-in">
        {current.label}…
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
        This can take a moment for longer documents.
      </p>

      <div className="flex items-center gap-1.5 mt-6">
        {STAGES.map((stage, i) => (
          <div
            key={stage.label}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i <= stageIndex ? "w-6 bg-navy-600 dark:bg-blue-400" : "w-1.5 bg-navy-100 dark:bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
