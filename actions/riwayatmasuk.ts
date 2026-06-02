"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRiwayatMasuk(opts?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 10;
    
    // Filter hanya menampilkan riwayat MASUK
    const where: any = { jenis_stok: "MASUK" };
    
    if (opts?.startDate || opts?.endDate) {
      where.tanggal = {};
      if (opts?.startDate) where.tanggal.gte = new Date(opts.startDate);
      if (opts?.endDate) {
        const d = new Date(opts.endDate);
        d.setHours(23, 59, 59, 999);
        where.tanggal.lte = d;
      }
    }

    const [rows, total] = await Promise.all([
      prisma.riwayat_stok.findMany({
        where,
        include: {
          produk: { select: { id: true, nama_produk: true } },
          users: { select: { id: true, nama_lengkap: true } },
        },
        orderBy: { tanggal: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.riwayat_stok.count({ where }),
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
    const produk_id = formData.get("produk_id")
      ? Number(formData.get("produk_id"))
      : null;
    const jumlah = Number(formData.get("jumlah"));
    const harga_modal_real = Number(formData.get("harga_modal_real")) || 0;
    const harga_jual_real = Number(formData.get("harga_jual_real")) || 0;
    const metode_pembayaran = (formData.get("metode_pembayaran") as string) || "CASH";
    const keterangan = (formData.get("keterangan") as string) || null;
    const tanggal = formData.get("tanggal")
      ? new Date(String(formData.get("tanggal")))
      : new Date();
    const dicatat_oleh = formData.get("dicatat_oleh")
      ? Number(formData.get("dicatat_oleh"))
      : null;

    // Validasi dasar
    if (!produk_id) return { success: false, error: "Produk tidak valid." };
    if (isNaN(jumlah) || jumlah <= 0)
      return { success: false, error: "Jumlah harus lebih dari 0." };

    // Validasi produk: Pastikan ditemukan DAN is_active = true
    const produk = await prisma.produk.findUnique({ 
      where: { 
        id: produk_id,
        is_active: true // Filter produk aktif
      } 
    });

    if (!produk) {
      return { 
        success: false, 
        error: "Produk tidak ditemukan atau produk sudah tidak aktif." 
      };
    }

    // Proses transaksi riwayat
    await prisma.riwayat_stok.create({
      data: {
        produk_id,
        jenis_stok: "MASUK",
        jumlah,
        harga_modal_real,
        harga_jual_real,
        metode_pembayaran,
        keterangan,
        tanggal,
        dicatat_oleh,
      },
    });

    // Update stok produk dan harga
    const newStock = (produk.stok_sekarang || 0) + jumlah;
    const updateData: any = { stok_sekarang: newStock };
    
    if (harga_modal_real && harga_modal_real > 0)
      updateData.harga_modal = harga_modal_real;
    if (harga_jual_real && harga_jual_real > 0)
      updateData.harga_jual = harga_jual_real;
      
    await prisma.produk.update({ 
      where: { id: produk_id }, 
      data: updateData 
    });

    revalidatePath("/produk");
    revalidatePath("/riwayat-masuk");
    
    return { success: true, message: "Riwayat masuk berhasil ditambahkan." };
  } catch (error) {
    console.error("Error addRiwayatMasukAction:", error);
    return { success: false, error: "Gagal menambahkan riwayat masuk." };
  }
}