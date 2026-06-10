import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pengaturan = await prisma.pengaturan.findFirst({
      select: { url_logo: true },
    });

    if (!pengaturan?.url_logo) {
      return new NextResponse(null, { status: 204 });
    }

    const logoPath = pengaturan.url_logo.startsWith("/")
      ? pengaturan.url_logo
      : `/${pengaturan.url_logo}`;

    const fullPath = `${process.env.NEXT_PUBLIC_BASE_URL || ""}${logoPath}`;

    const res = await fetch(fullPath);

    if (!res.ok) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error favicon:", error);
    return new NextResponse(null, { status: 204 });
  }
}