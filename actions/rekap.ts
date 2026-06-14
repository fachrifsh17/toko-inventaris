"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { cookies } from "next/headers";

const getCachedRekapData = unstable_cache(
  async (
    type?: string,
    namaKategori?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 10,
    metodePembayaran?: string,
  ) => {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (type) where.jenis_stok = type.toUpperCase();
    if (metodePembayaran) where.metode_pembayaran = metodePembayaran;

    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.tanggal.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.tanggal.lte = end;
      }
    }

    if (namaKategori && namaKategori.trim() !== "" && namaKategori.trim().toLowerCase() !== "semua") {
      where.detail_transaksi = {
        some: {
          produk: {
            kategori: {
              is_active: true,
              nama_kategori: { equals: namaKategori.trim() },
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
            include: { produk: { include: { kategori: true } } },
          },
        },
        orderBy: { tanggal: "desc" },
      }),
      prisma.transaksi.count({ where }),
    ]);

    const data = transaksiList.map((t) => {
      const isKeluar = t.jenis_stok === "KELUAR";
      const isMasuk = t.jenis_stok === "MASUK";

      const total_harga_modal = isKeluar
        ? 0
        : t.detail_transaksi.reduce((sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0), 0);

      const total_harga_jual = isMasuk
        ? 0
        : t.detail_transaksi.reduce((sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0), 0);

      const total_item = t.detail_transaksi.reduce((sum, item) => sum + (item.jumlah || 0), 0);

      const biaya_lain_lain = t.biaya_lain_lain ?? 0;

      const grand_total = isKeluar
        ? total_harga_jual + biaya_lain_lain
        : total_harga_modal;

      return { ...t, total_harga_modal, total_harga_jual, total_item, biaya_lain_lain, grand_total };
    });

    return { data, total, page, limit };
  },
  ["rekap-data"]
);

const getCachedRekapDetail = unstable_cache(
  async (id: number) => {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        users: true,
        detail_transaksi: {
          include: { produk: { include: { kategori: true } } },
        },
      },
    });

    if (!transaksi) return null;

    const isKeluar = transaksi.jenis_stok === "KELUAR";
    const isMasuk = transaksi.jenis_stok === "MASUK";

    const total_harga_modal = isKeluar
      ? 0
      : transaksi.detail_transaksi.reduce((sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0), 0);

    const total_harga_jual = isMasuk
      ? 0
      : transaksi.detail_transaksi.reduce((sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0), 0);

    const total_item = transaksi.detail_transaksi.reduce((sum, item) => sum + (item.jumlah || 0), 0);

    const biaya_lain_lain = transaksi.biaya_lain_lain ?? 0;

    const grand_total = isKeluar
      ? total_harga_jual + biaya_lain_lain
      : total_harga_modal;

    return { ...transaksi, total_harga_modal, total_harga_jual, total_item, biaya_lain_lain, grand_total };
  },
  ["rekap-detail"]
);

const getCachedExportRekapIndividual = unstable_cache(
  async (id: number) => {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        users: true,
        detail_transaksi: {
          include: { produk: { include: { kategori: true } } },
        },
      },
    });

    if (!transaksi) return null;

    const isKeluar = transaksi.jenis_stok === "KELUAR";
    const isMasuk = transaksi.jenis_stok === "MASUK";

    const total_harga_modal = isKeluar
      ? 0
      : transaksi.detail_transaksi.reduce((sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0), 0);

    const total_harga_jual = isMasuk
      ? 0
      : transaksi.detail_transaksi.reduce((sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0), 0);

    const total_item = transaksi.detail_transaksi.reduce((sum, item) => sum + (item.jumlah || 0), 0);

    const biaya_lain_lain = transaksi.biaya_lain_lain ?? 0;

    const grand_total = isKeluar
      ? total_harga_jual + biaya_lain_lain
      : total_harga_modal;

    return { ...transaksi, total_harga_modal, total_harga_jual, total_item, biaya_lain_lain, grand_total };
  },
  ["rekap-export-individual"]
);

