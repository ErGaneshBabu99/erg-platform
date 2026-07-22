"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, FileText, Download } from "lucide-react";
import { ScrollIndicator } from "@/components/home/scroll-indicator";

const PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const STATS = [
  { value: "77", label: "Districts" },
  { value: "7", label: "Provinces" },
  { value: "Free", label: "Always" },
  { value: "PDF", label: "Direct Download" },
];

export function Hero() {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("");
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
  const timer = setInterval(() => {
    setCurrentBanner((prev) => (prev + 1) % 4);
  }, 3000);
  return () => clearInterval(timer);
}, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (province) params.set("province", province);
    router.push(`/district-rate?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-navy-950 pt-16 pb-24 md:pt-24 md:pb-32 min-h-[88vh] flex flex-col justify-center">
      {/* Premium animated gradient mesh background */}
      <div className="absolute inset-0 mesh-gradient animate-gradient-shift pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient floating orbs */}
      <div className="absolute top-10 right-[8%] w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-0 left-[5%] w-80 h-80 bg-navy-500/20 rounded-full blur-3xl animate-float-slow pointer-events-none" />

      {/* Floating geometric engineering shapes — subtle, decorative */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block" aria-hidden="true">
        {/* Rotated square — blueprint corner motif */}
        <div className="absolute top-[18%] right-[18%] w-16 h-16 border border-accent/20 rounded-lg animate-drift" />
        {/* Circle ring */}
        <div className="absolute top-[55%] right-[10%] w-10 h-10 border border-white/10 rounded-full animate-drift-reverse" />
        {/* Dashed hexagon-ish rotated square */}
        <div className="absolute bottom-[20%] right-[28%] w-24 h-24 border border-dashed border-white/10 rounded-2xl animate-spin-slow" />
        {/* Small filled dot grid accent */}
        <div className="absolute top-[30%] right-[35%] w-2 h-2 bg-accent/40 rounded-full animate-float" />
        <div className="absolute top-[40%] right-[6%] w-1.5 h-1.5 bg-white/30 rounded-full animate-float-slow" />
        {/* Triangle-like rotated square, engineering blueprint feel */}
        <div className="absolute top-[12%] right-[42%] w-12 h-12 border border-navy-300/15 rotate-45 animate-drift" />
      </div>

      {/* Banner Slideshow - Right Side */}
<div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block w-[420px] h-[280px] rounded-2xl overflow-hidden shadow-2xl">
  {[1, 2, 3, 4].map((num) => (
    <div
      key={num}
      className={`absolute inset-0 transition-opacity duration-1000 ${
        currentBanner === num - 1 ? "opacity-100" : "opacity-0"
      }`}
    >
      <Image
        src={`/Banner${num}.png`}
        alt={`Er G Banner ${num}`}
        fill
        className="object-cover"
        priority={num === 1}
      />
    </div>
  ))}
  {/* Dots indicator */}
  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
    {[0, 1, 2, 3].map((i) => (
      <button
        key={i}
        onClick={() => setCurrentBanner(i)}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          currentBanner === i ? "bg-white w-5" : "bg-white/50"
        }`}
      />
    ))}
  </div>
</div>


      <div className="container-erg relative">
        {/* Tag line */}
        <div className="flex items-center gap-2.5 mb-7 animate-erg-fade-up" style={{ animationDelay: "0.05s" }}>
          <span className="inline-block w-6 h-px bg-accent" />
          <span className="text-accent text-xs font-semibold tracking-[0.18em] uppercase">
            Nepal&apos;s Engineering Resource Platform
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white leading-[1.08] tracking-tight mb-5 max-w-2xl animate-erg-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          District Rate{" "}
          <span className="text-gradient-gold">Database Nepal</span>
        </h1>

        <p
          className="text-navy-300 text-base md:text-lg max-w-lg mb-10 leading-relaxed animate-erg-fade-up"
          style={{ animationDelay: "0.25s" }}
        >
          Official district rates for all 77 districts of Nepal.
          Free PDF downloads, updated every fiscal year.
        </p>

        {/* Search form — glass card */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl mb-6 animate-erg-scale-in"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="focus-glow flex gap-2 p-1.5 glass rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-shadow duration-300">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search district... e.g. Kathmandu"
                className="w-full pl-10 pr-3 py-2.5 bg-transparent text-white placeholder-white/35 text-sm focus:outline-none"
                aria-label="Search district"
              />
            </div>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="px-3 py-2.5 bg-white/8 text-white/70 text-sm rounded-lg focus:outline-none cursor-pointer border-0 appearance-none hidden sm:block transition-colors hover:bg-white/12"
              aria-label="Filter by province"
              style={{ minWidth: 120 }}
            >
              <option value="" className="text-gray-900 bg-white">All Provinces</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p} className="text-gray-900 bg-white">{p}</option>
              ))}
            </select>
            <button
              type="submit"
              className="shine flex items-center gap-1.5 px-5 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-[0_4px_20px_rgba(200,168,75,0.4)] hover:-translate-y-0.5 whitespace-nowrap"
            >
              Search
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Popular */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 px-1">
            <span className="text-white/30 text-xs">Popular:</span>
            {["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => router.push(`/district-rate?q=${d}`)}
                className="link-underline text-xs text-white/45 hover:text-white/85 transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
        </form>

        {/* Stronger CTA row */}
        <div
          className="flex flex-wrap items-center gap-3 mb-12 animate-erg-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <button
            onClick={() => router.push("/district-rate")}
            className="shine group flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-navy-900 text-sm font-bold rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4" />
            Browse All Districts
          </button>
          <button
            onClick={() => router.push("/district-rate?q=Kathmandu")}
            className="group flex items-center gap-2 px-6 py-3 glass text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            Quick Download
          </button>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-wrap gap-8 pt-10 border-t border-white/10 animate-erg-fade-up"
          style={{ animationDelay: "0.5s" }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="hover-lift cursor-default">
              <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
              <div className="text-white/40 text-xs mt-0.5 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
