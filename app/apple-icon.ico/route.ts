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

    // 1. Ambil data gambar dari Supabase
    const response = await fetch(pengaturan.url_logo);
    const imageBuffer = await response.arrayBuffer();

    // 2. Kirim gambar langsung sebagai response, BUKAN redirect
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg", // Atau image/png sesuai file kamu
        "Cache-Control": "public, max-age=86400", // Agar loading cepat
      },
    });
    
  } catch (error) {
    console.error("Error fetching favicon:", error);
    return new NextResponse(null, { status: 500 });
  }
}