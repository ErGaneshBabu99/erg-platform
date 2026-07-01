"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Send, Facebook, Linkedin, Youtube, MessageCircle } from "lucide-react";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+977980XXXXXXX";
const EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? "info@erg.com.np";

const footerLinks = {
  platform: [
    { label: "District Rate Database", href: "/district-rate" },
    { label: "Engineering Blog", href: "/blog" },
    { label: "Vacancy Portal", href: "/vacancy" },
    { label: "Contact Us", href: "/contact" },
  ],
  company: [
    { label: "About Er G", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  resources: [
    { label: "BOQ Preparation Guide", href: "/blog/boq-preparation-guide" },
    { label: "District Rate FAQs", href: "/district-rate" },
    { label: "Engineering Career Tips", href: "/blog" },
  ],
  coming: [
    { label: "Building Design" },
    { label: "Valuation Calculator" },
    { label: "Online Courses" },
  ],
};

const socials = [
  { label: "WhatsApp", icon: MessageCircle, href: "https://wa.me/" + WHATSAPP.replace(/\D/g, "") },
  { label: "Facebook", icon: Facebook, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    // Newsletter backend not wired yet — UI placeholder only, per project constraints.
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="bg-navy-950 text-white border-t border-white/5 relative" aria-label="Site footer">
      <ScrollToTop />

      {/* Newsletter strip */}
      <div className="border-b border-white/5">
        <div className="container-erg py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="font-display font-bold text-white text-lg mb-1">
                Stay updated on new district rates
              </h3>
              <p className="text-navy-400 text-sm">
                Get notified when new fiscal year rates and engineering guides are published.
              </p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 text-sm font-medium text-green-400 bg-green-900/20 px-4 py-3 rounded-xl">
                Thanks — you&apos;re on the list!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="focus-glow flex w-full max-w-sm gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-navy-500 text-sm rounded-xl focus:outline-none focus:border-accent/40 transition-colors"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="shine flex items-center justify-center gap-1.5 px-5 py-3 bg-accent hover:bg-accent-dark text-navy-900 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="container-erg pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/15 transition-colors">
                <span className="text-white font-bold font-display text-sm">E</span>
              </div>
              <div>
                <div className="font-display font-bold text-white text-base">Er G</div>
                <div className="text-navy-400 text-xs">Engineering Hub Nepal</div>
              </div>
            </Link>
            <p className="text-navy-400 text-sm leading-relaxed mb-6 max-w-xs">
              Nepal&apos;s engineering resource platform, built by Ganesh Chapagain.
              Official district rates, vacancies, and engineering resources — free for all professionals.
            </p>
            <div className="space-y-2 mb-6">
              <a href={"https://wa.me/" + WHATSAPP.replace(/\D/g, "")} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-navy-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                {WHATSAPP}
              </a>
              <a href={"mailto:" + EMAIL} className="flex items-center gap-2 text-sm text-navy-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                {EMAIL}
              </a>
              <div className="flex items-center gap-2 text-sm text-navy-400">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                Kathmandu, Nepal
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-navy-300 hover:text-white border border-white/5 hover:border-white/15 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Platform</h3>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm text-navy-400 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Resources</h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm text-navy-400 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm text-navy-400 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coming Soon */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Coming Soon</h3>
            <ul className="space-y-2.5">
              {footerLinks.coming.map((item) => (
                <li key={item.label}>
                  <span className="text-sm text-navy-600">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-500 text-xs">
            © {year} Er G – Engineering Hub Nepal. All rights reserved.
          </p>
          <p className="text-navy-600 text-xs">
            Serving Nepal&apos;s engineers since 2082 B.S.
          </p>
        </div>
      </div>
    </footer>
  );
}
