"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getTransaksiDigital(opts?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  jenis?: string;
  saldo_id?: number;
  status?: string;
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

    if (opts?.jenis) {
      where.jenis = opts.jenis;
    }

    if (opts?.saldo_id) {
      where.saldo_id = opts.saldo_id;
    }

    if (opts?.status) {
      where.status = opts.status === "Belum Lunas" ? "Belum_Lunas" : opts.status;
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaksi_digital.count({ where }),
    ]);

    return { success: true, data: { rows, total } };
  } catch (error) {
    console.error("Error getTransaksiDigital:", error);
    return {
      success: false,
      error: "Gagal mengambil data transaksi digital.",
      data: { rows: [], total: 0 },
    };
  }
}

export async function addTransaksiDigitalAction(
  prevState: any,
  formData: FormData,
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return { success: false, error: "Sesi habis, silakan login kembali." };
    }

    const dicatat_oleh = parseInt(userId);
    if (isNaN(dicatat_oleh)) {
      return { success: false, error: "Sesi tidak valid atau ID pengguna salah." };
    }

    const biaya_admin_id = Number(formData.get("biaya_admin_id"));
    const saldo_id = Number(formData.get("saldo_id"));
    const nama_pelanggan = (formData.get("nama_pelanggan") as string)?.trim() || null;
    const jenis = formData.get("jenis") as any;
    const provider_bank = (formData.get("provider_bank") as string)?.trim();
    const nomor_target = (formData.get("nomor_target") as string)?.trim();
    const nominal = Number(formData.get("nominal"));
    const biaya_lain_lain = Number(formData.get("biaya_lain_lain")) || 0;
    const statusInput = (formData.get("status") as string) || "Lunas";
    const keterangan = (formData.get("keterangan") as string)?.trim() || null;

    const status = statusInput === "Belum Lunas" ? "Belum_Lunas" : "Lunas";

    let tanggal = new Date();
    const tanggalInput = formData.get("tanggal");
    if (tanggalInput && String(tanggalInput).trim() !== "") {
      const parsedDate = new Date(String(tanggalInput));
      if (!isNaN(parsedDate.getTime())) {
        tanggal = parsedDate;
      }
    }

    if (isNaN(biaya_admin_id) || biaya_admin_id <= 0) {
      return { success: false, error: "Biaya admin tidak valid." };
    }

    if (isNaN(saldo_id) || saldo_id <= 0) {
      return { success: false, error: "Akun saldo tidak valid." };
    }

    if (!jenis || !["top_up", "transfer", "tarik_tunai", "ppob"].includes(jenis)) {
      return { success: false, error: "Jenis transaksi tidak valid." };
    }

    if (!provider_bank) {
      return { success: false, error: "Provider/bank wajib diisi." };
    }

    if (!nomor_target) {
      return { success: false, error: "Nomor target wajib diisi." };
    }

    if (isNaN(nominal) || nominal <= 0) {
      return { success: false, error: "Nominal harus lebih dari 0." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const biayaAdmin = await tx.biaya_admin.findUnique({
        where: { id: biaya_admin_id, is_active: true },
      });

      if (!biayaAdmin) {
        return { error: "Biaya admin tidak ditemukan atau tidak aktif." };
      }

      const saldo = await tx.saldo.findUnique({
        where: { id: saldo_id },
      });

      if (!saldo) {
        return { error: "Akun saldo tidak ditemukan." };
      }

      if (!saldo.is_active) {
        return { error: "Akun saldo sudah nonaktif." };
      }

      if (saldo.total_saldo <= 0) {
        return { error: "Transaksi tidak dapat dilakukan karena saldo kosong." };
      }

      const total_bayar = nominal + biayaAdmin.nominal_biaya + biaya_lain_lain;

      if (status === "Belum_Lunas") {
        if (saldo.total_saldo < nominal) {
          return { error: `Saldo tidak mencukupi. (Sisa: ${saldo.total_saldo}, Dibutuhkan: ${nominal})` };
        }
      } else if (status === "Lunas") {
        const netChange = biayaAdmin.nominal_biaya - biaya_lain_lain;
        if (netChange < 0 && saldo.total_saldo < Math.abs(netChange)) {
          return { error: `Saldo tidak mencukupi. (Sisa: ${saldo.total_saldo}, Dibutuhkan: ${Math.abs(netChange)})` };
        }
      }

      await tx.transaksi_digital.create({
        data: {
          biaya_admin_id,
          saldo_id,
          nama_pelanggan,
          jenis,
          provider_bank,
          nomor_target,
          nominal,
          biaya_lain_lain,
          total_bayar,
          status,
          keterangan,
          dicatat_oleh,
          tanggal,
        },
      });

      if (status === "Belum_Lunas") {
        await tx.saldo.update({
          where: { id: saldo_id },
          data: {
            total_saldo: {
              decrement: nominal,
            },
            updated_at: new Date(),
          },
        });
      } else if (status === "Lunas") {
        const netChange = biayaAdmin.nominal_biaya - biaya_lain_lain;
        await tx.saldo.update({
          where: { id: saldo_id },
          data: {
            total_saldo: netChange >= 0 ? { increment: netChange } : { decrement: Math.abs(netChange) },
            updated_at: new Date(),
          },
        });
      }

      return { success: true };
    });

    if (result && "error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/transaksi-digital");
    revalidatePath("/admin-dan-saldo");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi digital berhasil disimpan." };
  } catch (error) {
    console.error("Error addTransaksiDigitalAction:", error);
    return { success: false, error: "Gagal menambahkan transaksi digital." };
  }
}

