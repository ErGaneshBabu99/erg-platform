/**
 * SkipLink — Accessibility
 * Visually hidden link that appears on focus.
 * Allows keyboard users to skip navbar and jump to main content.
 * Place this as the FIRST element inside <body> in app/layout.tsx.
 *
 * Usage in layout.tsx:
 *   import SkipLink from "@/components/ui/skip-link";
 *   ...
 *   <body>
 *     <SkipLink />
 *     <Navbar />
 *     <main id="main-content"> ... </main>
 *   </body>
 */

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-2.5 focus:rounded-xl
        focus:bg-blue-500 focus:text-white focus:text-sm focus:font-semibold
        focus:shadow-lg focus:shadow-blue-500/30
        focus:outline-none focus:ring-2 focus:ring-white/50
      "
    >
      Skip to main content
    </a>
  );
}
