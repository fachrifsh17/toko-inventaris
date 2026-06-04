"use server";

import { prisma } from "@/lib/prisma";

export async function getProdukPublic(kategoriSlug?: string) {
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

    const data = await prisma.produk.findMany({
      where,
      include: { kategori: true },
      orderBy: { created_at: "desc" }
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