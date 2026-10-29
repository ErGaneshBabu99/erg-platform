import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const RELEASE_TAG = "district-rate-pdfs";
const LOCAL_DIR = "C:/Users/ACER/District_Rates_2083_2084";

const DRY_RUN = process.argv.includes("--dry-run");

if (!GITHUB_TOKEN || !GITHUB_REPO) {
  console.error("Missing GITHUB_TOKEN or GITHUB_REPO in environment.");
  process.exit(1);
}

const [OWNER, REPO] = GITHUB_REPO.split("/");
const GH_API = "https://api.github.com";

interface GhAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}

interface GhRelease {
  id: number;
  upload_url: string;
  assets: GhAsset[];
}

async function ghFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${GH_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "erg-platform-uploader",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status} on ${endpoint}: ${text}`);
  }
  return res.json();
}

async function getRelease(): Promise<GhRelease> {
  return ghFetch(`/repos/${OWNER}/${REPO}/releases/tags/${RELEASE_TAG}`);
}

async function deleteAsset(assetId: number): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${GH_API}/repos/${OWNER}/${REPO}/releases/assets/${assetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "erg-platform-uploader",
        },
      });
      if (res.ok || res.status === 404) {
        return;
      }
      const text = await res.text();
      console.warn(`  Delete attempt ${attempt} returned status ${res.status}: ${text}`);
    } catch (err) {
      console.warn(`  Delete attempt ${attempt} network error: ${(err as Error).message}`);
    }
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

async function uploadAsset(
  uploadUrlTemplate: string,
  fileName: string,
  buffer: Buffer
): Promise<GhAsset> {
  const uploadUrl = uploadUrlTemplate.replace(
    "{?name,label}",
    `?name=${encodeURIComponent(fileName)}`
  );

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/pdf",
      "Content-Length": buffer.length.toString(),
      "User-Agent": "erg-platform-uploader",
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asset upload failed for ${fileName} (${res.status}): ${text}`);
  }

  return res.json();
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/_district_rate.*\.pdf$/, "")
    .replace(/-2083-84$/, "")
    .replace(/-/g, "")
    .replace(/_/g, "")
    .trim();
}

const specialMap: Record<string, string> = {
  nawalpur: "nawalparasi_east_district_rate_2083_2084.pdf",
  rupendehi: "rupandehi_district_rate_2083_2084.pdf",
  terhathum: "tehrathum_district_rate_2083_2084.pdf",
};

