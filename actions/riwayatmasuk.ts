"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

interface ItemMasukInput {
  produk_id: number;
  jumlah: number;
  harga_modal_real: number;
  harga_jual_real: number;
}

export async function getRiwayatMasuk(opts?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
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
      jenis_stok: "MASUK",
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
    console.error("Error getRiwayatMasuk:", error);
    return {
      success: false,
      error: "Gagal mengambil riwayat masuk.",
      data: { rows: [], total: 0 },
    };
  }
}

export async function addRiwayatMasukAction(
  prevState: any,
  formData: FormData,
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return { success: false, error: "Sesi habis, silakan login kembali." };
    }

    const itemsJson = formData.get("items") as string;
    if (!itemsJson) return { success: false, error: "Daftar barang kosong." };

    const items: ItemMasukInput[] = JSON.parse(itemsJson);
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: "Minimal pilih satu barang." };
    }

    const metode_pembayaran = (formData.get("metode_pembayaran") as string) || "CASH";
    const keterangan = (formData.get("keterangan") as string) || null;
    const tanggal = formData.get("tanggal") ? new Date(String(formData.get("tanggal"))) : new Date();

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
      }

      const masterTransaksi = await tx.transaksi.create({
        data: {
          jenis_stok: "MASUK",
          metode_pembayaran,
          keterangan,
          tanggal,
          dicatat_oleh: parseInt(userId),
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

        const updateData: any = {
          stok_sekarang: {
            increment: item.jumlah
          }
        };

        if (item.harga_modal_real && item.harga_modal_real > 0) {
          updateData.harga_modal = item.harga_modal_real;
        }
        if (item.harga_jual_real && item.harga_jual_real > 0) {
          updateData.harga_jual = item.harga_jual_real;
        }

        await tx.produk.update({
          where: { id: item.produk_id },
          data: updateData,
        });
      }

      return { success: true };
    });

    if (result && 'error' in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/produk");
    revalidatePath("/riwayat-masuk");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi riwayat masuk berhasil disimpan." };
  } catch (error) {
    console.error("Error addRiwayatMasukAction:", error);
    return { success: false, error: "Gagal menambahkan riwayat masuk." };
  }
}

export async function updateRiwayatMasukAction(
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

    let items: ItemMasukInput[];
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

    const result = await prisma.$transaction(async (tx) => {
      const existingTransaksi = await tx.transaksi.findUnique({
        where: { id },
        include: { detail_transaksi: true },
      });

      if (!existingTransaksi) {
        return { error: "Transaksi tidak ditemukan." };
      }

      if (existingTransaksi.jenis_stok !== "MASUK") {
        return { error: "Transaksi ini bukan transaksi masuk." };
      }

      // Reverse old stock increments
      for (const oldItem of existingTransaksi.detail_transaksi) {
        if (oldItem.produk_id) {
          await tx.produk.update({
            where: { id: oldItem.produk_id },
            data: {
              stok_sekarang: {
                decrement: oldItem.jumlah,
              },
            },
          });
        }
      }

      // Delete old detail items
      await tx.detail_transaksi.deleteMany({
        where: { transaksi_id: id },
      });

      // Validate new items
      for (const item of items) {
        if (!item.produk_id) return { error: "Ada produk yang tidak valid." };
        if (isNaN(item.jumlah) || item.jumlah <= 0) return { error: "Jumlah barang harus lebih dari 0." };

        const produk = await tx.produk.findUnique({
          where: { id: item.produk_id, is_active: true },
        });

        if (!produk) {
          return { error: `Produk ID ${item.produk_id} tidak ditemukan atau sudah tidak aktif.` };
        }
      }

      // Update master transaksi
      await tx.transaksi.update({
        where: { id },
        data: {
          metode_pembayaran,
          keterangan,
          dicatat_oleh: userId,
        },
      });

      // Create new detail items and increment stock
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

        const updateData: any = {
          stok_sekarang: {
            increment: item.jumlah,
          },
        };

        if (item.harga_modal_real && item.harga_modal_real > 0) {
          updateData.harga_modal = item.harga_modal_real;
        }
        if (item.harga_jual_real && item.harga_jual_real > 0) {
          updateData.harga_jual = item.harga_jual_real;
        }

        await tx.produk.update({
          where: { id: item.produk_id },
          data: updateData,
        });
      }

      return { success: true };
    });

    if (result && "error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/produk");
    revalidatePath("/riwayat-masuk");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi riwayat masuk berhasil diperbarui." };
  } catch (error) {
    console.error("Error updateRiwayatMasukAction:", error);
    return { success: false, error: "Gagal memperbarui riwayat masuk." };
  }
}