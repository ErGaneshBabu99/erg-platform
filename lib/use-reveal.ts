"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight scroll-reveal hook (Framer-Motion-free).
 * Attach the returned ref to any element, then conditionally
 * add the "in-view" class alongside the "reveal" utility class
 * defined in globals.css.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced motion preference
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
