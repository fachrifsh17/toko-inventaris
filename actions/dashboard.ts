"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Prisma, StatusBayarDigital } from "@prisma/client";

type TransaksiWithDetails = Prisma.transaksiGetPayload<{
  include: {
    users: true;
    detail_transaksi: {
      include: {
        produk: true;
      };
    };
  };
}>;

export async function getDashboardSummary() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalProduk,
      totalKategori,
      totalStok,
      stokMasukHariIni,
      stokKeluarHariIni,
      produkBerlabel,
      transaksiTerbaru,
      rekapTotal,
      rekapLunas,
      rekapBelumLunas,
      rekapNominal,
    ] = await Promise.all([
      prisma.produk.count(),
      prisma.kategori.count(),
      prisma.produk.aggregate({
        _sum: { stok_sekarang: true },
      }),
      prisma.transaksi.aggregate({
        _count: true,
        where: {
          jenis_stok: "masuk",
          tanggal: { gte: today, lt: tomorrow },
        },
      }),
      prisma.transaksi.aggregate({
        _count: true,
        where: {
          jenis_stok: "keluar",
          tanggal: { gte: today, lt: tomorrow },
        },
      }),
      prisma.produk.count({
        where: { is_active: true },
      }),
      prisma.transaksi.findMany({
        take: 5,
        orderBy: { tanggal: "desc" },
        include: {
          users: true,
          detail_transaksi: {
            include: {
              produk: true,
            },
          },
        },
      }),
      prisma.transaksi_digital.count(),
      prisma.transaksi_digital.count({
        where: { status: StatusBayarDigital.LUNAS },
      }),
      prisma.transaksi_digital.count({
        where: { status: StatusBayarDigital.BELUM_LUNAS },
      }),
      prisma.transaksi_digital.aggregate({
        _sum: { nominal: true },
      }),
    ]);

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

    const sumMasukQty = await prisma.detail_transaksi.aggregate({
      _sum: { jumlah: true },
      where: {
        transaksi: {
          jenis_stok: "masuk",
          tanggal: { gte: today, lt: tomorrow },
        },
      },
    });

    const sumKeluarQty = await prisma.detail_transaksi.aggregate({
      _sum: { jumlah: true },
      where: {
        transaksi: {
          jenis_stok: "keluar",
          tanggal: { gte: today, lt: tomorrow },
        },
      },
    });

    const riwayatTerbaru = transaksiTerbaru.map((t: TransaksiWithDetails) => {
      const totalJumlah = t.detail_transaksi.reduce((s, d) => s + d.jumlah, 0);
      const labelProduk = t.detail_transaksi.length === 1
        ? (t.detail_transaksi[0].produk?.nama_produk || "Produk Terhapus")
        : `${t.detail_transaksi[0].produk?.nama_produk || "Produk"} +${t.detail_transaksi.length - 1} lainnya`;

      return {
        id: t.id,
        produk: labelProduk,
        jenis: (t.jenis_stok || "").toLowerCase(),
        jumlah: totalJumlah,
        dicatatOleh: t.users?.nama_lengkap || "Sistem",
        tanggal: t.tanggal,
      };
    });

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
          stokMasuk: sumMasukQty._sum.jumlah ?? 0,
          jumlahTransaksiMasuk: stokMasukHariIni._count,
          stokKeluar: sumKeluarQty._sum.jumlah ?? 0,
          jumlahTransaksiKeluar: stokKeluarHariIni._count,
        },
        rekapTransaksiDigital: {
          totalTransaksi: rekapTotal,
          totalNominal: rekapNominal._sum.nominal ?? 0,
          totalLunas: rekapLunas,
          totalBelumLunas: rekapBelumLunas,
        },
        riwayatTerbaru,
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

export async function getProdukPalingLaris(limit: number = 5) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const transaksiKeluarIds = await prisma.transaksi.findMany({
      where: { jenis_stok: "keluar" },
      select: { id: true },
    });

    const listIdTransaksi = transaksiKeluarIds.map((t) => t.id);

    const produkLaris = await prisma.detail_transaksi.groupBy({
      by: ["produk_id"],
      _sum: {
        jumlah: true,
      },
      where: {
        transaksi_id: { in: listIdTransaksi },
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
      .filter((id): id is number => id !== null && id !== undefined);

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

export async function getStokByKategori() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

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

export async function tambahRiwayatStokAction(data: {
  items: {
    produk_id: number;
    jumlah: number;
    harga_modal_real: number;
    harga_jual_real: number;
  }[];
  jenis_stok: "masuk" | "keluar";
  dicatat_oleh: number;
  metode_pembayaran?: string;
  keterangan?: string;
}) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    await prisma.$transaction(async (tx) => {
      const master = await tx.transaksi.create({
        data: {
          jenis_stok: data.jenis_stok,
          metode_pembayaran: data.metode_pembayaran || "CASH",
          keterangan: data.keterangan || null,
          dicatat_oleh: data.dicatat_oleh,
          tanggal: new Date(),
        },
      });

      for (const item of data.items) {
        await tx.detail_transaksi.create({
          data: {
            transaksi_id: master.id,
            produk_id: item.produk_id,
            jumlah: item.jumlah,
            harga_modal_real: item.harga_modal_real,
            harga_jual_real: item.harga_jual_real,
          },
        });

        const perubahan = data.jenis_stok === "masuk" ? item.jumlah : -item.jumlah;

        await tx.produk.update({
          where: { id: item.produk_id },
          data: {
            stok_sekarang: { increment: perubahan },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/riwayat-masuk");
    revalidatePath("/riwayat-keluar");
    return { success: true };
  } catch (error) {
    console.error("Error tambahRiwayatStokAction:", error);
    return { success: false, error: "Gagal memproses stok" };
  }
}