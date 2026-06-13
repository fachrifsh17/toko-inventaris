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

    // Pastikan URL valid dengan mengubahnya menjadi objek URL
    const targetUrl = new URL(pengaturan.url_logo);
    
    return NextResponse.redirect(targetUrl);
    
  } catch (error) {
    console.error("Error favicon redirect:", error);
    // Kembalikan status 404 jika URL tidak valid agar tidak spam error
    return new NextResponse(null, { status: 404 });
  }
}