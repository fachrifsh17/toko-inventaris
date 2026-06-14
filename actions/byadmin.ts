"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { cookies } from "next/headers";

const getCachedBiayaAdmin = unstable_cache(
  async (page?: number, pageSize?: number) => {
    if (typeof page === "number" && typeof pageSize === "number") {
      const total = await prisma.biaya_admin.count();
      const rows = await prisma.biaya_admin.findMany({
        include: {
          _count: {
            select: {
              transaksi_digital: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      return { rows, total };
    }

    const biayaAdmin = await prisma.biaya_admin.findMany({
      include: {
        _count: {
          select: {
            transaksi_digital: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return biayaAdmin;
  },
  ["biaya-admin"],
);

const getCachedBiayaAdminActive = unstable_cache(
  async () => {
    return prisma.biaya_admin.findMany({
      where: { is_active: true },
      orderBy: { nominal_biaya: "asc" },
    });
  },
  ["biaya-admin-active"],
  { revalidate: 10 }
);

export async function getBiayaAdmin(opts?: {
  page?: number;
  pageSize?: number;
}) {
  try {
    const data = await getCachedBiayaAdmin(opts?.page, opts?.pageSize);

    if (
      opts &&
      typeof opts.page === "number" &&
      typeof opts.pageSize === "number"
    ) {
      return { success: true, data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error getBiayaAdmin:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Gagal mengambil data biaya admin. ${msg}`,
      data: [],
    };
  }
}

export async function getBiayaAdminActive() {
  try {
    const data = await getCachedBiayaAdminActive();
    return { success: true, data };
  } catch (error) {
    console.error("Error getBiayaAdminActive:", error);
    return {
      success: false,
      error: "Gagal mengambil data biaya admin aktif.",
      data: [],
    };
  }
}

export async function addBiayaAdminAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const nominal_biaya = Number(formData.get("nominal_biaya"));
    const is_active = formData.get("is_active") === "true";

    if (isNaN(nominal_biaya) || nominal_biaya < 0)
      return { success: false, error: "Nominal biaya admin tidak valid!" };

    await prisma.biaya_admin.create({
      data: {
        nominal_biaya,
        is_active,
      },
    });

    revalidatePath("/biaya-admin");
    return { success: true, message: "Biaya admin berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error addBiayaAdminAction:", error);
    return { success: false, error: "Gagal menambahkan biaya admin." };
  }
}

export async function editBiayaAdminAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0)
      return { success: false, error: "ID tidak valid." };

    const existing = await prisma.biaya_admin.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Biaya admin tidak ditemukan." };

    const nominal_biaya = Number(formData.get("nominal_biaya"));
    const is_active = formData.get("is_active") === "true";

    if (isNaN(nominal_biaya) || nominal_biaya < 0)
      return { success: false, error: "Nominal biaya admin tidak valid!" };

    await prisma.biaya_admin.update({
      where: { id },
      data: {
        nominal_biaya,
        is_active,
      },
    });

    revalidatePath("/biaya-admin");
    return { success: true, message: "Biaya admin berhasil diperbarui!" };
  } catch (error) {
    console.error("Error editBiayaAdminAction:", error);
    return { success: false, error: "Gagal memperbarui biaya admin." };
  }
}

export async function deleteBiayaAdminAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0)
      return { success: false, error: "ID tidak valid." };

    const existing = await prisma.biaya_admin.findUnique({
      where: { id },
      include: { transaksi_digital: { take: 1 } },
    });

    if (!existing) return { success: false, error: "Biaya admin tidak ditemukan." };

    if (existing.transaksi_digital.length > 0) {
      return { success: false, error: "Tidak bisa menghapus biaya admin yang sudah digunakan dalam transaksi." };
    }

    await prisma.biaya_admin.delete({ where: { id } });

    revalidatePath("/biaya-admin");
    return { success: true, message: "Biaya admin berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteBiayaAdminAction:", error);
    return {
      success: false,
      error: "Gagal menghapus biaya admin.",
    };
  }
}