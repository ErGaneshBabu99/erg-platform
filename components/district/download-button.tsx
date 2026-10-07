"use client";
import React from "react";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  districtRateId: string;
  pdfUrl: string;
  fileName: string;
}

export function DownloadButton({ districtRateId, pdfUrl, fileName }: DownloadButtonProps) {
  const handleDownload = () => {
    // Notify in-page components (e.g. DistrictStatsLive) immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("district-rate-download-triggered", {
          detail: { id: districtRateId },
        })
      );
    }

    // Record download on server with keepalive to survive tab/navigation changes
    try {
      fetch(`/api/district-rate/${districtRateId}/download`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Non-blocking
    }
  };

  return (
    <a
      href={pdfUrl}
      download={fileName}
      onClick={handleDownload}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow"
    >
      <Download className="w-4 h-4" />
      Download PDF
    </a>
  );
}
