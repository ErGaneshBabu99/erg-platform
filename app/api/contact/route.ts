import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contact";
import { apiRateLimit } from "@/lib/security/rate-limit";
import { createAuditLog } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  // Rate limit
  const limitResult = apiRateLimit(req);
  if (limitResult) return limitResult;

  try {
    const body = await req.json();

    // Validate
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { honeypot, ...data } = parsed.data;

    // Bot detection
    if (honeypot) {
      return NextResponse.json({ success: true }); // Fake success
    }

    // Sanitize email
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim(),
        type: data.type,
        districtRateId: data.districtRateId ?? null,
      },
    });

    await createAuditLog({
      action: "CREATE_CONTACT_INQUIRY",
      resource: "contact_inquiry",
      resourceId: inquiry.id,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    });

    // TODO: Send email notification via Resend
    // await sendContactNotification(inquiry);

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
