import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") ?? "download.pdf";

  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });

  const response = await fetch(url);
  const blob = await response.arrayBuffer();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}