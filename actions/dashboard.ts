"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============= STATISTIK DASHBOARD =============

// Ambil ringkasan dashboard
export async function getDashboardSummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Query paralel untuk performa
    const [
      totalProduk,
      totalKategori,
      totalStok,
      nilaiStok,
      stokMasukHariIni,
      stokKeluarHariIni,
      produkBerlabel,
      riwayatTerbaru,
    ] = await Promise.all([
      prisma.produk.count(),
      prisma.kategori.count(),
      prisma.produk.aggregate({
        _sum: { stok_sekarang: true },
      }),
      prisma.produk.aggregate({
        _sum: {
          stok_sekarang: true,
        },
      }),
      prisma.riwayat_stok.aggregate({
        _sum: { jumlah: true },
        _count: true,
        where: {
          jenis_stok: "MASUK",
          tanggal: { gte: today, lt: tomorrow },
        },
      }),
      prisma.riwayat_stok.aggregate({
        _sum: { jumlah: true },
        _count: true,
        where: {
          jenis_stok: "KELUAR",
          tanggal: { gte: today, lt: tomorrow },
        },
      }),
      prisma.produk.count({
        where: { is_active: true },
      }),
      prisma.riwayat_stok.findMany({
        take: 5,
        orderBy: { tanggal: "desc" },
        include: {
          produk: true,
          users: true,
        },
      }),
    ]);

    // Hitung nilai stok (stok * harga modal)
    const nilaiTotal = await prisma.produk.findMany({
      select: {
        stok_sekarang: true,
        harga_modal: true,
      },
    });

    const totalNilaiStok = nilaiTotal.reduce(
      (sum, p) => sum + (p.stok_sekarang || 0) * p.harga_modal,
      0,
    );

    return {
      success: true,
      data: {
        kartuRingkasan: {
          totalProduk,
          totalKategori,
          totalStok: totalStok._sum.stok_sekarang ?? 0,
          produkAktif: produkBerlabel,
          nilaiStok: totalNilaiStok,
        },
        aktivitasHariIni: {
          stokMasuk: stokMasukHariIni._sum.jumlah ?? 0,
          jumlahTransaksiMasuk: stokMasukHariIni._count,
          stokKeluar: stokKeluarHariIni._sum.jumlah ?? 0,
          jumlahTransaksiKeluar: stokKeluarHariIni._count,
        },
        riwayatTerbaru: riwayatTerbaru.map((riwayat) => ({
          id: riwayat.id,
          produk: riwayat.produk?.nama_produk,
          jenis: riwayat.jenis_stok,
          jumlah: riwayat.jumlah,
          dicatatOleh: riwayat.users?.nama_lengkap,
          tanggal: riwayat.tanggal,
        })),
      },
    };
  } catch (error) {
    console.error("Error getDashboardSummary:", error);
    return {
      success: false,
      error: "Gagal mengambil data dashboard",
    };
  }
}

// Ambil produk paling laris (berdasarkan stok keluar)
export async function getProdukPalingLaris(limit: number = 5) {
  try {
    const produkLaris = await prisma.riwayat_stok.groupBy({
      by: ["produk_id"],
      _sum: {
        jumlah: true,
      },
      where: {
        jenis_stok: "KELUAR",
      },
      orderBy: {
        _sum: {
          jumlah: "desc",
        },
      },
      take: limit,
    });

    const produkIds = produkLaris
      .map((p) => p.produk_id)
      .filter((id) => id !== null) as number[];

    const produkDetail = await prisma.produk.findMany({
      where: {
        id: { in: produkIds },
      },
      include: {
        kategori: true,
      },
    });

    return {
      success: true,
      data: produkDetail,
    };
  } catch (error) {
    console.error("Error getProdukPalingLaris:", error);
    return {
      success: false,
      error: "Gagal mengambil data produk paling laris",
    };
  }
}

// Ambil ringkasan stok berdasarkan kategori
export async function getStokByKategori() {
  try {
    const stokByKategori = await prisma.kategori.findMany({
      select: {
        id: true,
        nama_kategori: true,
        _count: {
          select: { produk: true },
        },
        produk: {
          select: { stok_sekarang: true },
        },
      },
    });

    const formatted = stokByKategori.map((kat) => ({
      kategori: kat.nama_kategori,
      jumlahProduk: kat._count.produk,
      totalStok: kat.produk.reduce((sum, p) => sum + (p.stok_sekarang || 0), 0),
    }));

    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    console.error("Error getStokByKategori:", error);
    return {
      success: false,
      error: "Gagal mengambil data stok per kategori",
    };
  }
}

// ============= LOGIKA STOK =============

// Logika untuk menambah riwayat stok (Masuk/Keluar)
export async function tambahRiwayatStokAction(data: {
  produk_id: number;
  jenis_stok: "MASUK" | "KELUAR";
  jumlah: number;
  harga_modal_real: number;
  harga_jual_real: number;
  dicatat_oleh: number;
  keterangan?: string;
}) {
  try {
    // 1. Catat ke riwayat
    await prisma.riwayat_stok.create({
      data: {
        ...data,
      },
    });

    // 2. Update stok di tabel produk
    const perubahan = data.jenis_stok === "MASUK" ? data.jumlah : -data.jumlah;

    await prisma.produk.update({
      where: { id: data.produk_id },
      data: {
        stok_sekarang: { increment: perubahan },
      },
    });

    revalidatePath("/dashboard/produk");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal memproses stok" };
  }
}
