import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file yang dikirim" },
        { status: 400 },
      );
    }

    // Validasi tipe file (hanya gambar)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "File harus berupa gambar (JPG, PNG, GIF, WebP)",
        },
        { status: 400 },
      );
    }

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal 5MB" },
        { status: 400 },
      );
    }

    // Generate nama file unik
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${timestamp}-${random}.${ext}`;

    // Path untuk menyimpan file
    const uploadsDir = join(process.cwd(), "public", "uploads");
    const filepath = join(uploadsDir, filename);

    // Buat folder jika belum ada
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Folder sudah ada atau error lain
    }

    // Convert file ke buffer dan simpan
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return path untuk disimpan ke database
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      message: "File berhasil diupload",
    });
  } catch (error) {
    console.error("Error upload:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupload file" },
      { status: 500 },
    );
  }
}
