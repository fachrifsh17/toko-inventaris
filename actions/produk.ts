"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

// ==================== GET ALL PRODUK ====================
export async function getProduk(opts?: {
  page?: number;
  pageSize?: number;
  kategori_id?: number;
}) {
  try {
    // If pagination is requested, return paged data with total count
    if (
      opts &&
      typeof opts.page === "number" &&
      typeof opts.pageSize === "number"
    ) {
      const where: any = {};
      if (opts.kategori_id) where.kategori_id = opts.kategori_id;

      const total = await prisma.produk.count({ where });
      const rows = await prisma.produk.findMany({
        where,
        include: { kategori: { select: { id: true, nama_kategori: true } } },
        orderBy: { created_at: "desc" },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      });

      return { success: true, data: { rows, total } };
    }

    // Fallback: return all products (existing behavior)
    const produk = await prisma.produk.findMany({
      include: { kategori: { select: { id: true, nama_kategori: true } } },
      orderBy: { created_at: "desc" },
    });
    return { success: true, data: produk };
  } catch (error) {
    console.error("Error getProduk:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Gagal mengambil data produk. ${msg}`,
      data: [],
    };
  }
}

// ==================== GET ALL KATEGORI (for select) ====================
export async function getKategori() {
  try {
    const kategori = await prisma.kategori.findMany({
      orderBy: { nama_kategori: "asc" },
    });
    return { success: true, data: kategori };
  } catch (error) {
    console.error("Error getKategori:", error);
    return {
      success: false,
      error: "Gagal mengambil data kategori.",
      data: [],
    };
  }
}

// ==================== ADD PRODUK ====================
export async function addProdukAction(prevState: any, formData: FormData) {
  try {
    const nama_produk = (formData.get("nama_produk") as string)?.trim();
    const deskripsi = (formData.get("deskripsi") as string)?.trim() || null;
    const harga_jual = Number(formData.get("harga_jual"));
    const harga_modal = Number(formData.get("harga_modal"));
    const stok_sekarang = Number(formData.get("stok_sekarang") || 0);
    const kategori_id = formData.get("kategori_id")
      ? Number(formData.get("kategori_id"))
      : null;
    // Prefer the uploaded URL (from the upload API) and fall back safely.
    const url_foto_uploaded =
      (formData.get("url_foto_uploaded") as string)?.trim() || "";
    const raw_url_foto = formData.get("url_foto");
    let url_foto = url_foto_uploaded || "";

    // If the client submitted a File in `url_foto` (user didn't use the upload API),
    // save it server-side into `public/uploads` and construct the URL.
    if (
      !url_foto &&
      raw_url_foto &&
      typeof (raw_url_foto as any).name === "string"
    ) {
      try {
        const file: any = raw_url_foto;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = path.extname(file.name) || ".jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.writeFile(path.join(uploadsDir, fileName), buffer);
        url_foto = `/uploads/${fileName}`;
      } catch (err) {
        console.error("Error saving uploaded file in addProdukAction:", err);
      }
    }
    const is_active = formData.get("is_active") === "true";

    if (!nama_produk)
      return { success: false, error: "Nama produk wajib diisi!" };
    if (isNaN(harga_jual) || harga_jual < 0)
      return { success: false, error: "Harga jual tidak valid!" };
    if (isNaN(harga_modal) || harga_modal < 0)
      return { success: false, error: "Harga modal tidak valid!" };
    if (!url_foto) return { success: false, error: "URL foto wajib diisi!" };

    await prisma.produk.create({
      data: {
        nama_produk,
        deskripsi,
        harga_jual,
        harga_modal,
        stok_sekarang,
        kategori_id,
        url_foto,
        is_active,
      },
    });

    revalidatePath("/produk");
    return { success: true, message: "Produk berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error addProdukAction:", error);
    return { success: false, error: "Gagal menambahkan produk." };
  }
}

// ==================== EDIT PRODUK ====================
export async function editProdukAction(prevState: any, formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0)
      return { success: false, error: "ID tidak valid." };

    const nama_produk = (formData.get("nama_produk") as string)?.trim();
    const deskripsi = (formData.get("deskripsi") as string)?.trim() || null;
    const harga_jual = Number(formData.get("harga_jual"));
    const harga_modal = Number(formData.get("harga_modal"));
    const stok_sekarang = Number(formData.get("stok_sekarang") || 0);
    const kategori_id = formData.get("kategori_id")
      ? Number(formData.get("kategori_id"))
      : null;
    const url_foto_uploaded =
      (formData.get("url_foto_uploaded") as string)?.trim() || "";
    const is_active = formData.get("is_active") === "true";

    if (!nama_produk)
      return { success: false, error: "Nama produk wajib diisi!" };
    if (isNaN(harga_jual) || harga_jual < 0)
      return { success: false, error: "Harga jual tidak valid!" };
    if (isNaN(harga_modal) || harga_modal < 0)
      return { success: false, error: "Harga modal tidak valid!" };

    const existing = await prisma.produk.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Produk tidak ditemukan." };

    await prisma.produk.update({
      where: { id },
      data: {
        nama_produk,
        deskripsi,
        harga_jual,
        harga_modal,
        stok_sekarang,
        kategori_id,
        url_foto: url_foto_uploaded || existing.url_foto,
        is_active,
        updated_at: new Date(),
      },
    });

    revalidatePath("/produk");
    return { success: true, message: "Produk berhasil diperbarui!" };
  } catch (error) {
    console.error("Error editProdukAction:", error);
    return { success: false, error: "Gagal memperbarui produk." };
  }
}

// ==================== DELETE PRODUK ====================
export async function deleteProdukAction(prevState: any, formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0)
      return { success: false, error: "ID tidak valid." };

    await prisma.produk.delete({ where: { id } });
    revalidatePath("/produk");
    return { success: true, message: "Produk berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteProdukAction:", error);
    return {
      success: false,
      error: "Gagal menghapus produk. Mungkin ada data stok yang terkait.",
    };
  }
}
