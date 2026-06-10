"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

interface ItemKeluarInput {
  produk_id: number;
  jumlah: number;
  harga_modal_real: number;
  harga_jual_real: number;
}

export async function getRiwayatKeluar(opts?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  metodePembayaran?: string;
}) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return {
        success: false,
        error: "Akses ditolak: Anda harus login terlebih dahulu.",
        data: { rows: [], total: 0 },
      };
    }

    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 10;

    const where: any = {
      jenis_stok: "KELUAR",
    };

    if (opts?.metodePembayaran) {
      where.metode_pembayaran = opts.metodePembayaran;
    }

    if (opts?.startDate || opts?.endDate) {
      where.tanggal = {};
      if (opts?.startDate) {
        where.tanggal.gte = new Date(opts.startDate);
      }
      if (opts?.endDate) {
        const d = new Date(opts.endDate);
        d.setHours(23, 59, 59, 999);
        where.tanggal.lte = d;
      }
    }

    const [rows, total] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        include: {
          users: { select: { id: true, nama_lengkap: true } },
          detail_transaksi: {
            include: {
              produk: { select: { id: true, nama_produk: true } },
            },
          },
        },
        orderBy: {
          tanggal: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaksi.count({ where }),
    ]);

    return { success: true, data: { rows, total } };
  } catch (error) {
    return {
      success: false,
      error: "Gagal mengambil riwayat keluar.",
      data: { rows: [], total: 0 },
    };
  }
}

export async function addRiwayatKeluarAction(
  prevState: any,
  formData: FormData,
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session")?.value;

    if (!sessionCookie) {
      return { success: false, error: "Sesi habis, silakan login kembali." };
    }

    let userId: number = 0;

    if (!isNaN(Number(sessionCookie))) {
      userId = Number(sessionCookie);
    } else {
      try {
        const parsed = JSON.parse(sessionCookie);
        userId = parseInt(
          parsed?.id ?? 
          parsed?.user?.id ?? 
          parsed?.userId ?? 
          parsed?.user_id ?? 
          NaN
        );
      } catch {
        userId = 0;
      }
    }

    if (!userId || isNaN(userId)) {
      return { success: false, error: "Sesi tidak valid." };
    }

    const itemsJson = formData.get("items") as string;
    if (!itemsJson) return { success: false, error: "Daftar barang kosong." };

    let items: ItemKeluarInput[];
    try {
      items = JSON.parse(itemsJson);
    } catch {
      return { success: false, error: "Format data barang tidak valid." };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: "Minimal pilih satu barang." };
    }

    const metode_pembayaran = (formData.get("metode_pembayaran") as string)?.toUpperCase() || "CASH";
    const keterangan = (formData.get("keterangan") as string) || null;
    const tanggal = formData.get("tanggal") ? new Date(String(formData.get("tanggal"))) : new Date();
    const nama_pelanggan = (formData.get("nama_pelanggan") as string) || null;
    const biaya_lain_lain = parseInt(formData.get("biaya_lain_lain") as string) || 0;
    
    if (biaya_lain_lain < 0) {
      return { success: false, error: "Biaya lain-lain tidak boleh negatif." };
    }

    let total_bayar = parseInt(formData.get("total_bayar") as string) || 0;
    let kembalian = 0;

    const subtotalBarang = items.reduce((sum, item) => sum + (item.jumlah * item.harga_jual_real), 0);
    const totalHargaPesanan = subtotalBarang + biaya_lain_lain;

    if (metode_pembayaran === "TRANSFER") {
      total_bayar = totalHargaPesanan;
      kembalian = 0;
    } else if (metode_pembayaran === "CREDIT") {
      kembalian = total_bayar - totalHargaPesanan;
    } else {
      if (total_bayar < totalHargaPesanan) {
        if (biaya_lain_lain > 0) {
          return { success: false, error: `Pembayaran CASH kurang. Subtotal barang: Rp${subtotalBarang.toLocaleString("id-ID")}, Biaya lain-lain: Rp${biaya_lain_lain.toLocaleString("id-ID")}, Total yang harus dibayar: Rp${totalHargaPesanan.toLocaleString("id-ID")}.` };
        }
        return { success: false, error: `Pembayaran CASH tidak boleh kurang dari total tagihan (Rp${totalHargaPesanan.toLocaleString("id-ID")}).` };
      }
      kembalian = total_bayar - totalHargaPesanan;
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (!item.produk_id) return { error: "Ada produk yang tidak valid." };
        if (isNaN(item.jumlah) || item.jumlah <= 0) return { error: "Jumlah barang harus lebih dari 0." };

        const produk = await tx.produk.findUnique({
          where: { id: item.produk_id, is_active: true },
        });

        if (!produk) {
          return { error: `Produk ID ${item.produk_id} tidak ditemukan atau sudah tidak aktif.` };
        }

        if (item.jumlah > (produk.stok_sekarang || 0)) {
          return { error: `Stok untuk produk "${produk.nama_produk}" tidak mencukupi. (Sisa: ${produk.stok_sekarang})` };
        }
      }

      const masterTransaksi = await tx.transaksi.create({
        data: {
          jenis_stok: "KELUAR",
          metode_pembayaran,
          keterangan,
          tanggal,
          dicatat_oleh: userId,
          nama_pelanggan,
          biaya_lain_lain,
          total_bayar,
          kembalian,
        },
      });

      for (const item of items) {
        await tx.detail_transaksi.create({
          data: {
            transaksi_id: masterTransaksi.id,
            produk_id: item.produk_id,
            jumlah: item.jumlah,
            harga_modal_real: item.harga_modal_real,
            harga_jual_real: item.harga_jual_real,
          },
        });

        await tx.produk.update({
          where: { id: item.produk_id },
          data: {
            stok_sekarang: {
              decrement: item.jumlah
            }
          },
        });
      }

      return { success: true };
    });

    if (result && 'error' in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/produk");
    revalidatePath("/riwayat-keluar");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi riwayat keluar berhasil disimpan." };
  } catch (error) {
    return { success: false, error: "Gagal menambahkan riwayat keluar." };
  }
}

