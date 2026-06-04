"use server";

import { prisma } from "@/lib/prisma";
import { getPengaturan } from "./pengaturan";

export async function getRekapPdfData(
  type?: "masuk" | "keluar",
  namaKategori?: string,
  startDate?: Date,
  endDate?: Date,
  metodePembayaran?: string,
) {
  try {
    const where: any = {};

    if (type) where.jenis_stok = type.toUpperCase();
    if (metodePembayaran) where.metode_pembayaran = metodePembayaran;

    if (startDate && endDate) {
      // Set end date to end of day to include all transactions on that day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.tanggal = { gte: start, lte: end };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.tanggal = { gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.tanggal = { lte: end };
    }

    if (namaKategori && namaKategori.trim() !== "") {
      where.detail_transaksi = {
        some: {
          produk: {
            kategori: {
              nama_kategori: { contains: namaKategori.trim() },
            },
          },
        },
      };
    }

    const [transaksiList, pengaturanRes] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        include: {
          users: true,
          detail_transaksi: {
            include: {
              produk: {
                include: { kategori: true },
              },
            },
          },
        },
        orderBy: { tanggal: "desc" },
      }),
      getPengaturan(),
    ]);

    const formattedData = transaksiList.map((t) => {
      const isKeluar = t.jenis_stok === "KELUAR";
      const isMasuk = t.jenis_stok === "MASUK";

      const total_harga_modal = isKeluar
        ? 0
        : t.detail_transaksi.reduce(
            (sum, item) =>
              sum + (item.harga_modal_real || 0) * (item.jumlah || 0),
            0,
          );

      const total_harga_jual = isMasuk
        ? 0
        : t.detail_transaksi.reduce(
            (sum, item) =>
              sum + (item.harga_jual_real || 0) * (item.jumlah || 0),
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

    return {
      success: true,
      data: formattedData,
      pengaturan: pengaturanRes.success ? pengaturanRes.data : null,
    };
  } catch (error) {
    console.error("Error in getRekapPdfData:", error);
    return { success: false, error: (error as Error).message };
  }
}
