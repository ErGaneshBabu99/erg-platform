export default function DistrictRateLoading() {
  return (
    <div className="container-erg py-10">
      {/* Skeleton for SearchFilters bar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 h-11 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="lg:w-56 h-11 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="lg:w-48 h-11 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="lg:w-48 h-11 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>

      {/* Skeleton grid matching DistrictRateGrid card layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card-base">
            <div className="p-5">
              {/* Header: icon + title + badge */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
                <div className="h-5 w-12 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0" />
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ml-auto" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
