"use client";

import React from "react";
import { useReveal } from "@/lib/use-reveal";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: "div" | "section";
}

export function Reveal({ children, className, delay, as = "div", ...props }: RevealProps) {
  const { ref, inView } = useReveal();
  const Tag = as as any;

  return (
    <Tag
      ref={ref}
      className={cn(
        "reveal",
        delay && `reveal-delay-${delay}`,
        inView && "in-view",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
