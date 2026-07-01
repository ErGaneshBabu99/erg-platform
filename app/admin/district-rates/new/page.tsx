import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DistrictRateForm } from "@/components/admin/district-rate-form";

export const metadata: Metadata = { title: "Add District Rate – Er G Admin" };

export default async function NewDistrictRatePage() {
  const [districts, fiscalYears] = await Promise.all([
    prisma.district.findMany({
      orderBy: { name: "asc" },
      include: { province: { select: { name: true } } },
    }),
    prisma.fiscalYear.findMany({ orderBy: { sortOrder: "desc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add District Rate</h1>
        <p className="text-gray-500 mt-1">Upload a new district rate PDF</p>
      </div>
      <DistrictRateForm districts={districts as any} fiscalYears={fiscalYears} />
    </div>
  );
}
