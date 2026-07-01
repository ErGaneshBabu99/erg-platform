import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDistrictRateSchema } from "@/lib/validations/district-rate";
import { createAuditLog } from "@/lib/security/audit";
import { generateDistrictRateSlug } from "@/lib/utils";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !ALLOWED_ROLES.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createDistrictRateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { districtId, fiscalYearId, status, ...rest } = parsed.data;

    // Get district and fiscal year for slug generation
    const [district, fiscalYear] = await Promise.all([
      prisma.district.findUnique({ where: { id: districtId }, select: { slug: true, name: true } }),
      prisma.fiscalYear.findUnique({ where: { id: fiscalYearId }, select: { year: true } }),
    ]);

    if (!district || !fiscalYear) {
      return NextResponse.json({ error: "District or fiscal year not found" }, { status: 404 });
    }

    const slug = generateDistrictRateSlug(district.slug, fiscalYear.year);

    const rate = await prisma.districtRate.create({
      data: {
        districtId,
        fiscalYearId,
        slug,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        uploadedBy: session.user.id,
        ...rest,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE_DISTRICT_RATE",
      resource: "district_rate",
      resourceId: rate.id,
      details: { district: district.name, fiscalYear: fiscalYear.year, status },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ success: true, rate }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A district rate for this district and fiscal year already exists" },
        { status: 409 }
      );
    }
    console.error("Create district rate error:", error);
    return NextResponse.json({ error: "Failed to create district rate" }, { status: 500 });
  }
}
