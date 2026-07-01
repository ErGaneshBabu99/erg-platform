/**
 * BlogCardSkeleton — Phase 6 Polish
 * Pulse skeleton matching the updated BlogCard layout.
 * No custom CSS/config needed — uses Tailwind animate-pulse only.
 */

export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white/[0.03] border border-white/8">
      {/* Image placeholder */}
      <div className="aspect-[16/9] bg-white/5 animate-pulse" />

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        {/* Category */}
        <div className="w-20 h-5 rounded-full bg-white/5 animate-pulse" />

        {/* Title lines */}
        <div className="space-y-2">
          <div className="h-4 rounded-lg bg-white/5 w-full animate-pulse" />
          <div className="h-4 rounded-lg bg-white/5 w-3/4 animate-pulse" />
        </div>

        {/* Excerpt lines */}
        <div className="space-y-1.5">
          <div className="h-3 rounded bg-white/[0.04] w-full animate-pulse" />
          <div className="h-3 rounded bg-white/[0.04] w-5/6 animate-pulse" />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="h-3 rounded bg-white/[0.04] w-20 animate-pulse" />
          <div className="h-3 rounded bg-white/[0.04] w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function BlogHeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white/[0.03] border border-white/8">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image side */}
        <div className="min-h-[280px] bg-white/5 animate-pulse" />

        {/* Content side */}
        <div className="p-8 lg:p-10 flex flex-col gap-4">
          <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 rounded-lg bg-white/5 w-full animate-pulse" />
            <div className="h-6 rounded-lg bg-white/5 w-4/5 animate-pulse" />
            <div className="h-6 rounded-lg bg-white/5 w-3/5 animate-pulse" />
          </div>
          <div className="space-y-2 mt-2">
            <div className="h-3 rounded bg-white/[0.04] w-full animate-pulse" />
            <div className="h-3 rounded bg-white/[0.04] w-5/6 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-white/5 animate-pulse mt-2" />
        </div>
      </div>
    </div>
  );
}
