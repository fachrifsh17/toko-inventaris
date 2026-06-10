import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    // Baca langsung dari direktori fisik aplikasi
    const filePath = path.join(process.cwd(), "public", logoPath);

    if (!fs.existsSync(filePath)) {
      return new NextResponse(null, { status: 204 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Deteksi tipe konten (opsional, tapi disarankan)
    const ext = path.extname(logoPath).toLowerCase();
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error apple-icon:", error);
    return new NextResponse(null, { status: 204 });
  }
}