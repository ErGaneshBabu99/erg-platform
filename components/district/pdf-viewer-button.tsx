"use client";
import React from "react";
import { Eye } from "lucide-react";

interface Props {
  pdfUrl: string;
}

export function PdfViewerButton({ pdfUrl }: Props) {
  return (
    <a
    href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary flex-1 flex items-center justify-center gap-2"
    >
      <Eye className="w-4 h-4" />
      View PDF
    </a>
  );
}