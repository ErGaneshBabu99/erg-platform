"use client";
import React, { useState, useEffect } from "react";
import { Eye, ExternalLink, X, Download } from "lucide-react";

interface Props {
  pdfUrl: string;
  districtName?: string;
  districtRateId?: string;
}

export function PdfViewerButton({
  pdfUrl,
  districtName = "District Rate",
  districtRateId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  const directTabUrl = pdfUrl;

  const handleDownloadTracking = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined") {
      let originX = window.innerWidth / 2;
      let originY = window.innerHeight * 0.75;
      if (e?.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }

      window.dispatchEvent(
        new CustomEvent("start-pdf-celebration", {
          detail: { originX, originY },
        })
      );

      if (districtRateId) {
        window.dispatchEvent(
          new CustomEvent("district-rate-download-triggered", {
            detail: { id: districtRateId },
          })
        );
      }
    }

    if (districtRateId) {
      try {
        fetch(`/api/district-rate/${districtRateId}/download`, {
          method: "POST",
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-secondary flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
      >
        <Eye className="w-4 h-4 text-navy-600 dark:text-blue-400" />
        View PDF
      </button>

      {/* Online Document Viewer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-navy-950 text-white px-4 py-3 rounded-t-2xl border-b border-white/10 shadow-lg">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Eye className="w-4 h-4 text-accent shrink-0" />
              <span className="font-semibold text-sm md:text-base truncate">
                {districtName} Rate PDF Viewer
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={pdfUrl}
                download
                onClick={(e) => handleDownloadTracking(e)}
                className="inline-flex items-center gap-1.5 text-xs text-navy-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                title="Download file directly"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
              <a
                href={directTabUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleDownloadTracking(e)}
                className="inline-flex items-center gap-1.5 text-xs text-navy-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in Tab</span>
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1 cursor-pointer"
                aria-label="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-gray-900 rounded-b-2xl overflow-hidden shadow-2xl relative">
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title={`${districtName} PDF Viewer`}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}