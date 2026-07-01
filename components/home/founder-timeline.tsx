"use client";

import React from "react";
import { Reveal } from "@/components/ui/reveal";
import {
  Award,
  BadgeCheck,
  Building2,
  GraduationCap,
  Rocket,
  Users,
  type LucideIcon,
} from "lucide-react";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const timeline: TimelineItem[] = [
  {
    year: "2078 B.S.",
    title: "Started Civil Engineering Practice",
    description: "Began working on site supervision and estimation for residential and commercial projects across Bagmati Province.",
    icon: GraduationCap,
  },
  {
    year: "2080 B.S.",
    title: "Built First District Rate Database",
    description: "Organized a personal archive of district rates for daily site work — the seed that became Er G.",
    icon: Building2,
  },
  {
    year: "2082 B.S.",
    title: "Launched Er G Platform",
    description: "Opened the database to the public, free for every engineer and contractor in Nepal.",
    icon: Rocket,
  },
  {
    year: "2083 B.S.",
    title: "Growing Engineering Community",
    description: "Expanded into engineering blog content, job vacancies, and direct consultancy for fellow professionals.",
    icon: Users,
  },
];

const certifications = [
  { label: "Registered Civil Engineer", issuer: "Nepal Engineering Council", icon: BadgeCheck },
  { label: "B.E. Civil Engineering", issuer: "Purbanchal University", icon: GraduationCap },
  { label: "Engineering Research Contributor", issuer: "Independent Practice", icon: Award },
];

const experience = [
  { metric: "5+", label: "Years in Practice" },
  { metric: "77", label: "Districts Documented" },
  { metric: "50+", label: "Projects Estimated" },
  { metric: "1000+", label: "Engineers Reached" },
];

export function FounderTimeline() {
  return (
    <div className="space-y-16">
      {/* Experience metrics */}
      <Reveal className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {experience.map((item) => (
          <div
            key={item.label}
            className="hover-lift text-center p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="text-2xl md:text-3xl font-display font-bold text-navy-600 dark:text-blue-400 mb-1">
              {item.metric}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</div>
          </div>
        ))}
      </Reveal>

      {/* Timeline */}
      <div>
        <Reveal className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">My Journey</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">From the field to the platform.</p>
        </Reveal>

        <div className="relative pl-8 sm:pl-10">
          {/* Vertical line */}
          <div className="absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-navy-200 via-navy-300 to-transparent dark:from-navy-700 dark:via-navy-800" />

          <div className="space-y-10">
            {timeline.map((item, i) => (
              <Reveal key={item.year} delay={((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6} className="relative">
                {/* Node */}
                <div className="absolute -left-8 sm:-left-10 top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-navy-600 dark:bg-navy-700 border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-card">
                  <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>

                <div className="hover-lift bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 ml-1">
                  <span className="text-xs font-bold text-accent-dark dark:text-accent uppercase tracking-wide">
                    {item.year}
                  </span>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mt-1.5 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div>
        <Reveal className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">
            Certifications &amp; Credentials
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {certifications.map((cert, i) => (
            <Reveal key={cert.label} delay={((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6}>
              <div className="hover-lift flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 h-full">
                <div className="w-9 h-9 bg-navy-50 dark:bg-navy-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <cert.icon className="w-4.5 h-4.5 text-navy-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {cert.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{cert.issuer}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
