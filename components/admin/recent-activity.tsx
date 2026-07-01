import React from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ActivityItem {
  id: string;
  label: string;
  meta: string;
  time: Date;
  href?: string;
}

interface RecentActivityProps {
  title: string;
  items: ActivityItem[];
  emptyText?: string;
}

export function RecentActivity({ title, items, emptyText = "No recent activity" }: RecentActivityProps) {
  return (
    <div className="card-base p-5">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex-1 min-w-0">
                {item.href ? (
                  <Link href={item.href} className="text-sm font-medium text-gray-900 dark:text-white hover:text-navy-600 dark:hover:text-blue-400 truncate block">
                    {item.label}
                  </Link>
                ) : (
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.label}</div>
                )}
                <div className="text-xs text-gray-400 truncate">{item.meta}</div>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">{formatDate(item.time)}</div>
              {item.href && <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
