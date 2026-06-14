"use server";

import { prisma } from "@/lib/prisma";
import { getPengaturan } from "./pengaturan";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";

const getCachedRekapPdfData = unstable_cache(
  async (
    type?: string,
    namaKategori?: string,
    startDate?: string,
    endDate?: string,
    metodePembayaran?: string,
  ) => {
    const where: any = {};

    if (type) where.jenis_stok = type.toUpperCase();
    if (metodePembayaran) where.metode_pembayaran = metodePembayaran;

    if (startDate && endDate) {
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

    if (namaKategori && namaKategori.trim() !== "" && namaKategori.trim().toLowerCase() !== "semua") {
      where.detail_transaksi = {
        some: {
          produk: {
            kategori: {
              nama_kategori: { equals: namaKategori.trim() },
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

      const filteredDetails = namaKategori && namaKategori.trim() !== "" && namaKategori.trim().toLowerCase() !== "semua"
        ? t.detail_transaksi.filter((d) => d.produk?.kategori?.nama_kategori === namaKategori.trim())
        : t.detail_transaksi;

      const total_harga_modal = isKeluar
        ? 0
        : filteredDetails.reduce(
            (sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0),
            0,
          );

      const total_harga_jual = isMasuk
        ? 0
        : filteredDetails.reduce(
            (sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0),
            0,
          );

      const total_item = filteredDetails.reduce(
        (sum, item) => sum + (item.jumlah || 0),
        0,
      );

      const biaya_lain_lain = t.biaya_lain_lain ?? 0;

      const grand_total = isKeluar
        ? total_harga_jual + biaya_lain_lain
        : total_harga_modal;

      const total_bayar = t.total_bayar ?? 0;

      const isCredit = isKeluar && t.metode_pembayaran === "CREDIT";
      const sisa_kredit = isCredit ? Math.max(0, grand_total - total_bayar) : 0;

      const isLunas = isCredit && sisa_kredit === 0;

      return {
        ...t,
        detail_transaksi: filteredDetails,
        total_harga_modal,
        total_harga_jual,
        total_item,
        biaya_lain_lain,
        grand_total,
        total_bayar,
        sisa_kredit,
        isCredit,
        isLunas,
      };
    });

    return {
      data: formattedData,
      pengaturan: pengaturanRes.success ? pengaturanRes.data : null,
    };
  },
  ["rekap-pdf-data"]
);

export async function getRekapPdfData(
  type?: "masuk" | "keluar",
  namaKategori?: string,
  startDate?: Date,
  endDate?: Date,
  metodePembayaran?: string,
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const result = await getCachedRekapPdfData(
      type,
      namaKategori,
      startDate?.toISOString(),
      endDate?.toISOString(),
      metodePembayaran
    );

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}