export async function editTransaksiDigitalAction(
  prevState: any,
  formData: FormData,
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return { success: false, error: "Sesi habis, silakan login kembali." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) {
      return { success: false, error: "ID tidak valid." };
    }

    const biaya_admin_id = Number(formData.get("biaya_admin_id"));
    const saldo_id = Number(formData.get("saldo_id"));
    const nama_pelanggan = (formData.get("nama_pelanggan") as string)?.trim() || null;
    const jenis = formData.get("jenis") as any;
    const provider_bank = (formData.get("provider_bank") as string)?.trim();
    const nomor_target = (formData.get("nomor_target") as string)?.trim();
    const nominal = Number(formData.get("nominal"));
    const biaya_lain_lain = Number(formData.get("biaya_lain_lain")) || 0;
    const statusInput = (formData.get("status") as string) || "Lunas";
    const keterangan = (formData.get("keterangan") as string)?.trim() || null;

    const status = statusInput === "Belum Lunas" ? "Belum_Lunas" : "Lunas";

    if (isNaN(biaya_admin_id) || biaya_admin_id <= 0) {
      return { success: false, error: "Biaya admin tidak valid." };
    }

    if (isNaN(saldo_id) || saldo_id <= 0) {
      return { success: false, error: "Akun saldo tidak valid." };
    }

    if (!jenis || !["top_up", "transfer", "tarik_tunai", "ppob"].includes(jenis)) {
      return { success: false, error: "Jenis transaksi tidak valid." };
    }

    if (!provider_bank) {
      return { success: false, error: "Provider/bank wajib diisi." };
    }

    if (!nomor_target) {
      return { success: false, error: "Nomor target wajib diisi." };
    }

    if (isNaN(nominal) || nominal <= 0) {
      return { success: false, error: "Nominal harus lebih dari 0." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaksi_digital.findUnique({
        where: { id },
        include: {
          biaya_admin: true,
          saldo: true,
        },
      });

      if (!existing) {
        return { error: "Transaksi digital tidak ditemukan." };
      }

      const biayaAdmin = await tx.biaya_admin.findUnique({
        where: { id: biaya_admin_id, is_active: true },
      });

      if (!biayaAdmin) {
        return { error: "Biaya admin tidak ditemukan atau tidak aktif." };
      }

      const saldo = await tx.saldo.findUnique({
        where: { id: saldo_id },
      });

      if (!saldo) {
        return { error: "Akun saldo tidak ditemukan." };
      }

      if (!saldo.is_active) {
        return { error: "Akun saldo sudah nonaktif." };
      }

      const newTotalBayar = nominal + biayaAdmin.nominal_biaya + biaya_lain_lain;

      if (existing.status === "Belum_Lunas") {
        await tx.saldo.update({
          where: { id: existing.saldo_id },
          data: {
            total_saldo: {
              increment: existing.nominal,
            },
            updated_at: new Date(),
          },
        });
      } else if (existing.status === "Lunas") {
        const oldNetChange = existing.biaya_admin.nominal_biaya - existing.biaya_lain_lain;
        await tx.saldo.update({
          where: { id: existing.saldo_id },
          data: {
            total_saldo: oldNetChange >= 0 ? { decrement: oldNetChange } : { increment: Math.abs(oldNetChange) },
            updated_at: new Date(),
          },
        });
      }

      const currentSaldo = await tx.saldo.findUnique({
        where: { id: saldo_id },
      });
      const currentSaldoVal = currentSaldo?.total_saldo ?? 0;

      if (currentSaldoVal <= 0) {
        if (existing.status === "Belum_Lunas") {
          await tx.saldo.update({
            where: { id: existing.saldo_id },
            data: {
              total_saldo: { decrement: existing.nominal },
              updated_at: new Date(),
            },
          });
        } else if (existing.status === "Lunas") {
          const oldNetChange = existing.biaya_admin.nominal_biaya - existing.biaya_lain_lain;
          await tx.saldo.update({
            where: { id: existing.saldo_id },
            data: {
              total_saldo: oldNetChange >= 0 ? { increment: oldNetChange } : { decrement: Math.abs(oldNetChange) },
              updated_at: new Date(),
            },
          });
        }
        return { error: "Transaksi tidak dapat dilakukan karena saldo kosong." };
      }

      if (status === "Belum_Lunas") {
        if (currentSaldoVal < nominal) {
          if (existing.status === "Belum_Lunas") {
            await tx.saldo.update({
              where: { id: existing.saldo_id },
              data: {
                total_saldo: { decrement: existing.nominal },
                updated_at: new Date(),
                  },
                });
          } else if (existing.status === "Lunas") {
            const oldNetChange = existing.biaya_admin.nominal_biaya - existing.biaya_lain_lain;
            await tx.saldo.update({
              where: { id: existing.saldo_id },
              data: {
                total_saldo: oldNetChange >= 0 ? { increment: oldNetChange } : { decrement: Math.abs(oldNetChange) },
                updated_at: new Date(),
              },
            });
          }
          return { error: `Saldo tidak mencukupi. (Sisa: ${currentSaldoVal}, Dibutuhkan: ${nominal})` };
        }

        await tx.saldo.update({
          where: { id: saldo_id },
          data: {
            total_saldo: {
              decrement: nominal,
            },
            updated_at: new Date(),
          },
        });
      } else if (status === "Lunas") {
        const netChange = biayaAdmin.nominal_biaya - biaya_lain_lain;
        if (netChange < 0 && currentSaldoVal < Math.abs(netChange)) {
          if (existing.status === "Belum_Lunas") {
            await tx.saldo.update({
              where: { id: existing.saldo_id },
              data: {
                total_saldo: { decrement: existing.nominal },
                updated_at: new Date(),
              },
            });
          } else if (existing.status === "Lunas") {
            const oldNetChange = existing.biaya_admin.nominal_biaya - existing.biaya_lain_lain;
            await tx.saldo.update({
              where: { id: existing.saldo_id },
              data: {
                total_saldo: oldNetChange >= 0 ? { increment: oldNetChange } : { decrement: Math.abs(oldNetChange) },
                updated_at: new Date(),
              },
            });
          }
          return { error: `Saldo tidak mencukupi. (Sisa: ${currentSaldoVal}, Dibutuhkan: ${Math.abs(netChange)})` };
        }

        await tx.saldo.update({
          where: { id: saldo_id },
          data: {
            total_saldo: netChange >= 0 ? { increment: netChange } : { decrement: Math.abs(netChange) },
            updated_at: new Date(),
          },
        });
      }

      await tx.transaksi_digital.update({
        where: { id },
        data: {
          biaya_admin_id,
          saldo_id,
          nama_pelanggan,
          jenis,
          provider_bank,
          nomor_target,
          nominal,
          biaya_lain_lain,
          total_bayar: newTotalBayar,
          status,
          keterangan,
        },
      });

      return { success: true };
    });

    if (result && "error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/transaksi-digital");
    revalidatePath("/admin-dan-saldo");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaksi digital berhasil diperbarui." };
  } catch (error) {
    console.error("Error editTransaksiDigitalAction:", error);
    return { success: false, error: "Gagal memperbarui transaksi digital." };
  }
}

