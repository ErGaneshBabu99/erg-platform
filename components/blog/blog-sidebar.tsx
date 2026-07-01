"use client";

import { ExternalLink } from "lucide-react";

export default function BlogSidebar() {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-3">
          About The Ganesh Post
        </h3>

        <p className="text-sm text-white/60 leading-6">
          Engineering articles, civil engineering resources, infrastructure,
          BOQ guides, district rates and professional insights from Nepal.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-3">
          Official Blogger
        </h3>

        <p className="text-sm text-white/60 mb-5">
          Read every published article directly on Blogger.
        </p>

        <a
          href="https://theganeshpost.blogspot.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition"
        >
          Visit Blogger
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Popular Topics
        </h3>

        <div className="flex flex-wrap gap-2">
          {[
            "Civil Engineering",
            "Hydropower",
            "District Rates",
            "BOQ",
            "AutoCAD",
            "Estimation",
            "Construction",
            "Nepal",
          ].map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}