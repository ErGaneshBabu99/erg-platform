import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "navy" | "gold" | "green" | "red" | "gray";
}

const variants = {
  navy: "badge-navy",
  gold: "badge-gold",
  green: "badge bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  red: "badge bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  gray: "badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function Badge({ className, variant = "gray", ...props }: BadgeProps) {
  return <span className={cn(variants[variant], className)} {...props} />;
}
