"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getRekapData(
  jenis?: string,
  providerBank?: string,
  saldoId?: number | string,
  startDate?: Date | string,
  endDate?: Date | string,
  status?: string,
  page: number | string = 1,
  limit: number | string = 10,
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { data: [], total: 0, page: Number(page), limit: Number(limit), error: "Unauthorized" };
    }

    const pageNum = Number(page) || 1;
    const pageSize = Number(limit) || 10;

    const where: any = {};

    if (jenis) {
      where.jenis = jenis;
    }

    if (status) {
      where.status = status === "Belum Lunas" ? "Belum_Lunas" : status;
    }

    if (saldoId) {
      const parsedSaldoId = Number(saldoId);
      if (!isNaN(parsedSaldoId)) {
        where.saldo_id = parsedSaldoId;
      }
    }

    if (providerBank && providerBank.trim() !== "") {
      where.provider_bank = {
        contains: providerBank.trim(),
      };
    }

    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) {
        where.tanggal.gte = new Date(startDate);
      }
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        where.tanggal.lte = d;
      }
    }

    const [rows, total] = await Promise.all([
      prisma.transaksi_digital.findMany({
        where,
        include: {
          users: { select: { id: true, nama_lengkap: true } },
          biaya_admin: { select: { id: true, nominal_biaya: true } },
          saldo: { select: { id: true, nama_akun: true } },
        },
        orderBy: {
          tanggal: "desc",
        },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaksi_digital.count({ where }),
    ]);

    const data = rows.map((t) => {
      const total_biaya_admin = t.biaya_admin?.nominal_biaya || 0;
      const total_semua = t.nominal + total_biaya_admin - (t.biaya_lain_lain || 0);

      return {
        id: t.id,
        biaya_admin_id: t.biaya_admin_id,
        saldo_id: t.saldo_id,
        nama_pelanggan: t.nama_pelanggan,
        jenis: t.jenis,
        provider_bank: t.provider_bank,
        nomor_target: t.nomor_target,
        nominal: t.nominal,
        biaya_lain_lain: t.biaya_lain_lain,
        total_bayar: t.total_bayar,
        status: t.status,
        keterangan: t.keterangan,
        dicatat_oleh: t.dicatat_oleh,
        tanggal: t.tanggal,
        created_at: t.created_at,
        users: t.users,
        biaya_admin: t.biaya_admin,
        saldo: t.saldo,
        total_biaya_admin,
        total_semua,
      };
    });

    return { data, total, page: pageNum, limit: pageSize };
  } catch (error) {
    return { data: [], total: 0, page: Number(page) || 1, limit: Number(limit) || 10, error: (error as Error).message };
  }
}

