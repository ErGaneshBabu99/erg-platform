"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      // Log the download
      await fetch(`/api/district-rate/${districtRateId}/download`, {
        method: "POST",
      }).catch(() => {}); // Non-blocking

      // Trigger download
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      loading={loading}
      className="flex-1"
      leftIcon={<Download className="w-4 h-4" />}
    >
      Download PDF
    </Button>
  );
}
