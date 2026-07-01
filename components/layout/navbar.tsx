"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, Sun, Moon, Search, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";

const navLinks = [
  { label: "District Rates", href: "/district-rate" },
  { label: "Blog", href: "/blog" },
  { label: "Vacancies", href: "/vacancy" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isHeroPage = pathname === "/";
  const solid = scrolled || !isHeroPage;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          solid
            ? "glass-light shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-xl"
            : "bg-navy-950/60 backdrop-blur-md border-b border-white/10"
        )}
      >
        <nav className="container-erg" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm font-display transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
                  solid
                    ? "bg-navy-600 text-white shadow-sm"
                    : "bg-white/15 text-white border border-white/20"
                )}
              >
                E
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className={cn(
                    "font-display font-bold text-base leading-tight transition-colors duration-300",
                    solid ? "text-navy-700 dark:text-white" : "text-white"
                  )}
                >
                  Er G
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium tracking-widest uppercase hidden sm:block transition-colors duration-300",
                    solid ? "text-gray-400" : "text-white/50"
                  )}
                >
                  Engineering Hub Nepal
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      solid
                        ? isActive
                          ? "text-navy-700 dark:text-white"
                          : "text-gray-600 dark:text-gray-300 hover:text-navy-700 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/5"
                        : isActive
                          ? "text-white"
                          : "text-white/75 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {link.label}
                    {/* Active link indicator */}
                    <span
                      className={cn(
                        "absolute left-3.5 right-3.5 -bottom-[1px] h-[2px] rounded-full transition-all duration-300 origin-left",
                        isActive
                          ? cn("scale-x-100", solid ? "bg-navy-600 dark:bg-accent" : "bg-accent")
                          : "scale-x-0 bg-accent"
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <Link
                href="/district-rate?focus=search"
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 hover:scale-105",
                  solid
                    ? "text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/5"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                aria-label="Search district rates"
              >
                <Search className="w-[18px] h-[18px]" />
              </Link>

              {/* Dark mode toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 hover:scale-105",
                    solid
                      ? "text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/5"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <Sun className="w-[18px] h-[18px]" />
                  ) : (
                    <Moon className="w-[18px] h-[18px]" />
                  )}
                </button>
              )}

              {/* Premium CTA */}
              <Link
                href="/district-rate"
                className="shine hidden md:flex ml-1.5 items-center gap-1.5 px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-[0_4px_18px_rgba(26,58,107,0.4)] hover:-translate-y-0.5"
              >
                Explore
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "lg:hidden relative p-2 rounded-lg transition-colors ml-0.5",
                  solid
                    ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/5"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                )}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <span className="relative block w-5 h-5">
                  <Menu
                    className={cn(
                      "absolute inset-0 transition-all duration-200",
                      mobileOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                    )}
                  />
                  <X
                    className={cn(
                      "absolute inset-0 transition-all duration-200",
                      mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-xs bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">E</span>
            </div>
            <span className="font-display font-bold text-navy-700 dark:text-white text-base">Er G</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 text-[15px] font-medium rounded-xl mb-1 transition-all duration-200",
                  mobileOpen ? "animate-erg-fade-up" : "",
                  isActive
                    ? "text-navy-700 dark:text-white bg-navy-50 dark:bg-white/10"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                )}
                style={{ animationDelay: `${i * 0.05 + 0.05}s` }}
              >
                {link.label}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
              </Link>
            );
          })}

          {/* Mobile search */}
          <button
            onClick={() => {
              setMobileOpen(false);
              router.push("/district-rate?focus=search");
            }}
            className="flex items-center gap-3 w-full px-4 py-3.5 mt-2 text-[15px] font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search District Rates
          </button>
        </div>

        {/* Panel footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center gap-2 w-full py-2.5 mb-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          )}
          <Link
            href="/district-rate"
            className="shine flex items-center justify-center gap-2 w-full py-3 bg-navy-600 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Explore
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
}
