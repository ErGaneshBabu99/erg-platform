/**
 * TableOfContents Component
 *
 * Parses H2/H3 headings from article HTML content and renders
 * a sticky sidebar navigation for long articles.
 * Client component for active section tracking.
 */

"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(html: string): Heading[] {
  // Parse headings from HTML string (server-safe: regex approach)
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]) as 2 | 3;
    const rawText = match[2].replace(/<[^>]+>/g, "").trim();
    if (!rawText) continue;

    const id = rawText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);

    headings.push({ id, text: rawText, level });
  }

  return headings;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -70% 0%" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="p-5 rounded-2xl bg-white/5 border border-white/10 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Table of Contents</h3>
      </div>

      <ol className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`
                block text-xs py-1 leading-relaxed transition-colors duration-200
                ${level === 3 ? "pl-3" : "pl-0"}
                ${
                  activeId === id
                    ? "text-blue-400 font-medium"
                    : "text-white/40 hover:text-white/70"
                }
              `}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
