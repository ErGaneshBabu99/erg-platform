import React from "react";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-navy-950">
      <img
        src="/hero-bg1.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.5] animate-fade-bg-1"
      />
      <img
        src="/hero-bg2.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.5] animate-fade-bg-2"
      />
      <div className="absolute inset-0 bg-navy-950/00" />
    </div>
  );
}