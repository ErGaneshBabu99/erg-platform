import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber, formatDate } from "@/lib/utils";
import { Plus, Edit, Eye, Trash2, Download } from "lucide-react";

export const metadata: Metadata = { title: "District Rates – Er G Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDistrictRatesPage() {
  const rates = await prisma.districtRate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      district: { include: { province: { select: { name: true } } } },
      fiscalYear: { select: { year: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">District Rates</h1>
          <p className="text-gray-500 mt-1">{rates.length} total records</p>
        </div>
        <Link href="/admin/district-rates/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Add District Rate
          </Button>
        </Link>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">District</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Province</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">FY</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Downloads</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Published</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {rates.map((rate: any) => (
                <tr key={rate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {rate.district.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{rate.district.province.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="navy">{rate.fiscalYear.year}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      rate.status === "PUBLISHED" ? "green"
                      : rate.status === "DRAFT" ? "gray"
                      : "red"
                    }>
                      {rate.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    <span className="flex items-center justify-end gap-1">
                      <Download className="w-3.5 h-3.5" />
                      {formatNumber(rate.downloadCount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {rate.publishedAt ? formatDate(rate.publishedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {rate.status === "PUBLISHED" && (
                        <Link
                          href={`/district-rate/${rate.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-navy-600 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-900/30 transition-colors"
                          title="View page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/district-rates/${rate.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-navy-600 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-900/30 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rates.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="mb-3">No district rates yet.</p>
              <Link href="/admin/district-rates/new">
                <Button size="sm">Add First District Rate</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
