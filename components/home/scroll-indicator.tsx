"use client";

import React from "react";

export function ScrollIndicator() {
  return (
    <div
      className="hidden md:flex flex-col items-center gap-2 absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none"
      aria-hidden="true"
    >
      <span className="text-white/30 text-[10px] font-medium tracking-[0.2em] uppercase">
        Scroll
      </span>
      <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
        <span className="w-1 h-1.5 rounded-full bg-accent animate-scroll-dot" />
      </div>
    </div>
  );
}
