"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWindow } from "./chat-window";

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Animated entrance after initial page load
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Stop the attention pulse once the user has opened it once
  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  return (
    <>
      {open && <ChatWindow onClose={() => setOpen(false)} />}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 sm:right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-navy-600 hover:bg-navy-700 text-white shadow-[0_8px_30px_rgba(26,58,107,0.45)] transition-all duration-500 hover:scale-105 active:scale-95",
          entered ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-75"
        )}
        aria-label={open ? "Close AI assistant" : "Open AI assistant — Namaste, I'm Ganesh"}
        aria-expanded={open}
      >
        {/* Ambient pulse ring */}
        {pulse && !open && (
          <span className="absolute inset-0 rounded-full bg-navy-500 animate-ping opacity-30" />
        )}

        <span className="relative">
          {open ? (
            <X className="w-6 h-6 transition-transform duration-300 rotate-0" />
          ) : (
            <MessageCircle className="w-6 h-6 transition-transform duration-300" />
          )}
        </span>

        {/* Small "G" badge */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-white dark:border-gray-950 flex items-center justify-center">
            <span className="text-navy-900 text-[9px] font-bold">G</span>
          </span>
        )}
      </button>
    </>
  );
}
