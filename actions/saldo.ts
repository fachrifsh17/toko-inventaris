"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getSaldo(opts?: {
  page?: number;
  pageSize?: number;
}) {
  try {
    if (
      opts &&
      typeof opts.page === "number" &&
      typeof opts.pageSize === "number"
    ) {
      const total = await prisma.saldo.count();
      const rows = await prisma.saldo.findMany({
        include: {
          _count: {
            select: {
              saldo_masuk: true,
              transaksi_digital: true,
            },
          },
        },
        orderBy: { updated_at: "desc" },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      });
      return { success: true, data: { rows, total } };
    }

    const saldo = await prisma.saldo.findMany({
      include: {
        _count: {
          select: {
            saldo_masuk: true,
            transaksi_digital: true,
          },
        },
      },
      orderBy: { updated_at: "desc" },
    });
    return { success: true, data: saldo };
  } catch (error) {
    console.error("Error getSaldo:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Gagal mengambil data saldo. ${msg}`,
      data: [],
    };
  }
}

export async function getSaldoActive() {
  try {
    const saldo = await prisma.saldo.findMany({
      where: { is_active: true },
      orderBy: { nama_akun: "asc" },
    });
    return { success: true, data: saldo };
  } catch (error) {
    console.error("Error getSaldoActive:", error);
    return {
      success: false,
      error: "Gagal mengambil data saldo aktif.",
      data: [],
    };
  }
}

export async function addSaldoAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const nama_akun = (formData.get("nama_akun") as string)?.trim();
    const total_saldo = Number(formData.get("total_saldo") || 0);
    const is_active = formData.get("is_active") === "true";

    if (!nama_akun)
      return { success: false, error: "Nama akun saldo wajib diisi!" };
    if (isNaN(total_saldo) || total_saldo < 0)
      return { success: false, error: "Total saldo tidak valid!" };

    await prisma.saldo.create({
      data: {
        nama_akun,
        total_saldo,
        is_active,
      },
    });

    revalidatePath("/saldo");
    return { success: true, message: "Akun saldo berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error addSaldoAction:", error);
    return { success: false, error: "Gagal menambahkan akun saldo." };
  }
}

export async function editSaldoAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0)
      return { success: false, error: "ID tidak valid." };

    const existing = await prisma.saldo.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Akun saldo tidak ditemukan." };

    const nama_akun = (formData.get("nama_akun") as string)?.trim();
    const total_saldo = Number(formData.get("total_saldo") || 0);
    const is_active = formData.get("is_active") === "true";

    if (!nama_akun)
      return { success: false, error: "Nama akun saldo wajib diisi!" };
    if (isNaN(total_saldo) || total_saldo < 0)
      return { success: false, error: "Total saldo tidak valid!" };

    await prisma.saldo.update({
      where: { id },
      data: {
        nama_akun,
        total_saldo,
        is_active,
        updated_at: new Date(),
      },
    });

    revalidatePath("/saldo");
    return { success: true, message: "Akun saldo berhasil diperbarui!" };
  } catch (error) {
    console.error("Error editSaldoAction:", error);
    return { success: false, error: "Gagal memperbarui akun saldo." };
  }
}

export async function deleteSaldoAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0)
      return { success: false, error: "ID tidak valid." };

    const existing = await prisma.saldo.findUnique({
      where: { id },
      include: {
        saldo_masuk: { take: 1 },
        transaksi_digital: { take: 1 },
      },
    });

    if (!existing) return { success: false, error: "Akun saldo tidak ditemukan." };

    if (existing.saldo_masuk.length > 0 || existing.transaksi_digital.length > 0) {
      return { success: false, error: "Tidak bisa menghapus akun saldo yang sudah memiliki riwayat transaksi." };
    }

    await prisma.saldo.delete({ where: { id } });

    revalidatePath("/saldo");
    return { success: true, message: "Akun saldo berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteSaldoAction:", error);
    return {
      success: false,
      error: "Gagal menghapus akun saldo.",
    };
  }
}