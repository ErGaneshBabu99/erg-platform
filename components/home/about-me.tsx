"use client";

import React from "react";
import { Compass, Target, Eye, Wrench, Heart, Route } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const aboutBlocks = [
  {
    icon: Compass,
    title: "Who I Am",
    description:
      "A civil engineer based in Nepal, focused on bridging the gap between government engineering data and the professionals who need it most.",
  },
  {
    icon: Target,
    title: "Mission",
    description:
      "To make accurate engineering data — starting with district rates — freely accessible to every engineer, contractor, and student in Nepal.",
  },
  {
    icon: Eye,
    title: "Vision",
    description:
      "A connected engineering ecosystem for Nepal: data, tools, careers, and community in one trusted platform.",
  },
  {
    icon: Wrench,
    title: "What I Do",
    description:
      "I build and maintain district rate databases, write practical engineering guides, and consult on estimation, BOQ, and rate analysis.",
  },
  {
    icon: Heart,
    title: "Values",
    description:
      "Accuracy first. Free access for working engineers. No shortcuts, no spam — just dependable, well-built resources.",
  },
  {
    icon: Route,
    title: "Journey",
    description:
      "Started as a personal database for my own site work, grown into a platform now used by engineers and contractors across Nepal.",
  },
];

export function AboutMe() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950/50 border-y border-gray-100 dark:border-gray-800/50 relative overflow-hidden">
      <img src="/Banner2.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none select-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-navy-600/[0.025] dark:bg-navy-400/[0.025] rounded-full blur-3xl pointer-events-none" />

      <div className="container-erg relative">
        <Reveal className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-semibold text-navy-600 dark:text-blue-400 uppercase tracking-widest mb-3">
            About Me
          </p>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">
            The Story Behind Er G
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {aboutBlocks.map((block, i) => (
            <Reveal key={block.title} delay={((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6}>
              <div className="hover-lift group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-navy-200 dark:hover:border-navy-700 hover:shadow-card-hover transition-all duration-300 h-full">
                <div className="w-10 h-10 bg-navy-50 dark:bg-navy-900/40 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <block.icon className="w-5 h-5 text-navy-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                  {block.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {block.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
