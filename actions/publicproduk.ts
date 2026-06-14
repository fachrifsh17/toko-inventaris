"use server";

import { cache } from "react"
import { prisma } from "@/lib/prisma"

export const getPengaturan = cache(async () => {
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
})

export const getKategoriList = cache(async () => {
  try {
    const data = await prisma.kategori.findMany({
      where: { is_active: true },
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
})

export async function getProdukPublic(kategoriSlug?: string, cursor?: string, limit: number = 8) {
  try {
    const where: any = { is_active: true };

    if (kategoriSlug && kategoriSlug !== "semua") {
      const kategori = await prisma.kategori.findUnique({
        where: { slug: kategoriSlug },
        select: { id: true }
      });
      if (kategori) {
        where.kategori_id = kategori.id;
      }
    }

    if (cursor) {
      where.id = { lt: Number(cursor) };
    }

    const data = await prisma.produk.findMany({
      where,
      include: { kategori: true },
      orderBy: { id: "desc" },
      take: limit + 1
    });

    let hasMore = false;
    if (data.length > limit) {
      hasMore = true;
      data.pop();
    }

    const nextCursor = hasMore && data.length > 0 ? String(data[data.length - 1].id) : null;

    return { data, hasMore, nextCursor };
  } catch (error) {
    console.error(error);
    return { data: [], hasMore: false, nextCursor: null };
  }
}

export const getProdukBySlug = cache(async (slug: string) => {
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
})

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