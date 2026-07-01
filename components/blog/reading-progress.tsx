/**
 * ReadingProgress — Client Component
 * Fixed top bar that fills as the user scrolls through the article.
 */

"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-white/5">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
