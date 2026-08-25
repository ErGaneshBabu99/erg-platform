"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface AnalyticsViewsChartProps {
  data: { date: string; views: number }[];
}

function formatTick(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AnalyticsViewsChart({ data }: AnalyticsViewsChartProps) {
  if (data.every((d) => d.views === 0)) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        No views recorded in this range yet.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-white/10" />
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-gray-400"
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis tick={{ fontSize: 12, fill: "currentColor" }} className="text-gray-400" allowDecimals={false} width={40} />
          <Tooltip
            labelFormatter={(v) => formatTick(String(v))}
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
          />
          <Line type="monotone" dataKey="views" stroke="#1a3a6b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
