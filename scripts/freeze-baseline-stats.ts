import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔒 Freezing baseline stats on deployment...");

  // 1. Ensure columns exist in Postgres
  await prisma.$executeRawUnsafe(`
    ALTER TABLE district_rates 
    ADD COLUMN IF NOT EXISTS "downloadCountAfter" INTEGER NOT NULL DEFAULT 0;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE district_rates 
    ADD COLUMN IF NOT EXISTS "viewCountAfter" INTEGER NOT NULL DEFAULT 0;
  `);

  // 2. Set stats_baseline_date in site_config
  const deployDate = "2026-10-06T00:00:00.000Z";
  await prisma.siteConfig.upsert({
    where: { key: "stats_baseline_date" },
    update: { value: deployDate, type: "string" },
    create: { key: "stats_baseline_date", value: deployDate, type: "string" },
  });

  // 3. Ensure downloadCountAfter and viewCountAfter are 0
  await prisma.$executeRawUnsafe(`
    UPDATE district_rates 
    SET "downloadCountAfter" = 0, "viewCountAfter" = 0 
    WHERE "downloadCountAfter" IS NULL OR "viewCountAfter" IS NULL;
  `);

  // 4. Report baseline totals
  const agg = await prisma.districtRate.aggregate({
    where: { status: "PUBLISHED" },
    _sum: { downloadCount: true, viewCount: true },
  });

  console.log("✅ Baseline stats frozen successfully!");
  console.log("Baseline deploy date:", deployDate);
  console.log("Frozen baseline downloads:", agg._sum.downloadCount ?? 0);
  console.log("Frozen baseline views:", agg._sum.viewCount ?? 0);
}

main()
  .catch((err) => {
    console.error("Error freezing baseline stats:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
