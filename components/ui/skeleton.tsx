import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "circle" | "rect";
}

export function Skeleton({ className, variant = "rect", ...props }: SkeletonProps) {
  const variants = {
    text: "h-4 rounded-md",
    card: "h-full w-full rounded-2xl",
    circle: "rounded-full",
    rect: "rounded-xl",
  };

  return <div className={cn("skeleton", variants[variant], className)} {...props} />;
}

/** Premium loading skeleton for a district rate card grid */
export function DistrictRateCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
      <Skeleton className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-10 h-3" />
    </div>
  );
}
