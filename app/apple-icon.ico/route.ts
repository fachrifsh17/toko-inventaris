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

    // Karena url_logo sekarang berisi URL publik dari Supabase (misal: https://xyz.supabase.co/...)
    // Kita cukup mengarahkan (redirect) ke URL tersebut
    return NextResponse.redirect(pengaturan.url_logo);
    
  } catch (error) {
    console.error("Error redirecting to logo:", error);
    return new NextResponse(null, { status: 204 });
  }
}