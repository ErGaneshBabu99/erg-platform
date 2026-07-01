"use client";

import React from "react";
import { FileDown, Search, Shield, Clock, MapPin, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    icon: FileDown,
    title: "Free PDF Downloads",
    description: "Instant access to official district rate PDFs for all 77 districts. No registration required.",
  },
  {
    icon: Search,
    title: "Powerful Search",
    description: "Find any district rate by district name, province, or fiscal year instantly.",
  },
  {
    icon: Clock,
    title: "Always Updated",
    description: "Updated every fiscal year. Get the latest rates the moment they are published.",
  },
  {
    icon: Shield,
    title: "Official & Verified",
    description: "All rates sourced directly from Government of Nepal publications. Fully verified.",
  },
  {
    icon: MapPin,
    title: "All 77 Districts",
    description: "Complete coverage across all 7 provinces and 77 districts of Nepal.",
  },
  {
    icon: Zap,
    title: "Fast Access",
    description: "Find and download district rates in seconds. Optimised for mobile and desktop.",
  },
];

const delays = [1, 2, 3, 4, 5, 6] as const;

export function Features() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950/50 border-y border-gray-100 dark:border-gray-800/50 relative overflow-hidden">
      {/* Ambient gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy-600/[0.03] dark:bg-navy-400/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="container-erg relative">
        <Reveal className="mb-12">
          <p className="text-xs font-semibold text-navy-600 dark:text-blue-400 uppercase tracking-widest mb-3">Why Er G</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white max-w-md">
            Built for Nepal&apos;s Engineers
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={delays[i]}>
              <div className="hover-lift group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:border-navy-200 dark:hover:border-navy-700 hover:shadow-card-hover transition-all duration-300 h-full">
                <div className="w-9 h-9 bg-navy-50 dark:bg-navy-900/40 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-navy-100 dark:group-hover:bg-navy-800/60">
                  <feature.icon className="w-4.5 h-4.5 text-navy-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
