"use client";
import React, { useState } from "react";
import { Eye } from "lucide-react";

interface Props {
  pdfUrl: string;
}

export function PdfViewerButton({ pdfUrl }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary flex-1 flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View PDF
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b">
              <span className="font-semibold text-gray-800">View PDF</span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-800 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>
            <iframe
              src={pdfUrl}
              className="flex-1 w-full rounded-b-xl"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </>
  );
}