"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRekapData(
  type?: "masuk" | "keluar",
  namaKategori?: string,
  startDate?: Date,
  endDate?: Date,
  page: number = 1,
  limit: number = 10,
  metodePembayaran?: string,
) {
  try {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (type) {
      where.jenis_stok = type.toUpperCase();
    }

    if (metodePembayaran) {
      where.metode_pembayaran = metodePembayaran;
    }

    if (startDate && endDate) {
      where.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.tanggal = { gte: startDate };
    } else if (endDate) {
      where.tanggal = { lte: endDate };
    }

    if (namaKategori) {
      where.detail_transaksi = {
        some: {
          produk: {
            kategori: {
              nama_kategori: {
                contains: namaKategori,
                mode: "insensitive",
              },
            },
          },
        },
      };
    }

    const [transaksiList, total] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        skip,
        take: limit,
        include: {
          users: true,
          detail_transaksi: {
            include: {
              produk: {
                include: {
                  kategori: true,
                },
              },
            },
          },
        },
        orderBy: {
          tanggal: "desc",
        },
      }),
      prisma.transaksi.count({ where }),
    ]);

    const data = transaksiList.map((t) => {
      const total_harga_modal = t.detail_transaksi.reduce(
        (sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0),
        0,
      );
      const total_harga_jual = t.detail_transaksi.reduce(
        (sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0),
        0,
      );
      const total_item = t.detail_transaksi.reduce(
        (sum, item) => sum + (item.jumlah || 0),
        0,
      );

      return {
        ...t,
        total_harga_modal,
        total_harga_jual,
        total_item,
      };
    });

    return { data, total, page, limit };
  } catch (error) {
    console.error("Error fetching rekap data:", error);
    return { data: [], total: 0, page, limit };
  }
}

export async function getRekapDetail(id: number) {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        users: true,
        detail_transaksi: {
          include: {
            produk: {
              include: {
                kategori: true,
              },
            },
          },
        },
      },
    });

    if (!transaksi) return null;

    const total_harga_modal = transaksi.detail_transaksi.reduce(
      (sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0),
      0,
    );
    const total_harga_jual = transaksi.detail_transaksi.reduce(
      (sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0),
      0,
    );
    const total_item = transaksi.detail_transaksi.reduce(
      (sum, item) => sum + (item.jumlah || 0),
      0,
    );

    return {
      ...transaksi,
      total_harga_modal,
      total_harga_jual,
      total_item,
    };
  } catch (error) {
    console.error("Error fetching rekap detail:", error);
    return null;
  }
}

export async function updateRekap(id: number, formData: FormData) {
  try {
    const keterangan = formData.get("keterangan") as string;
    const tanggal = new Date(formData.get("tanggal") as string);
    const jenis_stok = formData.get("jenis_stok") as string;
    const metode_pembayaran =
      (formData.get("metode_pembayaran") as string) || "CASH";

    await prisma.transaksi.update({
      where: { id },
      data: {
        jenis_stok: jenis_stok.toUpperCase(),
        metode_pembayaran,
        keterangan,
        tanggal,
      },
    });

    revalidatePath("/rekap");
    return { success: true };
  } catch (error) {
    console.error("Error updating rekap:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function exportRekapIndividual(id: number) {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        users: true,
        detail_transaksi: {
          include: {
            produk: {
              include: {
                kategori: true,
              },
            },
          },
        },
      },
    });

    if (!transaksi) {
      return { success: false, error: "Rekap entry not found." };
    }

    const total_harga_modal = transaksi.detail_transaksi.reduce(
      (sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0),
      0,
    );
    const total_harga_jual = transaksi.detail_transaksi.reduce(
      (sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0),
      0,
    );
    const total_item = transaksi.detail_transaksi.reduce(
      (sum, item) => sum + (item.jumlah || 0),
      0,
    );

    return {
      success: true,
      data: {
        ...transaksi,
        total_harga_modal,
        total_harga_jual,
        total_item,
      },
    };
  } catch (error) {
    console.error("Error exporting individual rekap:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function exportRekapFiltered(
  type?: "masuk" | "keluar",
  namaKategori?: string,
  startDate?: Date,
  endDate?: Date,
  metodePembayaran?: string,
) {
  try {
    const where: any = {};

    if (type) {
      where.jenis_stok = type.toUpperCase();
    }

    if (metodePembayaran) {
      where.metode_pembayaran = metodePembayaran;
    }

    if (startDate && endDate) {
      where.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.tanggal = { gte: startDate };
    } else if (endDate) {
      where.tanggal = { lte: endDate };
    }

    if (namaKategori) {
      where.detail_transaksi = {
        some: {
          produk: {
            kategori: {
              nama_kategori: {
                contains: namaKategori,
                mode: "insensitive",
              },
            },
          },
        },
      };
    }

    const transaksiList = await prisma.transaksi.findMany({
      where,
      include: {
        users: true,
        detail_transaksi: {
          include: {
            produk: {
              include: {
                kategori: true,
              },
            },
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    const data = transaksiList.map((t) => {
      const total_harga_modal = t.detail_transaksi.reduce(
        (sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0),
        0,
      );
      const total_harga_jual = t.detail_transaksi.reduce(
        (sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0),
        0,
      );
      const total_item = t.detail_transaksi.reduce(
        (sum, item) => sum + (item.jumlah || 0),
        0,
      );

      return {
        ...t,
        total_harga_modal,
        total_harga_jual,
        total_item,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error exporting filtered rekap:", error);
    return { success: false, error: (error as Error).message };
  }
}