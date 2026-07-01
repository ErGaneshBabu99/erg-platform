"use client";

import React, { useState } from "react";
import { Send, Mail, CheckCircle } from "lucide-react";

export function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // UI-only placeholder — no backend wired yet, per project constraints.
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-8 sm:p-10">
      <div className="absolute inset-0 mesh-gradient animate-gradient-shift opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-5">
          <Mail className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
          Get new articles from TheGaneshPost
        </h3>
        <p className="text-sm text-navy-300 leading-relaxed mb-6">
          Practical civil engineering guides, district rate updates, and career tips —
          delivered straight to your inbox.
        </p>

        {subscribed ? (
          <div className="flex items-center gap-2 text-sm font-medium text-green-400 bg-green-900/20 px-4 py-3 rounded-xl w-fit">
            <CheckCircle className="w-4 h-4" />
            Thanks — you&apos;re subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="focus-glow flex flex-col sm:flex-row gap-2 max-w-sm">
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
  );
}