export async function getRekapDetail(id: number) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) return null;

    const transaksi = await prisma.transaksi_digital.findUnique({
      where: { id: Number(id) },
      include: {
        users: { select: { id: true, nama_lengkap: true } },
        biaya_admin: { select: { id: true, nominal_biaya: true } },
        saldo: { select: { id: true, nama_akun: true } },
      },
    });

    if (!transaksi) return null;

    const total_biaya_admin = transaksi.biaya_admin?.nominal_biaya || 0;
    const total_semua = transaksi.nominal + total_biaya_admin - (transaksi.biaya_lain_lain || 0);

    return {
      id: transaksi.id,
      biaya_admin_id: transaksi.biaya_admin_id,
      saldo_id: transaksi.saldo_id,
      nama_pelanggan: transaksi.nama_pelanggan,
      jenis: transaksi.jenis,
      provider_bank: transaksi.provider_bank,
      nomor_target: transaksi.nomor_target,
      nominal: transaksi.nominal,
      biaya_lain_lain: transaksi.biaya_lain_lain,
      total_bayar: transaksi.total_bayar,
      status: transaksi.status,
      keterangan: transaksi.keterangan,
      dicatat_oleh: transaksi.dicatat_oleh,
      tanggal: transaksi.tanggal,
      created_at: transaksi.created_at,
      users: transaksi.users,
      biaya_admin: transaksi.biaya_admin,
      saldo: transaksi.saldo,
      total_biaya_admin,
      total_semua,
    };
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
    const tanggalStr = formData.get("tanggal") as string;
    const rawStatus = formData.get("status") as string;
    const nama_pelanggan = (formData.get("nama_pelanggan") as string) || null;

    if (!tanggalStr) {
      return { success: false, error: "Tanggal wajib diisi" };
    }

    const tanggal = new Date(tanggalStr);
    if (isNaN(tanggal.getTime())) {
      return { success: false, error: "Format tanggal tidak valid" };
    }

    const status = rawStatus === "Belum_Lunas" ? "Belum_Lunas" : "Lunas";

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaksi_digital.findUnique({
        where: { id: Number(id) },
        include: { biaya_admin: true },
      });

      if (!existing) {
        return { error: "Transaksi digital tidak ditemukan." };
      }

      if (existing.status !== status) {
        const amountDiff = existing.nominal + existing.biaya_admin.nominal_biaya - existing.biaya_lain_lain;

        if (existing.status === "Lunas" && status === "Belum_Lunas") {
          const saldo = await tx.saldo.findUnique({
            where: { id: existing.saldo_id },
          });

          if (!saldo) {
            return { error: "Akun saldo tidak ditemukan." };
          }

          if (saldo.total_saldo < amountDiff) {
            return { error: `Saldo tidak mencukupi untuk mengubah status. (Sisa: ${saldo.total_saldo}, Dibutuhkan: ${amountDiff})` };
          }

          await tx.saldo.update({
            where: { id: existing.saldo_id },
            data: {
              total_saldo: { decrement: amountDiff },
              updated_at: new Date(),
            },
          });
        }

        if (existing.status === "Belum_Lunas" && status === "Lunas") {
          await tx.saldo.update({
            where: { id: existing.saldo_id },
            data: {
              total_saldo: { increment: amountDiff },
              updated_at: new Date(),
            },
          });
        }
      }

      await tx.transaksi_digital.update({
        where: { id: Number(id) },
        data: {
          status,
          keterangan,
          nama_pelanggan,
          tanggal,
        },
      });

      return { success: true };
    });

    if (result && "error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/rekap-saldo");
    revalidatePath("/admin-dan-saldo");
    revalidatePath("/dashboard");
    revalidatePath("/transaksi-digital");

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function exportRekapIndividual(id: number) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) return { success: false, error: "Unauthorized" };

    const transaksi = await prisma.transaksi_digital.findUnique({
      where: { id: Number(id) },
      include: {
        users: { select: { id: true, nama_lengkap: true } },
        biaya_admin: { select: { id: true, nominal_biaya: true } },
        saldo: { select: { id: true, nama_akun: true } },
      },
    });

    if (!transaksi) return { success: false, error: "Not found" };

    const total_biaya_admin = transaksi.biaya_admin?.nominal_biaya || 0;
    const total_semua = transaksi.nominal + total_biaya_admin - (transaksi.biaya_lain_lain || 0);

    return {
      success: true,
      data: {
        id: transaksi.id,
        biaya_admin_id: transaksi.biaya_admin_id,
        saldo_id: transaksi.saldo_id,
        nama_pelanggan: transaksi.nama_pelanggan,
        jenis: transaksi.jenis,
        provider_bank: transaksi.provider_bank,
        nomor_target: transaksi.nomor_target,
        nominal: transaksi.nominal,
        biaya_lain_lain: transaksi.biaya_lain_lain,
        total_bayar: transaksi.total_bayar,
        status: transaksi.status,
        keterangan: transaksi.keterangan,
        dicatat_oleh: transaksi.dicatat_oleh,
        tanggal: transaksi.tanggal,
        created_at: transaksi.created_at,
        users: transaksi.users,
        biaya_admin: transaksi.biaya_admin,
        saldo: transaksi.saldo,
        total_biaya_admin,
        total_semua,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function exportRekapFiltered(
  jenis?: string,
  providerBank?: string,
  saldoId?: number | string,
  startDate?: Date | string,
  endDate?: Date | string,
  status?: string,
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) return { success: false, error: "Unauthorized" };

    const where: any = {};

    if (jenis) {
      where.jenis = jenis;
    }

    if (status) {
      where.status = status === "Belum Lunas" ? "Belum_Lunas" : status;
    }

    if (saldoId) {
      const parsedSaldoId = Number(saldoId);
      if (!isNaN(parsedSaldoId)) {
        where.saldo_id = parsedSaldoId;
      }
    }

    if (providerBank && providerBank.trim() !== "") {
      where.provider_bank = {
        contains: providerBank.trim(),
      };
    }

    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) {
        where.tanggal.gte = new Date(startDate);
      }
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        where.tanggal.lte = d;
      }
    }

    const rows = await prisma.transaksi_digital.findMany({
      where,
      include: {
        users: { select: { id: true, nama_lengkap: true } },
        biaya_admin: { select: { id: true, nominal_biaya: true } },
        saldo: { select: { id: true, nama_akun: true } },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    const data = rows.map((t) => {
      const total_biaya_admin = t.biaya_admin?.nominal_biaya || 0;
      const total_semua = t.nominal + total_biaya_admin - (t.biaya_lain_lain || 0);

      return {
        id: t.id,
        biaya_admin_id: t.biaya_admin_id,
        saldo_id: t.saldo_id,
        nama_pelanggan: t.nama_pelanggan,
        jenis: t.jenis,
        provider_bank: t.provider_bank,
        nomor_target: t.nomor_target,
        nominal: t.nominal,
        biaya_lain_lain: t.biaya_lain_lain,
        total_bayar: t.total_bayar,
        status: t.status,
        keterangan: t.keterangan,
        dicatat_oleh: t.dicatat_oleh,
        tanggal: t.tanggal,
        created_at: t.created_at,
        users: t.users,
        biaya_admin: t.biaya_admin,
        saldo: t.saldo,
        total_biaya_admin,
        total_semua,
      };
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}