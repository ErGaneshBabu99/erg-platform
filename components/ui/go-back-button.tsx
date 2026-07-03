/**
 * GoBackButton — Client Component
 * Safe browser back navigation without javascript: href.
 */

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GoBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-lg px-2 py-1"
    >
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
      Go back
    </button>
  );
}
