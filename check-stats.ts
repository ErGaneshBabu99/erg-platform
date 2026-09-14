import { prisma } from "./lib/prisma";

async function main() {
  const agg = await prisma.districtRate.aggregate({
    where: { status: "PUBLISHED" },
    _sum: { downloadCount: true, viewCount: true },
  });

  const siteVisits = await prisma.siteConfig.findUnique({
    where: { key: "total_site_visits" },
  });

  console.log("Real downloadCount sum:", agg._sum.downloadCount ?? 0);
  console.log("Real viewCount sum:", agg._sum.viewCount ?? 0);
  console.log("siteVisits:", siteVisits?.value ?? 0);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());