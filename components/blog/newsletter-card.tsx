/**
 * NewsletterCard — Step 5 Performance + Step 1 Accessibility
 * Server Component — form submission handled via action.
 * Proper ARIA labels, focus states, semantic HTML.
 */

import { Mail, ArrowRight } from "lucide-react";

export function NewsletterCard() {
  return (
    <section
      className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/15"
      aria-labelledby="newsletter-heading"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <Mail className="w-5 h-5 text-blue-400" />
      </div>

      <h2
        id="newsletter-heading"
        className="text-sm font-bold text-white mb-1.5"
      >
        Stay Updated
      </h2>
      <p className="text-xs text-white/45 leading-relaxed mb-4">
        Get the latest civil engineering insights and Nepal infrastructure updates.
      </p>

      {/* Form */}
      <form
        action="https://theganeshpost.blogspot.com"
        target="_blank"
        rel="noopener noreferrer"
        className="space-y-2"
        aria-label="Newsletter subscription form"
      >
        <div>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            required
            className="
              w-full px-3 py-2.5 rounded-lg text-sm
              bg-white/5 border border-white/10
              text-white placeholder:text-white/25
              focus:outline-none focus:border-blue-500/50 focus:bg-white/8
              transition-all duration-200
            "
          />
        </div>

        <button
          type="submit"
          className="
            w-full inline-flex items-center justify-center gap-2
            px-4 py-2.5 rounded-lg
            bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold
            transition-all duration-200 active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]
          "
        >
          Subscribe
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </form>

      <p className="text-[11px] text-white/20 mt-3 text-center">
        No spam. Unsubscribe anytime.
      </p>
    </section>
  );
}
