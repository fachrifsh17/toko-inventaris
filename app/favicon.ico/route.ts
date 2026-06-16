import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pengaturan = await prisma.pengaturan.findFirst({
      select: { url_logo: true },
    });

    if (!pengaturan?.url_logo) {
      return new NextResponse(null, { status: 404 });
    }

    const url = pengaturan.url_logo;
    let targetUrl: URL;

    if (url.startsWith("http://") || url.startsWith("https://")) {
      targetUrl = new URL(url);
    } else {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      targetUrl = new URL(url, baseUrl);
    }

    return NextResponse.redirect(targetUrl, {
      status: 307, 
    });
  } catch (error) {
    console.error("Error favicon redirect:", error);
    return new NextResponse(null, { status: 404 });
  }
}