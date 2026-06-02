"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// PERBAIKAN: Spasi dihapus agar menjadi satu nama tipe yang valid
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
}) {
  try {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 10;

    const where: any = {
      jenis_stok: "KELUAR",
    };

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
    console.error("Error getRiwayatKeluar:", error);
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
    const itemsJson = formData.get("items") as string;
    if (!itemsJson) return { success: false, error: "Daftar barang kosong." };

    const items: ItemKeluarInput[] = JSON.parse(itemsJson);
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: "Minimal pilih satu barang." };
    }

    const metode_pembayaran = (formData.get("metode_pembayaran") as string) || "CASH";
    const keterangan = (formData.get("keterangan") as string) || null;
    const tanggal = formData.get("tanggal") ? new Date(String(formData.get("tanggal"))) : new Date();
    const dicatat_oleh = formData.get("dicatat_oleh") ? Number(formData.get("dicatat_oleh")) : null;

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
          dicatat_oleh,
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
    console.error("Error addRiwayatKeluarAction:", error);
    return { success: false, error: "Gagal menambahkan riwayat keluar." };
  }
}