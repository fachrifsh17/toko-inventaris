"use server";

import { prisma } from "@/lib/prisma";
import { getPengaturan } from "./pengaturan";
import { cookies } from "next/headers";

export async function getRekapPdfData(
  jenis?: string,
  providerBank?: string,
  saldoId?: number,
  startDate?: Date,
  endDate?: Date,
  status?: string,
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const where: any = {};

    if (jenis) where.jenis = jenis;

    if (status) {
      where.status = status === "Belum Lunas" ? "Belum_Lunas" : status;
    }

    if (saldoId) where.saldo_id = saldoId;

    if (providerBank && providerBank.trim() !== "") {
      where.provider_bank = { contains: providerBank.trim() };
    }

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

    const [transaksiList, pengaturanRes, saldoData] = await Promise.all([
      prisma.transaksi_digital.findMany({
        where,
        include: {
          users: { select: { id: true, nama_lengkap: true } },
          biaya_admin: { select: { id: true, nominal_biaya: true } },
          saldo: { select: { id: true, nama_akun: true } },
        },
        orderBy: { tanggal: "desc" },
      }),
      getPengaturan(),
      saldoId
        ? prisma.saldo.findUnique({
            where: { id: saldoId },
            select: { nama_akun: true },
          })
        : null,
    ]);

    const formattedData = transaksiList.map((t) => {
      const total_biaya_admin = t.biaya_admin?.nominal_biaya || 0;
      const total_semua = t.nominal + total_biaya_admin - (t.biaya_lain_lain || 0);

      return {
        id: t.id,
        nama_pelanggan: t.nama_pelanggan,
        jenis: t.jenis,
        provider_bank: t.provider_bank,
        nomor_target: t.nomor_target,
        nominal: t.nominal,
        biaya_lain_lain: t.biaya_lain_lain,
        total_bayar: t.total_bayar,
        status: t.status === "Belum_Lunas" ? "Belum Lunas" : t.status,
        keterangan: t.keterangan,
        tanggal: t.tanggal.toISOString(),
        created_at: t.created_at.toISOString(),
        dicatat_oleh: t.users?.nama_lengkap || "-",
        nama_saldo: t.saldo?.nama_akun || "-",
        total_biaya_admin,
        total_semua,
      };
    });

    const total_transaksi = formattedData.length;
    const sudah_checkout = formattedData.filter((t) => t.status === "Lunas").length;
    const belum_checkout = formattedData.filter((t) => t.status === "Belum Lunas").length;
    const sum_nominal = formattedData.reduce((s, t) => s + t.nominal, 0);
    const sum_biaya_admin = formattedData.reduce((s, t) => s + t.total_biaya_admin, 0);
    const sum_biaya_lain_lain = formattedData.reduce((s, t) => s + (t.biaya_lain_lain || 0), 0);
    const sum_total_semua = formattedData.reduce((s, t) => s + t.total_semua, 0);

    const ringkasan = {
      total_transaksi,
      sudah_checkout,
      belum_checkout,
      total_nominal: sum_nominal,
      total_biaya_admin: sum_biaya_admin,
      total_biaya_lain_lain: sum_biaya_lain_lain,
      total_semua: sum_total_semua,
    };

    return {
      success: true,
      data: formattedData,
      ringkasan,
      saldoNama: saldoData?.nama_akun || null,
      pengaturan: pengaturanRes.success ? pengaturanRes.data : null,
    };
  } catch (error) {
    console.error("Error in getRekapPdfData:", error);
    return { success: false, error: (error as Error).message };
  }
}