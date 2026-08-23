"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, ArrowRight, Loader2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { MAX_FILE_SIZE_BYTES, COMPRESS_TARGET_BYTES } from "@/lib/report-check/validation";
import { compressPdf } from "@/lib/report-check/pdfCompress";
import { ReviewLoading } from "./ReviewLoading";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function isAcceptedFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export interface UploadResult {
  sessionId?: string;
  completed?: boolean;
  status?: "unavailable";
  message?: string;
  issue?: unknown;
  error?: string;
}

interface ReportUploaderProps {
  onDone: (status: number, data: UploadResult) => void;
  onFail: (message: string) => void;
  disabled?: boolean;
}

type Stage = "idle" | "compressing" | "uploading";

// Uploads via XMLHttpRequest (not fetch) so we get real upload progress
// events for same-origin multipart requests — plain and reliable.
function uploadWithProgress(
  file: File,
  onProgress: (pct: number) => void,
  onTransferComplete: () => void
): Promise<{ status: number; data: UploadResult }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
        if (pct >= 100) onTransferComplete();
      }
    };
    xhr.onload = () => {
      let data: UploadResult;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = { error: `Unexpected server response (status ${xhr.status}).` };
      }
      resolve({ status: xhr.status, data });
    };
    xhr.onerror = () => reject(new Error("network error"));
    xhr.open("POST", "/api/report-check/upload");
    xhr.send(formData);
  });
}

export function ReportUploader({ onDone, onFail, disabled }: ReportUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [compressedInfo, setCompressedInfo] = useState<{ from: number; to: number } | null>(null);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = stage !== "idle";

  const handleFile = useCallback((candidate: File | null) => {
    if (!candidate) return;
    setError(null);
    setCompressedInfo(null);

    if (!isAcceptedFile(candidate)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }
    setFile(candidate);
  }, []);

  async function startUpload() {
    if (!file) return;
    setError(null);

    let workingFile = file;

    if (workingFile.size > MAX_FILE_SIZE_BYTES) {
      if (!isPdf(workingFile)) {
        setError(
          `This file is ${formatFileSize(workingFile.size)}, over the ${formatFileSize(
            MAX_FILE_SIZE_BYTES
          )} limit. Word documents can't be auto-compressed — please reduce embedded images and re-save.`
        );
        return;
      }

      setStage("compressing");
      setProgress(0);
      try {
        const result = await compressPdf(workingFile, COMPRESS_TARGET_BYTES, (p) => {
          setProgress(Math.round((p.pageIndex / p.pageCount) * 100));
        });
        workingFile = result.file;
        setCompressedInfo({ from: result.originalSize, to: result.compressedSize });

        if (workingFile.size > MAX_FILE_SIZE_BYTES) {
          setStage("idle");
          setError(
            `Couldn't compress below ${formatFileSize(
              MAX_FILE_SIZE_BYTES
            )} — best we got was ${formatFileSize(
              workingFile.size
            )}. Try removing some pages and upload again.`
          );
          return;
        }
      } catch (err) {
        console.error("[report-check] compression failed:", err);
        setStage("idle");
        setError("Couldn't compress this file. Try a smaller file or fewer pages.");
        return;
      }
    }

    setStage("uploading");
    setProgress(0);
    try {
      const { status, data } = await uploadWithProgress(workingFile, setProgress, () =>
        setAwaitingResponse(true)
      );
      onDone(status, data);
    } catch (err) {
      console.error("[report-check] upload failed:", err);
      setStage("idle");
      setAwaitingResponse(false);
      onFail("Couldn't reach the server. Please check your internet connection and try again.");
    }
  }

  if (awaitingResponse) {
    return <ReviewLoading />;
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (disabled || busy) return;
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center text-center px-6 py-14 rounded-3xl border-2 border-dashed transition-all duration-200 glass-light",
          isDragging
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-navy-200 dark:border-white/15 hover:border-navy-400 dark:hover:border-white/30",
          disabled || busy ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
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
          disabled={disabled || busy}
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
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-900 rounded-2xl shadow-card animate-pop-in">
              <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center flex-shrink-0">
                {busy ? (
                  <Loader2 className="w-5 h-5 text-navy-600 dark:text-blue-300 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 text-navy-600 dark:text-blue-300" />
                )}
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy-800 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {compressedInfo
                    ? `${formatFileSize(compressedInfo.from)} → ${formatFileSize(compressedInfo.to)}`
                    : formatFileSize(file.size)}
                </p>
              </div>
              {!busy && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setCompressedInfo(null);
                    setError(null);
                  }}
                  disabled={disabled}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {busy && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  <span>{stage === "compressing" ? "Compressing your file…" : "Uploading…"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-navy-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-navy-600 dark:bg-blue-400 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-500 text-center animate-pop-in">{error}</p>}

      <div className="flex justify-center mt-6">
        <button
          type="button"
          disabled={!file || disabled || busy}
          onClick={startUpload}
          className="shine inline-flex items-center gap-2 px-8 py-3.5 bg-navy-600 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-[0_8px_24px_rgba(26,58,107,0.35)] hover:-translate-y-0.5"
        >
          {busy ? (stage === "compressing" ? "Compressing…" : "Uploading…") : "Check Report"}
          {!busy && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
