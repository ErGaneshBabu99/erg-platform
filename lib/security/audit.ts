import { Prisma } from "@prisma/client";
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
    await prisma.auditLog.create({
  data: {
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId,
    details: data.details as Prisma.InputJsonValue | undefined,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    userId: data.userId ?? null,
  },
});
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
