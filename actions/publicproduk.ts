"use server";

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

const fetchPengaturan = unstable_cache(
  async () => {
    return prisma.pengaturan.findFirst({
      select: {
        nama_toko: true,
        no_wa_toko: true,
      }
    });
  },
  ["public-produk-pengaturan"],
  { revalidate: 3600 }
);

export async function getPengaturan() {
  try {
    return await fetchPengaturan();
  } catch (error) {
    console.error(error);
    return null;
  }
}

const fetchKategoriList = unstable_cache(
  async () => {
    const data = await prisma.kategori.findMany({
      where: { is_active: true },
      orderBy: { nama_kategori: "asc" },
      select: {
        id: true,
        nama_kategori: true,
        slug: true,
        _count: {
          select: {
            produk: {
              where: { is_active: true }
            }
          }
        }
      }
    });
    return data.map(k => ({
      id: k.id,
      nama_kategori: k.nama_kategori,
      slug: k.slug,
      count: k._count.produk
    }));
  },
  ["public-produk-kategori-list"],
  { revalidate: 3600 }
);

export async function getKategoriList() {
  try {
    return await fetchKategoriList();
  } catch (error) {
    console.error(error);
    return [];
  }
}

const fetchProdukCount = unstable_cache(
  async () => {
    return prisma.produk.count({
      where: { is_active: true }
    });
  },
  ["public-produk-count"],
  { revalidate: 3600 }
);

export async function getProdukCount() {
  try {
    return await fetchProdukCount();
  } catch (error) {
    console.error(error);
    return 0;
  }
}

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

const fetchProdukBySlug = unstable_cache(
  async (slug: string) => {
    const idNum = Number(slug);
    if (isNaN(idNum)) return null;
    const data = await prisma.produk.findUnique({
      where: { id: idNum },
      include: { kategori: true }
    });
    if (data && data.is_active) {
      return data;
    }
    return null;
  },
  ["public-produk-by-slug"],
  { revalidate: 3600 }
);

export async function getProdukBySlug(slug: string) {
  try {
    return await fetchProdukBySlug(slug);
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