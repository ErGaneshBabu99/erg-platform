"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const previewJobs = [
  {
    id: 1,
    title: "Senior Civil Engineer",
    company: "ABC Construction Pvt. Ltd.",
    initials: "AC",
    location: "Kathmandu",
    deadline: "Feb 13, 2026",
    type: "Full-time",
    category: "Civil",
  },
  {
    id: 2,
    title: "Site Engineer",
    company: "Nepal Infrastructure Development",
    initials: "NI",
    location: "Pokhara",
    deadline: "Jan 29, 2026",
    type: "Full-time",
    category: "Civil",
  },
  {
    id: 3,
    title: "Structural Engineer",
    company: "BuildRight Engineering",
    initials: "BE",
    location: "Lalitpur",
    deadline: "Feb 18, 2026",
    type: "Contract",
    category: "Structural",
  },
];

const categoryColors: Record<string, string> = {
  Civil: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Structural: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

export function VacancyPreview() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container-erg">
        <Reveal className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-navy-600 dark:text-blue-400 uppercase tracking-widest mb-3">Jobs</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">
              Latest Vacancies
            </h2>
          </div>
          <Link
            href="/vacancy"
            className="link-underline flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-700 dark:text-blue-400 transition-colors whitespace-nowrap"
          >
            All Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {previewJobs.map((job, i) => (
            <Reveal key={job.id} delay={(i + 1) as 1 | 2 | 3}>
              <div className="hover-lift relative flex flex-col h-full p-5 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-navy-200 dark:hover:border-navy-700 hover:shadow-card-hover transition-all duration-300 group bg-white dark:bg-gray-900">
                {/* Deadline badge */}
                <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-navy-600 px-2.5 py-1 rounded-full shadow-sm">
                  <Clock className="w-2.5 h-2.5" />
                  {job.deadline}
                </span>

                {/* Company logo placeholder */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center flex-shrink-0 mb-4 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                  <span className="text-white font-display font-bold text-sm">{job.initials}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[job.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {job.category}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {job.type}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-gray-400 mb-3">{job.company}</p>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 mt-auto">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </div>

                <Link
                  href="/vacancy"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-navy-50 dark:bg-navy-900/30 group-hover:bg-navy-600 text-navy-700 dark:text-navy-300 group-hover:text-white text-xs font-semibold rounded-lg transition-all duration-300"
                >
                  Apply Now
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={4} className="mt-8 text-center">
          <Link
            href="/vacancy"
            className="shine inline-flex items-center gap-2 px-6 py-2.5 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 text-sm font-semibold rounded-xl hover:bg-navy-50 dark:hover:bg-navy-900/30 transition-all duration-300"
          >
            View All Vacancies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
