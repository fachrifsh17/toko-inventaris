"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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

      return { ...t, total_harga_modal, total_harga_jual, total_item };
    });

    return { data, total, page, limit };
  } catch (error) {
    console.error("Error:", error);
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

    return { ...transaksi, total_harga_modal, total_harga_jual, total_item };
  } catch (error) {
    console.error("Error:", error);
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

    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        users: true,
        detail_transaksi: {
          include: { produk: { include: { kategori: true } } },
        },
      },
    });

    if (!transaksi) return { success: false, error: "Not found" };

    const isKeluar = transaksi.jenis_stok === "KELUAR";
    const isMasuk = transaksi.jenis_stok === "MASUK";

    const total_harga_modal = isKeluar
      ? 0
      : transaksi.detail_transaksi.reduce((sum, item) => sum + (item.harga_modal_real || 0) * (item.jumlah || 0), 0);

    const total_harga_jual = isMasuk
      ? 0
      : transaksi.detail_transaksi.reduce((sum, item) => sum + (item.harga_jual_real || 0) * (item.jumlah || 0), 0);

    const total_item = transaksi.detail_transaksi.reduce((sum, item) => sum + (item.jumlah || 0), 0);

    return {
      success: true,
      data: { ...transaksi, total_harga_modal, total_harga_jual, total_item },
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

      return { ...t, total_harga_modal, total_harga_jual, total_item };
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}