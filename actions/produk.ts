"use server";

import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getProduk(opts?: {
  page?: number;
  pageSize?: number;
  kategori_id?: number;
}) {
  try {
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

export async function getKategori() {
  try {
    const kategori = await prisma.kategori.findMany({
      where: {
        is_active: true,
      },
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

export async function addProdukAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const nama_produk = (formData.get("nama_produk") as string)?.trim();
    const deskripsi = (formData.get("deskripsi") as string)?.trim() || null;
    const harga_jual = Number(formData.get("harga_jual"));
    const harga_modal = Number(formData.get("harga_modal"));
    const stok_sekarang = Number(formData.get("stok_sekarang") || 0);
    const kategori_id = formData.get("kategori_id")
      ? Number(formData.get("kategori_id"))
      : null;
    
    const url_foto_uploaded = (formData.get("url_foto_uploaded") as string)?.trim() || "";
    const raw_url_foto = formData.get("url_foto");
    let url_foto = url_foto_uploaded || "";

    if (!url_foto && raw_url_foto && (raw_url_foto as File).size > 0) {
      const file = raw_url_foto as File;
      const fileExt = file.name.split(".").pop();
      const fileName = `produk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("produk")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("produk")
        .getPublicUrl(fileName);

      url_foto = data.publicUrl;
    }

    const is_active = formData.get("is_active") === "1" || formData.get("is_active") === "true";

    if (!nama_produk) return { success: false, error: "Nama produk wajib diisi!" };
    if (isNaN(harga_jual) || harga_jual < 0) return { success: false, error: "Harga jual tidak valid!" };
    if (isNaN(harga_modal) || harga_modal < 0) return { success: false, error: "Harga modal tidak valid!" };
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

export async function editProdukAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) return { success: false, error: "ID tidak valid." };

    const nama_produk = (formData.get("nama_produk") as string)?.trim();
    const deskripsi = (formData.get("deskripsi") as string)?.trim() || null;
    const harga_jual = Number(formData.get("harga_jual"));
    const harga_modal = Number(formData.get("harga_modal"));
    const stok_sekarang = Number(formData.get("stok_sekarang") || 0);
    const kategori_id = formData.get("kategori_id") ? Number(formData.get("kategori_id")) : null;

    const existing = await prisma.produk.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Produk tidak ditemukan." };

    const url_foto_uploaded = (formData.get("url_foto_uploaded") as string)?.trim() || "";
    const raw_url_foto = formData.get("url_foto");
    
    let url_foto = existing.url_foto;

    if (url_foto_uploaded && url_foto_uploaded !== existing.url_foto) {
      url_foto = url_foto_uploaded;
    } else if (raw_url_foto && (raw_url_foto as File).size > 0) {
      const file = raw_url_foto as File;
      const fileExt = file.name.split(".").pop();
      const fileName = `produk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("produk")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("produk")
        .getPublicUrl(fileName);

      url_foto = data.publicUrl;
    }

    const is_active = formData.get("is_active") === "1" || formData.get("is_active") === "true";

    if (!nama_produk) return { success: false, error: "Nama produk wajib diisi!" };
    if (isNaN(harga_jual) || harga_jual < 0) return { success: false, error: "Harga jual tidak valid!" };
    if (isNaN(harga_modal) || harga_modal < 0) return { success: false, error: "Harga modal tidak valid!" };

    await prisma.produk.update({
      where: { id },
      data: {
        nama_produk,
        deskripsi,
        harga_jual,
        harga_modal,
        stok_sekarang,
        kategori_id,
        url_foto,
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

export async function deleteProdukAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) return { success: false, error: "ID tidak valid." };

    const existing = await prisma.produk.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Produk tidak ditemukan." };

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