async function main() {
  console.log("=================================================");
  console.log("District Rate PDFs Sync: Local -> GitHub Releases");
  console.log(`Source Folder : ${LOCAL_DIR}`);
  console.log(`Release Tag   : ${RELEASE_TAG}`);
  console.log(`Mode          : ${DRY_RUN ? "DRY RUN (no changes)" : "APPLY (live upload & DB sync)"}`);
  console.log("=================================================\n");

  if (!fs.existsSync(LOCAL_DIR)) {
    throw new Error(`Local directory not found: ${LOCAL_DIR}`);
  }

  const localFiles = fs.readdirSync(LOCAL_DIR).filter((f) => f.endsWith(".pdf"));
  console.log(`Found ${localFiles.length} PDF files in local folder.\n`);

  const fy83 = await prisma.fiscalYear.findFirst({
    where: { year: "2083-84" },
  });

  if (!fy83) {
    throw new Error("Fiscal year 2083-84 not found in database.");
  }

  const rates = await prisma.districtRate.findMany({
    where: { fiscalYearId: fy83.id },
    include: { district: true },
    orderBy: { slug: "asc" },
  });

  console.log(`Found ${rates.length} rates in database for fiscal year 2083-84.\n`);

  console.log("Fetching existing release information from GitHub...");
  const release = await getRelease();
  console.log(`Connected to release "${release.id}" with ${release.assets.length} existing assets.\n`);

  // Map each rate to local file
  const tasks = rates.map((rate, index) => {
    let localFile =
      specialMap[rate.district.slug] ||
      localFiles.find((f) => normalize(f) === normalize(rate.district.slug));

    if (!localFile) {
      throw new Error(`Could not find local PDF for district ${rate.district.slug} (${rate.slug})`);
    }

    const localPath = path.join(LOCAL_DIR, localFile);
    const localStat = fs.statSync(localPath);
    const assetName = `${rate.slug}.pdf`;

    return {
      index: index + 1,
      total: rates.length,
      rateId: rate.id,
      slug: rate.slug,
      districtName: rate.district.name,
      assetName,
      localFile,
      localPath,
      localSize: localStat.size,
      localSizeMb: (localStat.size / (1024 * 1024)).toFixed(1),
    };
  });

  console.log(`All ${tasks.length} district rates successfully matched 1:1 to local files.\n`);

  if (DRY_RUN) {
    console.log("--- DRY RUN PLAN ---");
    let toUploadCount = 0;
    let upToDateCount = 0;

    for (const task of tasks) {
      const existing = release.assets.find((a) => a.name === task.assetName);
      if (existing && existing.size === task.localSize) {
        upToDateCount++;
        console.log(`[${task.index}/${task.total}] ${task.slug}: Already matching (${task.localSizeMb} MB)`);
      } else {
        toUploadCount++;
        const oldMb = existing ? `${(existing.size / 1024 / 1024).toFixed(1)} MB` : "missing";
        console.log(
          `[${task.index}/${task.total}] ${task.slug}: Needs upload (${oldMb} -> ${task.localSizeMb} MB) [${task.localFile}]`
        );
      }
    }

    console.log("\n--- DRY RUN SUMMARY ---");
    console.log(`Already up to date : ${upToDateCount}`);
    console.log(`Needs upload       : ${toUploadCount}`);
    console.log("\nRe-run without --dry-run to execute live upload.");
    return;
  }

  // Live Execution with Resume & Retry
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const task of tasks) {
    const existing = release.assets.find((a) => a.name === task.assetName);

    // 1. Check if already uploaded and identical in size
    if (existing && existing.size === task.localSize) {
      console.log(
        `[${task.index}/${task.total}] ${task.slug} (${task.localSizeMb} MB) -> Already up to date on GitHub. Syncing DB...`
      );
      await prisma.districtRate.update({
        where: { id: task.rateId },
        data: {
          pdfUrl: existing.browser_download_url,
          pdfSize: task.localSize,
        },
      });
      skipped++;
      continue;
    }

    console.log(
      `\n[${task.index}/${task.total}] Processing ${task.slug} (${task.districtName})...`
    );
    console.log(`  File: ${task.localFile} (${task.localSizeMb} MB)`);

    // 2. Delete old asset if exists
    let existingAsset = release.assets.find((a) => a.name === task.assetName);
    if (existingAsset) {
      console.log(
        `  Deleting old asset (ID: ${existingAsset.id}, ${(existingAsset.size / 1024 / 1024).toFixed(1)} MB)...`
      );
      await deleteAsset(existingAsset.id);
      console.log("  Old asset deletion completed.");
      release.assets = release.assets.filter((a) => a.id !== existingAsset!.id);
    }

    // 3. Upload with retry up to 4 times
    let success = false;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log(`  Uploading ${task.assetName} (attempt ${attempt}/4)...`);
        const startTime = Date.now();
        const buffer = fs.readFileSync(task.localPath);

        const newAsset = await uploadAsset(release.upload_url, task.assetName, buffer);
        const elapsedSec = (Date.now() - startTime) / 1000;
        const speedMb = (task.localSize / (1024 * 1024) / elapsedSec).toFixed(2);

        console.log(
          `  Upload complete in ${elapsedSec.toFixed(1)}s (${speedMb} MB/s).`
        );
        console.log(`  Download URL: ${newAsset.browser_download_url}`);

        // 4. Update Database
        await prisma.districtRate.update({
          where: { id: task.rateId },
          data: {
            pdfUrl: newAsset.browser_download_url,
            pdfSize: task.localSize,
          },
        });
        console.log("  Database updated successfully.");

        release.assets.push(newAsset);

        uploaded++;
        success = true;
        break;
      } catch (err) {
        const errMsg = (err as Error).message;
        console.error(`  Attempt ${attempt} failed: ${errMsg}`);

        // If asset already exists on GitHub, re-fetch release and delete it before retrying
        if (errMsg.includes("already_exists")) {
          console.log("  Asset conflict detected. Fetching fresh release to delete conflict...");
          try {
            const freshRelease = await getRelease();
            const conflict = freshRelease.assets.find((a) => a.name === task.assetName);
            if (conflict) {
              await deleteAsset(conflict.id);
              console.log(`  Conflict asset ${conflict.id} deleted.`);
            }
          } catch (delErr) {
            console.warn(`  Failed to resolve conflict: ${(delErr as Error).message}`);
          }
        }

        if (attempt < 4) {
          const waitSec = attempt * 5;
          console.log(`  Retrying in ${waitSec} seconds...`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
        }
      }
    }

    if (!success) {
      console.error(`  CRITICAL: Failed to upload ${task.slug} after 3 attempts.`);
      failed++;
    }
  }

  console.log("\n=================================================");
  console.log("Sync Complete!");
  console.log(`Total Rates : ${tasks.length}`);
  console.log(`Uploaded    : ${uploaded}`);
  console.log(`Skipped     : ${skipped} (already up to date)`);
  console.log(`Failed      : ${failed}`);
  console.log("=================================================");
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
