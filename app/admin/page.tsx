import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminStats } from "@/components/admin/stats";
import { RecentActivity } from "@/components/admin/recent-activity";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard – Er G Admin" };
export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [
    totalRates,
    publishedRates,
    totalDownloads,
    totalInquiries,
    recentDownloads,
    recentInquiries,
  ] = await Promise.all([
    prisma.districtRate.count(),
    prisma.districtRate.count({ where: { status: "PUBLISHED" } }),
    prisma.districtRate.aggregate({ _sum: { downloadCount: true } }),
    prisma.contactInquiry.count({ where: { status: "NEW" } }),
    prisma.download.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        districtRate: {
          include: { district: { select: { name: true } }, fiscalYear: { select: { year: true } } },
        },
      },
    }),
    prisma.contactInquiry.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    totalRates,
    publishedRates,
    totalDownloads: totalDownloads._sum.downloadCount ?? 0,
    totalInquiries,
    recentDownloads,
    recentInquiries,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to Er G admin panel</p>
      </div>

      <AdminStats
        stats={[
          { label: "Total District Rates", value: formatNumber(data.totalRates), change: "all time" },
          { label: "Published", value: formatNumber(data.publishedRates), change: "live" },
          { label: "Total Downloads", value: formatNumber(data.totalDownloads), change: "all time" },
          { label: "New Inquiries", value: formatNumber(data.totalInquiries), change: "unread", urgent: data.totalInquiries > 0 },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity
          title="Recent Downloads"
          items={data.recentDownloads.map((d: any) => ({
            id: d.id,
            label: `${d.districtRate.district.name} – ${d.districtRate.fiscalYear.year}`,
            meta: d.ipAddress ?? "Unknown",
            time: d.createdAt,
          }))}
        />
        <RecentActivity
          title="New Inquiries"
          items={data.recentInquiries.map((i: any) => ({
            id: i.id,
            label: i.name,
            meta: i.subject,
            time: i.createdAt,
            href: `/admin/inquiries/${i.id}`,
          }))}
          emptyText="No new inquiries"
        />
      </div>
    </div>
  );
}
