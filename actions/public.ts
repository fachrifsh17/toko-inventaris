"use server";

import { prisma } from "@/lib/prisma";

export async function getPengaturan() {
  try {
    const data = await prisma.pengaturan.findFirst();
    return data;
  } catch (error) {
    console.error("Error getPengaturan:", error);
    return null;
  }
}

export async function getBanners() {
  try {
    const data = await prisma.banners.findMany({
      where: { is_active: true },
      orderBy: { urutan: "asc" }
    });
    return data;
  } catch (error) {
    console.error("Error getBanners:", error);
    return [];
  }
}

export async function getKategoriList() {
  try {
    const data = await prisma.kategori.findMany({
      orderBy: { nama_kategori: "asc" }
    });
    return data;
  } catch (error) {
    console.error("Error getKategoriList:", error);
    return [];
  }
}

export async function getProduk() {
  try {
    const data = await prisma.produk.findMany({
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
    return data;
  } catch (error) {
    console.error("Error getProduk:", error);
    return [];
  }
}