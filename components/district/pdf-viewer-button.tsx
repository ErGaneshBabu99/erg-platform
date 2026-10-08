"use client";

import React from "react";
import { Eye } from "lucide-react";

interface Props {
  pdfUrl: string;
  districtName?: string;
  districtRateId?: string;
  fileName?: string;
}

export function PdfViewerButton({
  pdfUrl,
  districtName = "District Rate",
  districtRateId,
  fileName,
}: Props) {
  const resolvedFileName =
    fileName ||
    `district-rate-${districtName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Preserve the native browser download; do not call e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("start-pdf-celebration", {
          detail: { originX, originY },
        })
      );

      if (districtRateId) {
        window.dispatchEvent(
          new CustomEvent("district-rate-download-triggered", {
            detail: {
              id: districtRateId,
              x: originX,
              y: originY,
              source: e.currentTarget,
            },
          })
        );
      }
    }

    if (districtRateId) {
      try {
        fetch(`/api/district-rate/${encodeURIComponent(districtRateId)}/download`, {
          method: "POST",
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Non-blocking download tracking
      }
    }
  };

  return (
    <a
      href={pdfUrl}
      download={resolvedFileName}
      onClick={handleDownload}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
      title="Download this PDF"
    >
      <Eye className="w-4 h-4 text-navy-600 dark:text-blue-400" />
      View PDF
    </a>
  );
}