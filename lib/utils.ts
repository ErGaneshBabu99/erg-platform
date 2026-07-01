import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-NP").format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function generateDistrictRateSlug(
  districtSlug: string,
  fiscalYear: string
): string {
  return `${districtSlug}-${fiscalYear.replace("/", "-")}`;
}

export function getAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${baseUrl}${path}`;
}
