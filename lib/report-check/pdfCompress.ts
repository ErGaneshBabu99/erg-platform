"use client";

// Client-side PDF compression: re-renders each page onto a canvas at a
// controlled resolution and re-encodes it as JPEG, then rebuilds a new PDF
// with jsPDF. This is what actually shrinks scanned/photographed reports —
// re-encoding at a sane DPI/quality is usually far smaller than whatever
// the scanning app embedded. Text-only PDFs are already small and won't
// shrink much further; we don't run compression on those since the size
// check that triggers this only fires above 50MB, which text PDFs rarely
// reach in the first place.
//
// Steps are tried in order, stopping at the first one that fits the
// target size — this avoids over-compressing a file that only needed a
// light pass.

export interface CompressionProgress {
  pageIndex: number;
  pageCount: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
}

const QUALITY_STEPS: Array<{ scale: number; quality: number }> = [
  { scale: 1.5, quality: 0.7 },
  { scale: 1.2, quality: 0.6 },
  { scale: 1.0, quality: 0.5 },
  { scale: 0.85, quality: 0.4 },
];

async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

async function renderAtSettings(
  arrayBuffer: ArrayBuffer,
  scale: number,
  quality: number,
  onProgress?: (p: CompressionProgress) => void
): Promise<Blob> {
  const pdfjsLib = await loadPdfJs();
  const { jsPDF } = await import("jspdf");

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const pageCount = pdf.numPages;

  let doc: InstanceType<typeof jsPDF> | null = null;

  for (let i = 1; i <= pageCount; i++) {
    onProgress?.({ pageIndex: i, pageCount });

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported.");

    await page.render({ canvasContext: ctx, viewport }).promise;
    const imgData = canvas.toDataURL("image/jpeg", quality);

    // Keep the output page the same physical size as the original
    // (unscaled viewport = PDF points at 72dpi).
    const baseViewport = page.getViewport({ scale: 1 });
    const widthPt = baseViewport.width;
    const heightPt = baseViewport.height;
    const orientation = widthPt > heightPt ? "landscape" : "portrait";

    if (!doc) {
      doc = new jsPDF({ orientation, unit: "pt", format: [widthPt, heightPt] });
    } else {
      doc.addPage([widthPt, heightPt], orientation);
    }
    doc.addImage(imgData, "JPEG", 0, 0, widthPt, heightPt);

    // Release canvas memory before the next page — matters for long
    // documents on lower-end phones.
    canvas.width = 0;
    canvas.height = 0;
  }

  if (!doc) throw new Error("PDF has no pages.");
  return doc.output("blob");
}

export async function compressPdf(
  file: File,
  targetBytes: number,
  onProgress?: (p: CompressionProgress) => void
): Promise<CompressionResult> {
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();

  let bestBlob: Blob | null = null;

  for (const step of QUALITY_STEPS) {
    const blob = await renderAtSettings(arrayBuffer, step.scale, step.quality, onProgress);
    bestBlob = blob;
    if (blob.size <= targetBytes) break;
  }

  if (!bestBlob) {
    throw new Error("Compression produced no output.");
  }

  const compressedFile = new File(
    [bestBlob],
    file.name.replace(/\.pdf$/i, "") + "-compressed.pdf",
    { type: "application/pdf" }
  );

  return { file: compressedFile, originalSize, compressedSize: compressedFile.size };
}
