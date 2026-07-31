"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, ArrowRight } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { MAX_FILE_SIZE_BYTES } from "@/lib/report-check/validation";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function isAcceptedFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

interface ReportUploaderProps {
  onSubmit: (file: File) => void;
  disabled?: boolean;
}

export function ReportUploader({ onSubmit, disabled }: ReportUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((candidate: File | null) => {
    if (!candidate) return;
    setError(null);

    if (!isAcceptedFile(candidate)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`);
      return;
    }
    setFile(candidate);
  }, []);

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center text-center px-6 py-14 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 glass-light",
          isDragging
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-navy-200 dark:border-white/15 hover:border-navy-400 dark:hover:border-white/30",
          disabled && "opacity-60 cursor-not-allowed"
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF or DOCX document"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {!file ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-navy-600/10 dark:bg-white/10 flex items-center justify-center mb-5">
              <UploadCloud className="w-7 h-7 text-navy-600 dark:text-blue-300" />
            </div>
            <p className="font-display font-semibold text-navy-800 dark:text-white text-lg mb-1.5">
              Drag & drop your document here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse — PDF or DOCX, up to {formatFileSize(MAX_FILE_SIZE_BYTES)}
            </p>
          </>
        ) : (
          <div
            className="flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-900 rounded-2xl shadow-card animate-pop-in max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-navy-600 dark:text-blue-300" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-navy-800 dark:text-white truncate max-w-[220px] sm:max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={disabled}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center animate-pop-in">{error}</p>
      )}

      <div className="flex justify-center mt-6">
        <button
          type="button"
          disabled={!file || disabled}
          onClick={() => file && onSubmit(file)}
          className="shine inline-flex items-center gap-2 px-8 py-3.5 bg-navy-600 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-[0_8px_24px_rgba(26,58,107,0.35)] hover:-translate-y-0.5"
        >
          Check Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
