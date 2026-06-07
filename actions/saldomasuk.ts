"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getSaldoMasuk(opts?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  saldo_id?: number;
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

    const where: any = {};

    if (opts?.saldo_id) {
      where.saldo_id = opts.saldo_id;
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
      prisma.saldo_masuk.findMany({
        where,
        include: {
          saldo: { select: { id: true, nama_akun: true } },
        },
        orderBy: {
          tanggal: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.saldo_masuk.count({ where }),
    ]);

    return { success: true, data: { rows, total } };
  } catch (error) {
    console.error("Error getSaldoMasuk:", error);
    return {
      success: false,
      error: "Gagal mengambil data saldo masuk.",
      data: { rows: [], total: 0 },
    };
  }
}

export async function addSaldoMasukAction(
  prevState: any,
  formData: FormData,
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Sesi habis, silakan login kembali." };
    }

    const saldo_id = Number(formData.get("saldo_id"));
    const nominal = Number(formData.get("nominal"));
    const tanggal = formData.get("tanggal")
      ? new Date(String(formData.get("tanggal")))
      : new Date();
    const keterangan = (formData.get("keterangan") as string) || null;

    if (isNaN(saldo_id) || saldo_id <= 0) {
      return { success: false, error: "Akun saldo tidak valid." };
    }

    if (isNaN(nominal) || nominal <= 0) {
      return { success: false, error: "Nominal harus lebih dari 0." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const saldo = await tx.saldo.findUnique({
        where: { id: saldo_id },
      });

      if (!saldo) {
        return { error: "Akun saldo tidak ditemukan." };
      }

      if (!saldo.is_active) {
        return { error: "Akun saldo sudah nonaktif." };
      }

      await tx.saldo_masuk.create({
        data: {
          saldo_id,
          nominal,
          tanggal,
          keterangan,
        },
      });

      await tx.saldo.update({
        where: { id: saldo_id },
        data: {
          total_saldo: {
            increment: nominal,
          },
          updated_at: new Date(),
        },
      });

      return { success: true };
    });

    if (result && "error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/saldo-masuk");
    revalidatePath("/admin-dan-saldo");
    revalidatePath("/dashboard");

    return { success: true, message: "Saldo masuk berhasil dicatat." };
  } catch (error) {
    console.error("Error addSaldoMasukAction:", error);
    return { success: false, error: "Gagal menambahkan saldo masuk." };
  }
}

export async function deleteSaldoMasukAction(
  prevState: any,
  formData: FormData,
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Sesi habis, silakan login kembali." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) {
      return { success: false, error: "ID tidak valid." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const saldoMasuk = await tx.saldo_masuk.findUnique({
        where: { id },
      });

      if (!saldoMasuk) {
        return { error: "Data saldo masuk tidak ditemukan." };
      }

      await tx.saldo.update({
        where: { id: saldoMasuk.saldo_id },
        data: {
          total_saldo: {
            decrement: saldoMasuk.nominal,
          },
          updated_at: new Date(),
        },
      });

      await tx.saldo_masuk.delete({
        where: { id },
      });

      return { success: true };
    });

    if (result && "error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/saldo-masuk");
    revalidatePath("/admin-dan-saldo");
    revalidatePath("/dashboard");

    return { success: true, message: "Saldo masuk berhasil dihapus." };
  } catch (error) {
    console.error("Error deleteSaldoMasukAction:", error);
    return { success: false, error: "Gagal menghapus saldo masuk." };
  }
}