export async function updateStatusTransaksiDigitalAction(
  prevState: any,
  formData: FormData,
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return { success: false, error: "Sesi habis, silakan login kembali." };
    }

    const id = Number(formData.get("id"));
    const statusInput = formData.get("status") as string;

    if (isNaN(id) || id <= 0) {
      return { success: false, error: "ID tidak valid." };
    }

    if (!statusInput || !["Lunas", "Belum Lunas"].includes(statusInput)) {
      return { success: false, error: "Status tidak valid." };
    }

    const status = statusInput === "Belum Lunas" ? "Belum_Lunas" : "Lunas";

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaksi_digital.findUnique({
        where: { id },
        include: { biaya_admin: true },
      });

      if (!existing) {
        return { error: "Transaksi digital tidak ditemukan." };
      }

      if (existing.status === status) {
        return { error: "Status tidak berubah." };
      }

      if (existing.status === "Lunas" && status === "Belum_Lunas") {
        const saldo = await tx.saldo.findUnique({
          where: { id: existing.saldo_id },
        });
        if (!saldo) {
          return { error: "Akun saldo tidak ditemukan." };
        }
        if (saldo.total_saldo <= 0) {
          return { error: "Transaksi tidak dapat dilakukan karena saldo kosong." };
        }
        const requiredAmount = existing.nominal + existing.biaya_admin.nominal_biaya - existing.biaya_lain_lain;
        if (saldo.total_saldo < requiredAmount) {
          return { error: `Saldo tidak mencukupi untuk mengubah status. (Sisa: ${saldo.total_saldo}, Dibutuhkan: ${requiredAmount})` };
        }
        await tx.saldo.update({
          where: { id: existing.saldo_id },
          data: {
            total_saldo: {
              decrement: requiredAmount,
            },
            updated_at: new Date(),
          },
        });
      }

      if (existing.status === "Belum_Lunas" && status === "Lunas") {
        const amountToAdd = existing.nominal + existing.biaya_admin.nominal_biaya - existing.biaya_lain_lain;
        await tx.saldo.update({
          where: { id: existing.saldo_id },
          data: {
            total_saldo: {
              increment: amountToAdd,
            },
            updated_at: new Date(),
          },
        });
      }

      await tx.transaksi_digital.update({
        where: { id },
        data: { status },
      });

      return { success: true };
    });

    if (result && "error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/transaksi-digital");
    revalidatePath("/admin-dan-saldo");
    revalidatePath("/dashboard");

    return { success: true, message: "Status transaksi berhasil diperbarui." };
  } catch (error) {
    console.error("Error updateStatusTransaksiDigitalAction:", error);
    return { success: false, error: "Gagal memperbarui status transaksi." };
  }
}