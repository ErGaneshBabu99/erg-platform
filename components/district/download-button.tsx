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
    // Track download
    await fetch(`/api/district-rate/${districtRateId}/download`, {
      method: "POST",
    }).catch(() => {});

    // Fetch PDF as blob then download
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
