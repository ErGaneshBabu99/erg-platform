"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWindow } from "./chat-window";

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 500);
    const tooltipTimer = setTimeout(() => setShowTooltip(true), 1500);
    return () => {
      clearTimeout(t);
      clearTimeout(tooltipTimer);
    };
  }, []);

  useEffect(() => {
    if (open) setShowTooltip(false);
  }, [open]);

  return (
    <>
      {open && <ChatWindow onClose={() => setOpen(false)} />}

      <div
        className={cn(
          "fixed bottom-5 right-5 sm:right-6 z-50 flex items-center gap-3 transition-all duration-500",
          entered
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-16 opacity-0 scale-75"
        )}
      >
        {/* Floating invitation pill */}
        {!open && showTooltip && (
          <div
            onClick={() => setOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-navy-100 dark:border-gray-800 shadow-xl cursor-pointer hover:border-blue-500/60 transition-all duration-300 animate-in fade-in slide-in-from-right-4 group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Chat with Er. Ganesh
            </span>
          </div>
        )}

        {/* Messenger-style floating trigger button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400/40 shadow-[0_10px_35px_rgba(26,58,107,0.35)]",
            open
              ? "bg-navy-900 text-white border-2 border-white/20 rotate-90"
              : "ring-2 ring-blue-500/80 hover:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 bg-navy-800 overflow-hidden"
          )}
          aria-label={
            open
              ? "Close AI assistant"
              : "Open AI assistant — Chat with Er. Ganesh Chapagain"
          }
          aria-expanded={open}
        >
          {open ? (
            <X className="w-6 h-6 text-white transition-transform duration-300 -rotate-90" />
          ) : (
            <>
              {!imgError ? (
                <Image
                  src="/images/founder/ganesh-1.jpg"
                  alt="Er. Ganesh Chapagain"
                  fill
                  sizes="60px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={() => setImgError(true)}
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-navy-900 flex items-center justify-center text-white">
                  <MessageCircle className="w-6 h-6" />
                </div>
              )}

              {/* Active online pulse dot */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-950 shadow-sm">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
