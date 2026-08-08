import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../lib/prisma";

/**
 * Migrates all DistrictRate PDF files from their current storage
 * (Supabase public URLs) to a GitHub Release, then updates each
 * record's pdfUrl to point at the new GitHub-hosted file.
 *
 * Requires two env vars (put these in .env, never commit them):
 *   GITHUB_TOKEN       - a GitHub Personal Access Token with "repo" scope
 *   GITHUB_REPO         - "owner/repo", e.g. "ErGaneshBabu99/erg-platform"
 *
 * Usage:
 *   npx tsx scripts/migrate-pdfs-to-github.ts            (dry run, no changes)
 *   npx tsx scripts/migrate-pdfs-to-github.ts --apply     (actually migrate)
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const RELEASE_TAG = "district-rate-pdfs";
const APPLY = process.argv.includes("--apply");

if (!GITHUB_TOKEN || !GITHUB_REPO) {
  console.error(
    "Missing GITHUB_TOKEN or GITHUB_REPO in .env. See comments at the top of this script."
  );
  process.exit(1);
}

const GH_API = "https://api.github.com";
const [OWNER, REPO] = GITHUB_REPO.split("/");

async function ghFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status} on ${path}: ${body}`);
  }
  return res.json();
}

async function getOrCreateRelease(): Promise<{ id: number; upload_url: string }> {
  try {
    const release = await ghFetch(
      `/repos/${OWNER}/${REPO}/releases/tags/${RELEASE_TAG}`
    );
    console.log(`Using existing release "${RELEASE_TAG}"`);
    return release;
  } catch {
    console.log(`Creating new release "${RELEASE_TAG}"...`);
    const release = await ghFetch(`/repos/${OWNER}/${REPO}/releases`, {
      method: "POST",
      body: JSON.stringify({
        tag_name: RELEASE_TAG,
        name: "District Rate PDFs",
        body: "Storage for district rate PDF files (migrated from Supabase).",
        prerelease: false,
      }),
    });
    return release;
  }
}

async function uploadAsset(
  uploadUrlTemplate: string,
  fileName: string,
  fileBuffer: ArrayBuffer
): Promise<string> {
  const uploadUrl = uploadUrlTemplate.replace(
    "{?name,label}",
    `?name=${encodeURIComponent(fileName)}`
  );
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/pdf",
    },
    body: fileBuffer,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asset upload failed for ${fileName}: ${body}`);
  }
  const data = await res.json();
  return data.browser_download_url as string;
}

async function main() {
  console.log("=================================");
  console.log("PDF Migration: Supabase -> GitHub Releases");
  console.log(`Mode: ${APPLY ? "APPLY (will make changes)" : "DRY RUN (no changes)"}`);
  console.log("=================================\n");

  const rates = await prisma.districtRate.findMany({
    select: { id: true, slug: true, pdfUrl: true },
  });

  console.log(`Found ${rates.length} district rate records.\n`);

  const release = APPLY ? await getOrCreateRelease() : null;

  let success = 0;
  let failed = 0;

  for (const rate of rates) {
    const fileName = `${rate.slug}.pdf`;
    console.log(`[${rate.slug}] downloading from ${rate.pdfUrl}`);

    try {
      const res = await fetch(rate.pdfUrl);
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      const buffer = await res.arrayBuffer();
      console.log(`  -> ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

      if (!APPLY) {
        success++;
        continue;
      }

      const newUrl = await uploadAsset(release!.upload_url, fileName, buffer);
      await prisma.districtRate.update({
        where: { id: rate.id },
        data: { pdfUrl: newUrl },
      });
      console.log(`  -> uploaded, DB updated: ${newUrl}`);
      success++;
    } catch (err) {
      console.error(`  -> FAILED: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log("\n=================================");
  console.log(`Done. Success: ${success}, Failed: ${failed}`);
  if (!APPLY) {
    console.log("\nThis was a dry run. Re-run with --apply to actually migrate.");
  }
  console.log("=================================");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());