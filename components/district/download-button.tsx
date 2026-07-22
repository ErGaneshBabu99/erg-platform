"use client";
import React, { useState } from "react";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  districtRateId: string;
  pdfUrl: string;
  fileName: string;
}

export function DownloadButton({ districtRateId, pdfUrl, fileName }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await fetch(`/api/district-rate/${districtRateId}/download`, {
        method: "POST",
      }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <a
      href={`/api/download-pdf?url=${encodeURIComponent(pdfUrl)}&name=${encodeURIComponent(fileName)}`}
      download={fileName}
      onClick={handleDownload}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg transition-all"
    >
      <Download className="w-4 h-4" />
      {loading ? "Downloading..." : "Download PDF"}
    </a>
  );
}
