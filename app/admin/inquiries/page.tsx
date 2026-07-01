import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Inquiries – Er G Admin" };
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  WORD_FORMAT: "Word Format",
  EXCEL_FORMAT: "Excel Format",
  EDITABLE_FORMAT: "Editable",
  CUSTOM_REQUEST: "Custom",
};

export default async function InquiriesPage() {
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inquiries</h1>
        <Badge variant="gold">{inquiries.filter((i: any) => i.status === "NEW").length} new</Badge>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Subject</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {inquiries.map((inq: any) => (
                <tr key={inq.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{inq.name}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700 dark:text-gray-300">{inq.email}</div>
                    {inq.phone && <div className="text-xs text-gray-400">{inq.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="navy">{TYPE_LABELS[inq.type] ?? inq.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{inq.subject}</td>
                  <td className="px-4 py-3">
                    <Badge variant={inq.status === "NEW" ? "gold" : inq.status === "RESOLVED" ? "green" : "gray"}>
                      {inq.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(inq.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {inquiries.length === 0 && (
            <div className="text-center py-12 text-gray-400">No inquiries yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
