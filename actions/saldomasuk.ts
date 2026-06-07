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

export async function updateSaldoMasukAction(
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
    const newSaldoId = Number(formData.get("saldo_id"));
    const newNominal = Number(formData.get("nominal"));
    const tanggal = formData.get("tanggal")
      ? new Date(String(formData.get("tanggal")))
      : undefined;
    const keterangan = (formData.get("keterangan") as string) || undefined;

    if (isNaN(id) || id <= 0) {
      return { success: false, error: "ID saldo masuk tidak valid." };
    }

    if (isNaN(newNominal) || newNominal <= 0) {
      return { success: false, error: "Nominal harus lebih dari 0." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingMasuk = await tx.saldo_masuk.findUnique({
        where: { id },
      });

      if (!existingMasuk) {
        return { error: "Data saldo masuk tidak ditemukan." };
      }

      if (isNaN(newSaldoId) || newSaldoId <= 0) {
        return { error: "Akun saldo tidak valid." };
      }

      const oldSaldoId = existingMasuk.saldo_id;
      const oldNominal = existingMasuk.nominal;
      const isSaldoChanged = oldSaldoId !== newSaldoId;

      if (isSaldoChanged) {
        const oldSaldo = await tx.saldo.findUnique({
          where: { id: oldSaldoId },
        });

        if (!oldSaldo) {
          return { error: "Akun saldo lama tidak ditemukan." };
        }

        const newSaldo = await tx.saldo.findUnique({
          where: { id: newSaldoId },
        });

        if (!newSaldo) {
          return { error: "Akun saldo baru tidak ditemukan." };
        }

        if (!newSaldo.is_active) {
          return { error: "Akun saldo tujuan sudah nonaktif." };
        }

        await tx.saldo.update({
          where: { id: oldSaldoId },
          data: {
            total_saldo: {
              decrement: oldNominal,
            },
            updated_at: new Date(),
          },
        });

        await tx.saldo.update({
          where: { id: newSaldoId },
          data: {
            total_saldo: {
              increment: newNominal,
            },
            updated_at: new Date(),
          },
        });
      } else {
        const selisih = newNominal - oldNominal;

        if (selisih !== 0) {
          const currentSaldo = await tx.saldo.findUnique({
            where: { id: oldSaldoId },
          });

          if (!currentSaldo) {
            return { error: "Akun saldo tidak ditemukan." };
          }

          await tx.saldo.update({
            where: { id: oldSaldoId },
            data: {
              total_saldo: {
                increment: selisih,
              },
              updated_at: new Date(),
            },
          });
        }
      }

      await tx.saldo_masuk.update({
        where: { id },
        data: {
          saldo_id: newSaldoId,
          nominal: newNominal,
          ...(tanggal && { tanggal }),
          ...(keterangan !== undefined && { keterangan }),
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

    return { success: true, message: "Saldo masuk berhasil diperbarui." };
  } catch (error) {
    console.error("Error updateSaldoMasukAction:", error);
    return { success: false, error: "Gagal memperbarui saldo masuk." };
  }
}