const getCachedExportRekapFiltered = unstable_cache(
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

    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.tanggal.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.tanggal.lte = end;
      }
    }

    if (namaKategori && namaKategori.trim() !== "" && namaKategori.trim().toLowerCase() !== "semua") {
      where.detail_transaksi = {
        some: {
          produk: {
            kategori: {
              is_active: 1,
              nama_kategori: { equals: namaKategori.trim() },
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
          include: { produk: { include: { kategori: true } } },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    const data = transaksiList.map((t) => {
      const isKeluar = t.jenis_stok === "KELUAR";
      const isMasuk = t.jenis_stok === "MASUK";

      const total_harga_modal = isKeluar
        ? 0
        : t.detail_transaksi.reduce((sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0), 0);

      const total_harga_jual = isMasuk
        ? 0
        : t.detail_transaksi.reduce((sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0), 0);

      const total_item = t.detail_transaksi.reduce((sum, item) => sum + (item.jumlah || 0), 0);

      const biaya_lain_lain = t.biaya_lain_lain ?? 0;

      const grand_total = isKeluar
        ? total_harga_jual + biaya_lain_lain
        : total_harga_modal;

      return { ...t, total_harga_modal, total_harga_jual, total_item, biaya_lain_lain, grand_total };
    });

    return data;
  },
  ["rekap-export-filtered"]
);

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
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { data: [], total: 0, page, limit, error: "Unauthorized" };
    }

    return await getCachedRekapData(
      type,
      namaKategori,
      startDate?.toISOString(),
      endDate?.toISOString(),
      page,
      limit,
      metodePembayaran
    );
  } catch (error) {
    return { data: [], total: 0, page, limit };
  }
}

export async function getRekapDetail(id: number) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return null;
    }

    return await getCachedRekapDetail(id);
  } catch (error) {
    return null;
  }
}

export async function updateRekap(id: number, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const keterangan = formData.get("keterangan") as string;
    const tanggal = new Date(formData.get("tanggal") as string);
    const jenis_stok = formData.get("jenis_stok") as string;
    const metode_pembayaran = (formData.get("metode_pembayaran") as string) || "CASH";
    const nama_pelanggan = (formData.get("nama_pelanggan") as string) || null;
    const biaya_lain_lain = parseInt(formData.get("biaya_lain_lain") as string) || 0;
    const total_bayar = parseInt(formData.get("total_bayar") as string) || 0;

    if (biaya_lain_lain < 0) {
      return { success: false, error: "Biaya lain-lain tidak boleh negatif." };
    }

    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        detail_transaksi: true,
      },
    });

    if (!transaksi) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }

    const targetJenisStok = jenis_stok.toUpperCase();
    const isKeluar = targetJenisStok === "KELUAR";
    const isMasuk = targetJenisStok === "MASUK";

    const total_harga_modal = isKeluar
      ? 0
      : transaksi.detail_transaksi.reduce((sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0), 0);

    const total_harga_jual = isMasuk
      ? 0
      : transaksi.detail_transaksi.reduce((sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0), 0);

    const grand_total = isKeluar
      ? total_harga_jual + biaya_lain_lain
      : total_harga_modal;

    let kembalian = 0;
    const metodeUpper = metode_pembayaran.toUpperCase();

    if (metodeUpper === "CASH") {
      kembalian = total_bayar - grand_total;
      if (kembalian < 0) kembalian = 0;
    } else if (metodeUpper === "TRANSFER") {
      kembalian = 0;
    } else if (metodeUpper === "CREDIT") {
      kembalian = total_bayar - grand_total;
    }

    await prisma.transaksi.update({
      where: { id },
      data: {
        jenis_stok: targetJenisStok,
        metode_pembayaran,
        keterangan,
        tanggal,
        nama_pelanggan,
        biaya_lain_lain,
        total_bayar,
        kembalian,
      },
    });

    revalidatePath("/rekap");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function exportRekapIndividual(id: number) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const data = await getCachedExportRekapIndividual(id);
    if (!data) return { success: false, error: "Not found" };

    return {
      success: true,
      data,
    };
  } catch (error) {
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
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const data = await getCachedExportRekapFiltered(
      type,
      namaKategori,
      startDate?.toISOString(),
      endDate?.toISOString(),
      metodePembayaran
    );

    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}