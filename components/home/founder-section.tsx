"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, BadgeCheck, Building2, MapPin } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

// Real photos — place files at public/images/founder/ with these exact names.
// ganesh-1.jpg is the default hero portrait shown on first load.
const galleryPhotos = [
  { id: 1, src: "/images/founder/ganesh-1.jpg", label: "Ganesh Chapagain" },
  { id: 2, src: "/images/founder/ganesh-2.jpg", label: "Site Supervision" },
  { id: 3, src: "/images/founder/ganesh-3.jpg", label: "Project Review" },
  { id: 4, src: "/images/founder/ganesh-4.jpg", label: "Field Survey" },
  { id: 5, src: "/images/founder/ganesh-5.jpg", label: "Engineering Consultation" },
];

const achievements = [
  { icon: BadgeCheck, label: "Registered Engineer" },
  { icon: Building2, label: "Civil Engineering Practice" },
  { icon: Award, label: "Engineering Research" },
];

export function FounderSection() {
  const [activePhoto, setActivePhoto] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-900 relative overflow-hidden">
  <img src="/Banner1.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none select-none" />
      {/* Ambient accent */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-navy-600/[0.03] dark:bg-navy-400/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="container-erg relative">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold text-navy-600 dark:text-blue-400 uppercase tracking-widest mb-3">
            Founder
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">
            Meet the Founder
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">
            Building Nepal&apos;s most trusted Civil Engineering Platform.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Bio */}
          <Reveal delay={1} className="order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700 dark:text-navy-300 bg-navy-50 dark:bg-navy-900/30 px-3 py-1.5 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" />
                Registered Civil Engineer
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Ganesh Chapagain
            </h3>
            <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-6">
              <MapPin className="w-3.5 h-3.5" />
              Kathmandu, Nepal
            </p>

            <div className="space-y-5 text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
              <p>
                I am a civil engineer dedicated to making engineering data accessible to
                every professional in Nepal. What started as a simple effort to organize
                district rate documents has grown into a mission to build the country&apos;s
                most trusted engineering platform.
              </p>
              <p>
                <span className="font-semibold text-gray-900 dark:text-white">My mission</span> is
                to remove the friction engineers face when accessing accurate construction
                data — and to build tools that genuinely save time on real projects.
              </p>
              <p>
                <span className="font-semibold text-gray-900 dark:text-white">My vision</span> is
                a Nepal where every engineer, contractor, and student has free, instant
                access to the resources they need — from district rates to design tools,
                estimation guides, and a growing professional community.
              </p>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
              {achievements.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover-lift"
                >
                  <div className="w-8 h-8 bg-navy-50 dark:bg-navy-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-navy-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="shine inline-flex items-center gap-2 mt-8 px-6 py-3 bg-navy-600 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_rgba(26,58,107,0.35)] hover:-translate-y-0.5"
            >
              My Full Story
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>

          {/* Right — Interactive Photo Gallery */}
          <Reveal delay={2} className="order-1 lg:order-2">
            <div className="relative">
              {/* Featured image */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(26,58,107,0.35)] border border-white/40 dark:border-white/10 group bg-navy-950">
                {!imgError[galleryPhotos[activePhoto].id] ? (
                  <Image
                    key={galleryPhotos[activePhoto].id}
                    src={galleryPhotos[activePhoto].src}
                    alt={galleryPhotos[activePhoto].label}
                    fill
                    priority={activePhoto === 0}
                    loading={activePhoto === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 1024px) 90vw, 480px"
                    className="object-cover animate-erg-scale-in transition-transform duration-700 group-hover:scale-105"
                    onError={() =>
                      setImgError((prev) => ({ ...prev, [galleryPhotos[activePhoto].id]: true }))
                    }
                  />
                ) : (
                  // Graceful fallback only if a specific photo file is missing/misnamed
                  <div className="w-full h-full bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950 flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                        <span className="text-white font-display font-bold text-2xl">GC</span>
                      </div>
                      <p className="text-white/50 text-xs font-medium tracking-wide">
                        {galleryPhotos[activePhoto].label}
                      </p>
                      <p className="text-white/25 text-[11px] mt-1">
                        Image not found — check {galleryPhotos[activePhoto].src}
                      </p>
                    </div>
                  </div>
                )}

                {/* Glass caption bar */}
                <div className="absolute bottom-0 left-0 right-0 glass p-4">
                  <p className="text-white text-sm font-semibold">
                    {galleryPhotos[activePhoto].label}
                  </p>
                </div>
              </div>

              {/* Thumbnail gallery */}
              <div className="flex gap-2.5 mt-4 justify-center">
                {galleryPhotos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setActivePhoto(i)}
                    className={cn(
                      "relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 bg-navy-900",
                      activePhoto === i
                        ? "border-accent scale-105 shadow-[0_4px_16px_rgba(200,168,75,0.4)]"
                        : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                    )}
                    aria-label={`View ${photo.label}`}
                    aria-pressed={activePhoto === i}
                  >
                    {!imgError[photo.id] ? (
                      <Image
                        src={photo.src}
                        alt={photo.label}
                        fill
                        loading="lazy"
                        sizes="64px"
                        className="object-cover"
                        onError={() =>
                          setImgError((prev) => ({ ...prev, [photo.id]: true }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-600 to-navy-900 flex items-center justify-center">
                        <span className="text-white/40 text-[10px] font-bold">{i + 1}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Floating accent badge */}
              <div className="absolute -top-4 -right-4 glass-light px-4 py-2.5 rounded-2xl shadow-lg hidden sm:block animate-float-slow">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-soft-pulse" />
                  <span className="text-xs font-semibold text-navy-700 dark:text-white">
                    Available for Consultancy
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
