"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

const getCachedUsers = unstable_cache(
  async () => {
    return prisma.users.findMany({
      select: {
        id: true,
        username: true,
        nama_lengkap: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
  },
  ["users"]
);

export async function getUsers() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu.", data: [] };
    }

    const users = await getCachedUsers();
    return { success: true, data: users };
  } catch (error) {
    console.error("Error getUsers:", error);
    return { success: false, error: "Gagal mengambil daftar pengguna.", data: [] };
  }
}

export async function addUserAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const username = (formData.get("username") as string)?.trim();
    const nama_lengkap = (formData.get("nama_lengkap") as string)?.trim();
    const password = formData.get("password") as string;

    if (!username || !nama_lengkap || !password) {
      return { success: false, error: "Semua kolom wajib diisi!" };
    }
    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter!" };
    }

    const existing = await prisma.users.findUnique({ where: { username } });
    if (existing) return { success: false, error: "Username sudah digunakan!" };

    const hashed = await bcrypt.hash(password, 10);
    await prisma.users.create({ data: { username, nama_lengkap, password: hashed } });

    revalidatePath("/user");
    return { success: true, message: "Pengguna berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error addUserAction:", error);
    return { success: false, error: "Gagal menambahkan pengguna." };
  }
}

export async function editUserAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) return { success: false, error: "ID tidak valid." };

    const username = (formData.get("username") as string)?.trim();
    const nama_lengkap = (formData.get("nama_lengkap") as string)?.trim();
    const password = formData.get("password") as string;

    if (!username || !nama_lengkap) {
      return { success: false, error: "Username dan Nama Lengkap wajib diisi!" };
    }

    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

    if (username !== user.username) {
      const check = await prisma.users.findUnique({ where: { username } });
      if (check) return { success: false, error: "Username sudah dipakai akun lain!" };
    }

    const updateData: any = { username, nama_lengkap, updated_at: new Date() };
    if (password && password.trim() !== "") {
      if (password.length < 6) return { success: false, error: "Password minimal 6 karakter!" };
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.users.update({ where: { id }, data: updateData });
    revalidatePath("/user");
    return { success: true, message: "Pengguna berhasil diperbarui!" };
  } catch (error) {
    console.error("Error editUserAction:", error);
    return { success: false, error: "Gagal memperbarui pengguna." };
  }
}

export async function deleteUserAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) return { success: false, error: "ID tidak valid." };

    await prisma.users.delete({ where: { id } });
    revalidatePath("/user");
    return { success: true, message: "Pengguna berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteUserAction:", error);
    return { success: false, error: "Gagal menghapus pengguna." };
  }
}