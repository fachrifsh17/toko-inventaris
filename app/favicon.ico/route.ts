import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pengaturan = await prisma.pengaturan.findFirst({
      select: { url_logo: true },
    });

    // Jika URL logo tidak ada, kembalikan response kosong
    if (!pengaturan?.url_logo) {
      return new NextResponse(null, { status: 204 });
    }

    // Redirect langsung ke URL publik Supabase
    // Ini jauh lebih efisien daripada membaca file secara manual
    return NextResponse.redirect(pengaturan.url_logo);
    
  } catch (error) {
    console.error("Error favicon:", error);
    return new NextResponse(null, { status: 204 });
  }
}