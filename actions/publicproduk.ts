"use server";

import { prisma } from "@/lib/prisma";

export async function getPengaturan() {
  try {
    const data = await prisma.pengaturan.findFirst({
      select: {
        nama_toko: true,
        no_wa_toko: true,
      }
    });
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getKategoriList() {
  try {
    const data = await prisma.kategori.findMany({
     
      orderBy: { nama_kategori: "asc" },
      select: {
        id: true,
        nama_kategori: true,
        slug: true,
      }
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProdukPublic(kategoriSlug?: string, page: number = 1, limit: number = 8) {
  try {
    const where: any = { is_active: true };

    if (kategoriSlug && kategoriSlug !== "semua") {
      const kategori = await prisma.kategori.findUnique({
        where: { slug: kategoriSlug }
      });
      if (kategori) {
        where.kategori_id = kategori.id;
      }
    }

    const skip = (page - 1) * limit;

    const data = await prisma.produk.findMany({
      where,
      include: { kategori: true },
      orderBy: { created_at: "desc" },
      skip: skip,
      take: limit
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProdukBySlug(slug: string) {
  try {
    const data = await prisma.produk.findFirst({
      where: { id: Number(slug), is_active: true },
      include: { kategori: true }
    });
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getProdukTerbaru(limit: number = 8) {
  try {
    const data = await prisma.produk.findMany({
      where: { is_active: true },
      include: { kategori: true },
      orderBy: { created_at: "desc" },
      take: limit
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}