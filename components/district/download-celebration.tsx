"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, FileSpreadsheet } from "lucide-react";

const HEADING_TEXT = "Your PDF just landed ✨";
const MESSAGE_TEXT = "Thank you for visiting. Come back soon—we’ll miss you!";
const VERIFIED_WHATSAPP_DIGITS = "9779847805353";
const WHATSAPP_PREFILLED_MESSAGE =
  "Namaste! I downloaded the district rate PDF. Could you please share the Excel file?";
const WHATSAPP_URL = `https://wa.me/${VERIFIED_WHATSAPP_DIGITS}?text=${encodeURIComponent(
  WHATSAPP_PREFILLED_MESSAGE
)}`;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
  alpha: number;
  trail: { x: number; y: number }[];
  arrived: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

interface Wave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export function DownloadCelebration() {
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [headingCharCount, setHeadingCharCount] = useState(0);
  const [messageCharCount, setMessageCharCount] = useState(0);
  const [showOffer, setShowOffer] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const offerCtaRef = useRef<HTMLAnchorElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const letterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeCelebration = useCallback(() => {
    setIsActive(false);
    setShowOffer(false);
    setHeadingCharCount(0);
    setMessageCharCount(0);
    isRunningRef.current = false;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (letterTimerRef.current) {
      clearTimeout(letterTimerRef.current);
      letterTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    document.body.style.overflow = "";

    if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === "function") {
      try {
        lastActiveElementRef.current.focus();
      } catch {
        // Safe fallback
      }
    }
  }, []);

  // Listen for the custom download celebration event
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      // Prevent duplicate timers / animations if already running
      if (isRunningRef.current) return;

      const customEvent = e as CustomEvent<{ originX?: number; originY?: number }>;
      const originX =
        typeof customEvent.detail?.originX === "number"
          ? customEvent.detail.originX
          : window.innerWidth / 2;
      const originY =
        typeof customEvent.detail?.originY === "number"
          ? customEvent.detail.originY
          : window.innerHeight * 0.75;

      originRef.current = { x: originX, y: originY };
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;

