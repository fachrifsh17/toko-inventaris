"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { cookies } from "next/headers";

function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const getCachedKategori = unstable_cache(
  async () => {
    return prisma.kategori.findMany({
      include: { _count: { select: { produk: true } } },
      orderBy: { nama_kategori: "asc" },
    });
  },
  ["kategori"],
);

export async function getKategori() {
  try {
    const data = await getCachedKategori();
    return { success: true, data };
  } catch (error) {
    console.error("Error getKategori:", error);
    return { success: false, error: "Gagal mengambil data kategori.", data: [] };
  }
}

export async function addKategoriAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const nama_kategori = (formData.get("nama_kategori") as string)?.trim();
    const slugInput = (formData.get("slug") as string)?.trim();
    
    const is_active = (formData.get("is_active") === "on" || formData.get("is_active") === "true" || formData.get("is_active") === "1");

    if (!nama_kategori) return { success: false, error: "Nama kategori wajib diisi!" };

    const slug = slugInput ? generateSlug(slugInput) : generateSlug(nama_kategori);
    if (!slug) return { success: false, error: "Slug tidak valid." };

    const existingName = await prisma.kategori.findUnique({ where: { nama_kategori } });
    if (existingName) return { success: false, error: "Nama kategori sudah digunakan!" };

    const existingSlug = await prisma.kategori.findUnique({ where: { slug } });
    if (existingSlug) return { success: false, error: `Slug "${slug}" sudah digunakan!` };

    await prisma.kategori.create({ data: { nama_kategori, slug, is_active } });

    revalidatePath("/produk");
    return { success: true, message: "Kategori berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error addKategoriAction:", error);
    return { success: false, error: "Gagal menambahkan kategori." };
  }
}

export async function editKategoriAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) return { success: false, error: "ID tidak valid." };

    const nama_kategori = (formData.get("nama_kategori") as string)?.trim();
    const slugInput = (formData.get("slug") as string)?.trim();
    
    const is_active = (formData.get("is_active") === "on" || formData.get("is_active") === "true" || formData.get("is_active") === "1");

    if (!nama_kategori) return { success: false, error: "Nama kategori wajib diisi!" };

    const slug = slugInput ? generateSlug(slugInput) : generateSlug(nama_kategori);
    if (!slug) return { success: false, error: "Slug tidak valid." };

    const existing = await prisma.kategori.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Kategori tidak ditemukan." };

    if (nama_kategori !== existing.nama_kategori) {
      const dupName = await prisma.kategori.findUnique({ where: { nama_kategori } });
      if (dupName) return { success: false, error: "Nama kategori sudah digunakan!" };
    }

    if (slug !== existing.slug) {
      const dupSlug = await prisma.kategori.findUnique({ where: { slug } });
      if (dupSlug) return { success: false, error: `Slug "${slug}" sudah digunakan!` };
    }

    await prisma.kategori.update({
      where: { id },
      data: { nama_kategori, slug, is_active, updated_at: new Date() },
    });

    revalidatePath("/produk");
    return { success: true, message: "Kategori berhasil diperbarui!" };
  } catch (error) {
    console.error("Error editKategoriAction:", error);
    return { success: false, error: "Gagal memperbarui kategori." };
  }
}

export async function deleteKategoriAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) return { success: false, error: "ID tidak valid." };

    const count = await prisma.produk.count({ where: { kategori_id: id } });
    if (count > 0) {
      return {
        success: false,
        error: `Tidak bisa dihapus — ada ${count} produk yang menggunakan kategori ini.`,
      };
    }

    await prisma.kategori.delete({ where: { id } });
    revalidatePath("/produk");
    return { success: true, message: "Kategori berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteKategoriAction:", error);
    return { success: false, error: "Gagal menghapus kategori." };
  }
}