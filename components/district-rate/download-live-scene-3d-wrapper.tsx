"use client";

import dynamic from "next/dynamic";

export const DownloadLiveScene3DWrapper = dynamic(
  () =>
    import("@/components/district-rate/download-live-scene-3d").then(
      (m) => m.DownloadLiveScene3D
    ),
  { ssr: false }
);