export async function updateRiwayatKeluarAction(
  id: number,
  prevState: any,
  formData: FormData,
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session")?.value;

    if (!sessionCookie) {
      return { success: false, error: "Sesi habis, silakan login kembali." };
    }

    let userId: number = 0;

    if (!isNaN(Number(sessionCookie))) {
      userId = Number(sessionCookie);
    } else {
      try {
        const parsed = JSON.parse(sessionCookie);
        userId = parseInt(
          parsed?.id ?? 
          parsed?.user?.id ?? 
          parsed?.userId ?? 
          parsed?.user_id ?? 
          NaN
        );
      } catch {
        userId = 0;
      }
    }

    if (!userId || isNaN(userId)) {
      return { success: false, error: "Sesi tidak valid." };
    }

    const itemsJson = formData.get("items") as string;
    if (!itemsJson) return { success: false, error: "Daftar barang kosong." };

    let items: ItemKeluarInput[];
    try {
      items = JSON.parse(itemsJson);
    } catch {
      return { success: false, error: "Format data barang tidak valid." };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: "Minimal pilih satu barang." };
    }

    const metode_pembayaran = (formData.get("metode_pembayaran") as string)?.toUpperCase() || "CASH";
    const keterangan = (formData.get("keterangan") as string) || null;
    const tanggal = formData.get("tanggal") ? new Date(String(formData.get("tanggal"))) : new Date();
    const nama_pelanggan = (formData.get("nama_pelanggan") as string) || null;
    const biaya_lain_lain = parseInt(formData.get("biaya_lain_lain") as string) || 0;
    
    if (biaya_lain_lain < 0) {
      return { success: false, error: "Biaya lain-lain tidak boleh negatif." };
    }

    let total_bayar = parseInt(formData.get("total_bayar") as string) || 0;
    let kembalian = 0;

    const subtotalBarang = items.reduce((sum, item) => sum + (item.jumlah * item.harga_jual_real), 0);
    const totalHargaPesanan = subtotalBarang + biaya_lain_lain;

    if (metode_pembayaran === "TRANSFER") {
      total_bayar = totalHargaPesanan;
      kembalian = 0;
    } else if (metode_pembayaran === "CREDIT") {
      kembalian = total_bayar - totalHargaPesanan;
    } else {
      if (total_bayar < totalHargaPesanan) {
        if (biaya_lain_lain > 0) {
          return { success: false, error: `Pembayaran CASH kurang. Subtotal barang: Rp${subtotalBarang.toLocaleString("id-ID")}, Biaya lain-lain: Rp${biaya_lain_lain.toLocaleString("id-ID")}, Total yang harus dibayar: Rp${totalHargaPesanan.toLocaleString("id-ID")}.` };
        }
        return { success: false, error: `Pembayaran CASH tidak boleh kurang dari total tagihan (Rp${totalHargaPesanan.toLocaleString("id-ID")}).` };
      }
      kembalian = total_bayar - totalHargaPesanan;
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingTransaksi = await tx.transaksi.findUnique({
        where: { id },
        include: { detail_transaksi: true },
      });

      if (!existingTransaksi) {
        return { error: "Transaksi tidak ditemukan." };
      }

      if (existingTransaksi.jenis_stok !== "KELUAR") {
        return { error: "Transaksi ini bukan transaksi keluar." };
      }

      for (const oldItem of existingTransaksi.detail_transaksi) {
        await tx.produk.update({
          where: { id: oldItem.produk_id! },
          data: {
            stok_sekarang: {
              increment: oldItem.jumlah,
            },
          },
        });
      }

      await tx.detail_transaksi.deleteMany({
        where: { transaksi_id: id },
      });

      for (const item of items) {
        if (!item.produk_id) return { error: "Ada produk yang tidak valid." };
        if (isNaN(item.jumlah) || item.jumlah <= 0) return { error: "Jumlah barang harus lebih dari 0." };

        const produk = await tx.produk.findUnique({
          where: { id: item.produk_id, is_active: true },
        });

        if (!produk) {
          return { error: `Produk ID ${item.produk_id} tidak ditemukan atau sudah tidak aktif.` };
        }

        if (item.jumlah > (produk.stok_sekarang || 0)) {
          return { error: `Stok untuk produk "${produk.nama_produk}" tidak mencukupi. (Sisa: ${produk.stok_sekarang})` };
        }
      }

      await tx.transaksi.update({
        where: { id },
        data: {
          metode_pembayaran,
          keterangan,
          tanggal,
          dicatat_oleh: userId,
          nama_pelanggan,
          biaya_lain_lain,
          total_bayar,
          kembalian,
        },
      });

      for (const item of items) {
        await tx.detail_transaksi.create({
          data: {
            transaksi_id: id,
            produk_id: item.produk_id,
            jumlah: item.jumlah,
            harga_modal_real: item.harga_modal_real,
            harga_jual_real: item.harga_jual_real,
          },
        });

        await tx.produk.update({
          where: { id: item.produk_id },
          data: {
            stok_sekarang: {
              decrement: item.jumlah,
            },
          },
        });
      }

      return { success: true };
    });

    if (result && "error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/produk");
    revalidatePath("/riwayat-keluar");
    revalidatePath("/rekap");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi riwayat keluar berhasil diperbarui." };
  } catch (error) {
    return { success: false, error: "Gagal memperbarui riwayat keluar." };
  }
}