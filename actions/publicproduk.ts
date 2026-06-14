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
}

export async function getProdukPublic(kategoriSlug?: string, page: number = 1, limit: number = 8) {
  try {
    const where: any = { is_active: true };

    if (kategoriSlug && kategoriSlug !== "semua") {
      where.kategori = { slug: kategoriSlug };
    }

    const skip = (page - 1) * limit;

    const data = await prisma.produk.findMany({
      where,
      select: {
        id: true,
        nama_produk: true,
        harga_jual: true,
        url_foto: true,
        kategori: {
          select: {
            nama_kategori: true,
            slug: true,
          }
        }
      },
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
      select: {
        id: true,
        nama_produk: true,
        deskripsi: true,
        harga_jual: true,
        harga_modal: true,
        stok_sekarang: true,
        url_foto: true,
        kategori: {
          select: {
            nama_kategori: true,
            slug: true,
          }
        }
      }
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
      select: {
        id: true,
        nama_produk: true,
        harga_jual: true,
        url_foto: true,
        kategori: {
          select: {
            nama_kategori: true,
            slug: true,
          }
        }
      },
      orderBy: { created_at: "desc" },
      take: limit
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProdukPageData(kategoriSlug?: string, page: number = 1, limit: number = 8) {
  try {
    const whereProduk: any = { is_active: true };

    if (kategoriSlug && kategoriSlug !== "semua") {
      whereProduk.kategori = { slug: kategoriSlug };
    }

    const skip = (page - 1) * limit;

    const [produk, kategori] = await Promise.all([
      prisma.produk.findMany({
        where: whereProduk,
        select: {
          id: true,
          nama_produk: true,
          harga_jual: true,
          url_foto: true,
          kategori: {
            select: {
              nama_kategori: true,
              slug: true,
            }
          }
        },
        orderBy: { created_at: "desc" },
        skip: skip,
        take: limit
      }),
      prisma.kategori.findMany({
        where: { is_active: true },
        orderBy: { nama_kategori: "asc" },
        select: {
          id: true,
          nama_kategori: true,
          slug: true,
        }
      })
    ]);

    return { produk, kategori };
  } catch (error) {
    console.error(error);
    return { produk: [], kategori: [] };
  }
}
export async function getProdukDetailData(slug: string) {
  try {
    const [pengaturan, produk] = await Promise.all([
      prisma.pengaturan.findFirst({
        select: {
          nama_toko: true,
          no_wa_toko: true,
        }
      }),
      prisma.produk.findFirst({
        where: { id: Number(slug), is_active: true },
        select: {
          id: true,
          nama_produk: true,
          deskripsi: true,
          harga_jual: true,
          stok_sekarang: true,
          url_foto: true,
          kategori: {
            select: {
              nama_kategori: true,
              slug: true,
            }
          }
        }
      })
    ]);
    return { pengaturan, produk };
  } catch (error) {
    console.error(error);
    return { pengaturan: null, produk: null };
  }
}