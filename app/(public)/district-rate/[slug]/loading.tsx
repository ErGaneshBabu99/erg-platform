import React from "react";

export default function DistrictDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-700 py-12 px-4">
        <div className="container-erg space-y-4">
          <div className="h-4 w-48 rounded bg-white/10 animate-pulse" />
          <div className="h-8 w-80 rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-60 rounded bg-white/10 animate-pulse" />
          <div className="flex gap-4 pt-2">
            <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
            <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="container-erg py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-base p-6 h-48 animate-pulse bg-gray-100 dark:bg-gray-800" />
            <div className="card-base p-6 h-36 animate-pulse bg-gray-100 dark:bg-gray-800" />
            <div className="card-base p-6 h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="space-y-5">
            <div className="card-base p-5 h-56 animate-pulse bg-gray-100 dark:bg-gray-800" />
            <div className="card-base p-5 h-44 animate-pulse bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
