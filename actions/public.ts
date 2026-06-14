"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const fetchPengaturan = unstable_cache(
  async () => {
    return prisma.pengaturan.findFirst();
  },
  ["public-home-pengaturan"],
  { revalidate: 3600 }
);

export async function getPengaturan() {
  try {
    return await fetchPengaturan();
  } catch (error) {
    console.error("Error getPengaturan:", error);
    return null;
  }
}

const fetchBanners = unstable_cache(
  async () => {
    return prisma.banners.findMany({
      where: { is_active: true },
      orderBy: { urutan: "asc" }
    });
  },
  ["public-home-banners"],
  { revalidate: 3600 }
);

export async function getBanners() {
  try {
    return await fetchBanners();
  } catch (error) {
    console.error("Error getBanners:", error);
    return [];
  }
}

const fetchKategoriList = unstable_cache(
  async () => {
    return prisma.kategori.findMany({
      where: { is_active: true },
      orderBy: { nama_kategori: "asc" }
    });
  },
  ["public-home-kategori-list"],
  { revalidate: 3600 }
);

export async function getKategoriList() {
  try {
    return await fetchKategoriList();
  } catch (error) {
    console.error("Error getKategoriList:", error);
    return [];
  }
}

const fetchProduk = unstable_cache(
  async () => {
    return prisma.produk.findMany({
      where: { is_active: true },
      take: 4,
      orderBy: { id: "desc" },
      include: {
        kategori: {
          select: {
            nama_kategori: true,
            slug: true
          }
        }
      }
    });
  },
  ["public-home-produk"],
  { revalidate: 3600 }
);

export async function getProduk() {
  try {
    return await fetchProduk();
  } catch (error) {
    console.error("Error getProduk:", error);
    return [];
  }
}

const fetchHomeData = unstable_cache(
  async () => {
    const [pengaturan, banners, produk] = await Promise.all([
      prisma.pengaturan.findFirst(),
      prisma.banners.findMany({
        where: { is_active: true },
        orderBy: { urutan: "asc" }
      }),
      prisma.produk.findMany({
        where: { is_active: true },
        take: 4,
        orderBy: { id: "desc" },
        include: {
          kategori: {
            select: {
              nama_kategori: true,
              slug: true
            }
          }
        }
      })
    ]);
    return { pengaturan, banners, produk };
  },
  ["public-home-data"],
  { revalidate: 3600 }
);

export async function getHomeData() {
  try {
    return await fetchHomeData();
  } catch (error) {
    console.error("Error getHomeData:", error);
    return { pengaturan: null, banners: [], produk: [] };
  }
}