"use client";

import React, { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { ReportUploader, type UploadResult } from "./ReportUploader";
import { ReviewLoading } from "./ReviewLoading";
import { ReviewCard } from "./ReviewCard";
import { ReviewComplete } from "./ReviewComplete";
import { ReviewUnavailable } from "./ReviewUnavailable";
import type { ReviewIssue } from "@/lib/report-check/types";

type Phase = "idle" | "uploading" | "issue" | "completed" | "error" | "unavailable";

export function ReportCheckClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [issue, setIssue] = useState<ReviewIssue | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string>("");
  const [issuesFound, setIssuesFound] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  function resetToIdle() {
    setPhase("idle");
    setSessionId(null);
    setIssue(null);
    setCompletionMessage("");
    setIssuesFound(0);
    setErrorMessage("");
    setIsLoadingNext(false);
  }

  function handleUploadDone(status: number, data: UploadResult) {
    if (status < 200 || status >= 300) {
      setErrorMessage(data.error || "Something went wrong while processing your document.");
      setPhase("error");
      return;
    }

    setSessionId(data.sessionId ?? null);

    if (data.status === "unavailable") {
      setPhase("unavailable");
    } else if (data.completed) {
      setCompletionMessage(data.message || "No issues were found.");
      setPhase("completed");
    } else if (data.issue) {
      setIssue(data.issue as ReviewIssue);
      setIssuesFound(1);
      setPhase("issue");
    } else {
      setErrorMessage("Received an unexpected response. Please try again.");
      setPhase("error");
    }
  }

  function handleUploadFail(message: string) {
    setErrorMessage(message);
    setPhase("error");
  }

  async function handleFindAnother() {
    if (!sessionId) return;
    setIsLoadingNext(true);

    try {
      const res = await fetch("/api/report-check/next-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      let data: UploadResult;
      try {
        data = await res.json();
      } catch {
        setErrorMessage(
          res.ok
            ? "Received an unexpected response. Please try again."
            : `Something went wrong on our end (error ${res.status}). Please try again.`
        );
        setPhase("error");
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong while finding the next issue.");
        setPhase("error");
        return;
      }

      if (data.status === "unavailable") {
        setPhase("unavailable");
      } else if (data.completed) {
        setCompletionMessage(data.message || "No more issues were found.");
        setPhase("completed");
      } else if (data.issue) {
        setIssue(data.issue as ReviewIssue);
        setIssuesFound((n) => n + 1);
        setPhase("issue");
      }
    } catch {
      setErrorMessage("Couldn't reach the server. Please check your internet connection and try again.");
      setPhase("error");
    } finally {
      setIsLoadingNext(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {phase === "idle" && <ReportUploader onDone={handleUploadDone} onFail={handleUploadFail} />}

      {phase === "uploading" && <ReviewLoading label="Extracting and reviewing your document..." />}

      {phase === "issue" && issue && (
        <ReviewCard issue={issue} onFindAnother={handleFindAnother} isLoadingNext={isLoadingNext} />
      )}

      {phase === "unavailable" && (
        <ReviewUnavailable onRetry={handleFindAnother} isRetrying={isLoadingNext} />
      )}

      {phase === "completed" && (
        <ReviewComplete message={completionMessage} issuesFound={issuesFound} onStartOver={resetToIdle} />
      )}

      {phase === "error" && (
        <div className="card-base p-8 text-center animate-pop-in">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <p className="font-display font-semibold text-navy-800 dark:text-white mb-2">
            Something went wrong
          </p>
          <p className="prose-erg text-sm max-w-md mx-auto mb-6">{errorMessage}</p>
          <button type="button" onClick={resetToIdle} className="btn-secondary">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