      isRunningRef.current = true;
      setIsActive(true);
      setShowOffer(false);
      setHeadingCharCount(0);
      setMessageCharCount(0);

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        // Immediate reveal for reduced motion
        setHeadingCharCount(HEADING_TEXT.length);
        setMessageCharCount(MESSAGE_TEXT.length);
        timerRef.current = setTimeout(() => {
          setShowOffer(true);
        }, 3000);
        return;
      }

      // Letter-by-letter reveal
      let hCount = 0;
      let mCount = 0;
      const totalHeading = HEADING_TEXT.length;
      const totalMessage = MESSAGE_TEXT.length;

      const stepLetters = () => {
        if (!isRunningRef.current) return;

        if (hCount < totalHeading) {
          hCount++;
          setHeadingCharCount(hCount);
          letterTimerRef.current = setTimeout(stepLetters, 35);
        } else if (mCount < totalMessage) {
          mCount++;
          setMessageCharCount(mCount);
          letterTimerRef.current = setTimeout(stepLetters, 26);
        } else {
          // Fully assembled - wait 3 seconds before showing Excel offer
          timerRef.current = setTimeout(() => {
            if (isRunningRef.current) {
              setShowOffer(true);
            }
          }, 3000);
        }
      };

      letterTimerRef.current = setTimeout(stepLetters, 100);
    };

    window.addEventListener("start-pdf-celebration", handleTrigger);
    return () => {
      window.removeEventListener("start-pdf-celebration", handleTrigger);
    };
  }, []);

  // Keyboard accessibility: Escape to close, focus trapping
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCelebration();
        return;
      }

      // Focus trap within dialog when offer is shown
      if (showOffer && dialogRef.current && e.key === "Tab") {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, showOffer, closeCelebration]);

  // Focus management when offer popup opens
  useEffect(() => {
    if (showOffer) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (offerCtaRef.current) {
          offerCtaRef.current.focus();
        } else if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 50);
    }
  }, [showOffer]);

  // Canvas particle & neon wave animation
  useEffect(() => {
    if (!isActive) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const ox = originRef.current.x;
    const oy = originRef.current.y;
    const targetCenterX = width / 2;
    const targetCenterY = height / 2 - 40;

    // Neon color palette
    const colors = ["#00f5d4", "#00bbf9", "#f72585", "#7209b7", "#ffbe0b", "#4cc9f0"];

    // Initialize waves radiating from button
    const waves: Wave[] = [
      { x: ox, y: oy, radius: 10, maxRadius: 280, alpha: 0.9, color: "#00f5d4" },
      { x: ox, y: oy, radius: 5, maxRadius: 360, alpha: 0.8, color: "#f72585" },
      { x: ox, y: oy, radius: 0, maxRadius: 420, alpha: 0.7, color: "#00bbf9" },
    ];

    // Flying particles launched towards center
    const particles: Particle[] = [];
    const particleCount = 140;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.8;
      const spreadDist = 40 + Math.random() * 80;
      const intermediateX = ox + Math.cos(angle) * spreadDist;
      const intermediateY = oy + Math.sin(angle) * spreadDist - 30;

      // Target jitter around center text
      const targetX = targetCenterX + (Math.random() - 0.5) * Math.min(width * 0.6, 420);
      const targetY = targetCenterY + (Math.random() - 0.5) * 80;

      particles.push({
        x: ox,
        y: oy,
        vx: (intermediateX - ox) * 0.15,
        vy: (intermediateY - oy) * 0.15,
        targetX,
        targetY,
        progress: 0,
        speed: 0.012 + Math.random() * 0.018,
        color: colors[i % colors.length],
        size: 2.5 + Math.random() * 3,
        alpha: 1,
        trail: [],
        arrived: false,
      });
    }

    const sparks: Spark[] = [];

    // Heart emoji animation state
    let heartY = oy;
    let heartX = ox;
    let heartAlpha = 1;
    let heartScale = 0.5;

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw expanding neon waves
      for (let i = 0; i < waves.length; i++) {
        const w = waves[i];
        if (w.radius < w.maxRadius) {
          w.radius += 4.5;
          w.alpha = Math.max(0, 0.9 * (1 - w.radius / w.maxRadius));

          ctx.save();
          ctx.beginPath();
          ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
          ctx.strokeStyle = w.color;
          ctx.globalAlpha = w.alpha;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = w.color;
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Animate and draw flying particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.arrived) {
          // Subtle shimmer after arrival
          ctx.save();
          ctx.globalAlpha = 0.25 + 0.25 * Math.sin(elapsed * 4 + i);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.targetX, p.targetY, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        p.progress += p.speed;

        // Quadratic bezier trajectory from origin -> control point -> target
        const t = Math.min(1, p.progress);
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        const ctrlX = (ox + p.targetX) / 2 + (i % 2 === 0 ? 90 : -90) * Math.sin(t * Math.PI);
        const ctrlY = Math.min(oy, p.targetY) - 120 * Math.sin(t * Math.PI);

        const currentX = (1 - easeT) * (1 - easeT) * ox + 2 * (1 - easeT) * easeT * ctrlX + easeT * easeT * p.targetX;
        const currentY = (1 - easeT) * (1 - easeT) * oy + 2 * (1 - easeT) * easeT * ctrlY + easeT * easeT * p.targetY;

        p.trail.push({ x: currentX, y: currentY });
        if (p.trail.length > 8) p.trail.shift();

        p.x = currentX;
        p.y = currentY;

        // Draw particle trail
        if (p.trail.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = p.size * 0.8;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.restore();
        }

        // Draw head
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.restore();

        if (t >= 1) {
          p.arrived = true;
          // Spawn little arrival spark
          for (let s = 0; s < 4; s++) {
            sparks.push({
              x: p.targetX,
              y: p.targetY,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              alpha: 1,
              color: p.color,
              size: 2,
            });
          }
        }
      }

      // 3. Draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.035;

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Heart Emoji rising animation
      if (heartAlpha > 0) {
        heartY -= 2.2;
        heartScale = Math.min(1.4, heartScale + 0.025);
        if (elapsed > 1.8) {
          heartAlpha = Math.max(0, heartAlpha - 0.02);
        }

        ctx.save();
        ctx.font = `${Math.round(28 * heartScale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = heartAlpha;
        ctx.shadowColor = "rgba(244, 63, 94, 0.8)";
        ctx.shadowBlur = 16;
        ctx.fillText("❤️", heartX, heartY);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  if (!mounted || !isActive) return null;

  return createPortal(
    <div
      className="download-celebration-container fixed inset-0 z-[1000] pointer-events-none"
      aria-live="polite"
    >
      {/* Canvas for neon particles, waves, and heart */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Center Screen Celebration Message (Letter-by-Letter Assembly) */}
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center p-6 text-center select-none transition-all duration-500 ${
          showOffer ? "opacity-80 scale-95 pointer-events-none -translate-y-16 sm:-translate-y-20" : "opacity-100 scale-100"
        }`}
      >
        <div className="max-w-2xl px-4 py-6">
          {/* Animated Heading */}
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3"
            style={{
              textShadow:
                "0 0 16px rgba(0, 245, 212, 0.65), 0 0 32px rgba(247, 37, 133, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8)",
            }}
          >
            {HEADING_TEXT.split("").map((char, index) => {
              const isRevealed = index < headingCharCount;
              return (
                <span
                  key={index}
                  className={`inline-block transition-all duration-200 ${
                    isRevealed
                      ? "opacity-100 transform-none"
                      : "opacity-0 scale-150 blur-sm"
                  }`}
                  style={{
                    color: index >= HEADING_TEXT.length - 2 ? "#ffd166" : "#ffffff",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </h2>

          {/* Animated Message */}
          <p
            className="text-base sm:text-lg md:text-xl font-medium text-emerald-100/90 max-w-xl mx-auto leading-relaxed"
            style={{
              textShadow:
                "0 0 12px rgba(0, 245, 212, 0.5), 0 2px 8px rgba(0, 0, 0, 0.9)",
            }}
          >
            {MESSAGE_TEXT.split("").map((char, index) => {
              const isRevealed = index < messageCharCount;
              return (
                <span
                  key={index}
                  className={`inline-block transition-all duration-150 ${
                    isRevealed
                      ? "opacity-100 transform-none"
                      : "opacity-0 scale-125 blur-xs"
                  }`}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </p>
        </div>
      </div>

      {/* Excel Offer Modal Dialog (Appears ~3 seconds after message forms) */}
      {showOffer && (
        <div
          className="pdf-success-backdrop pointer-events-auto"
          onClick={(e) => {
            // Click outside dialog closes the popup
            if (e.target === e.currentTarget) {
              closeCelebration();
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="excel-offer-title"
            aria-describedby="excel-offer-body"
            className="excel-offer"
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeCelebration}
              aria-label="Close offer"
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Excel Icon Badge */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(52,211,153,0.3)]">
              <FileSpreadsheet className="w-7 h-7 text-emerald-300" />
            </div>

            {/* Heading */}
            <h3
              id="excel-offer-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2"
            >
              An Excel file can make your work easier.
            </h3>

            {/* Body */}
            <p
              id="excel-offer-body"
              className="text-sm sm:text-base text-gray-200/90 leading-relaxed max-w-md mx-auto"
            >
              Want this district rate in Excel? Message Er G directly on WhatsApp.
            </p>

            {/* Action CTA */}
            <a
              ref={offerCtaRef}
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="excel-offer__cta cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-emerald-400/50"
            >
              Click here for Excel
            </a>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
