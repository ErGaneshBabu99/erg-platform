import React from "react";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  change?: string;
  urgent?: boolean;
}

export function AdminStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "card-base p-5",
            stat.urgent && "border-amber-200 dark:border-amber-800"
          )}
        >
          <div className={cn(
            "text-3xl font-display font-bold mb-1",
            stat.urgent ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"
          )}>
            {stat.value}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
          {stat.change && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.change}</div>
          )}
        </div>
      ))}
    </div>
  );
}
