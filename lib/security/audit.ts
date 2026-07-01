import { prisma } from "@/lib/prisma";

interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({ data });
  } catch (error) {
    // Audit log failure should never break the application
    console.error("Failed to create audit log:", error);
  }
}

export async function getRecentAuditLogs(limit = 50) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
  });
}
