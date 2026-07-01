"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-5 left-5 sm:left-6 z-40 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
