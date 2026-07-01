import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateDistrictRateSchema } from "@/lib/validations/district-rate";
import { createAuditLog } from "@/lib/security/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !ALLOWED_ROLES.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateDistrictRateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const existing = await prisma.districtRate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: any = { ...parsed.data };

    // Handle status change → set publishedAt
    if (parsed.data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    const rate = await prisma.districtRate.update({ where: { id }, data: updateData });

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE_DISTRICT_RATE",
      resource: "district_rate",
      resourceId: id,
      details: parsed.data,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ success: true, rate });
  } catch (error) {
    console.error("Update district rate error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.districtRate.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE_DISTRICT_RATE",
      resource: "district_rate",
      resourceId: id,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
