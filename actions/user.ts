"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// ============= GET CURRENT USER =============
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");

    if (!sessionCookie || !sessionCookie.value) {
      return { success: false, error: "Tidak ada sesi aktif." };
    }

    const userId = Number(sessionCookie.value);
    if (isNaN(userId)) {
      return { success: false, error: "Sesi tidak valid." };
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nama_lengkap: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error getCurrentUser:", error);
    return { success: false, error: "Gagal mengambil data profil." };
  }
}

// ============= UPDATE PROFILE ACTION =============
export async function updateUserProfileAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");

    if (!sessionCookie || !sessionCookie.value) {
      return { success: false, error: "Sesi Anda telah kedaluwarsa. Silakan login kembali." };
    }

    const userId = Number(sessionCookie.value);
    if (isNaN(userId)) {
      return { success: false, error: "Sesi tidak valid." };
    }

    const username = formData.get("username") as string;
    const nama_lengkap = formData.get("nama_lengkap") as string;
    const password_sekarang = formData.get("password_sekarang") as string;
    const password_baru = formData.get("password_baru") as string;

    // Validasi wajib
    if (!username || !nama_lengkap) {
      return { success: false, error: "Username dan Nama Lengkap wajib diisi!" };
    }

    // Ambil user di database (termasuk password untuk dicompare)
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // Cek apakah username diubah dan unik
    if (username !== user.username) {
      const existingUser = await prisma.users.findUnique({
        where: { username },
      });
      if (existingUser) {
        return { success: false, error: "Username sudah digunakan oleh akun lain!" };
      }
    }

    // Jika ingin mengganti password atau mengupdate data sensitif, verifikasi password_sekarang
    const isPasswordValid = await bcrypt.compare(password_sekarang, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Password saat ini salah!" };
    }

    // Siapkan data update
    let updatedData: any = {
      username,
      nama_lengkap,
      updated_at: new Date(),
    };

    // Jika ada input password baru, hash dan simpan
    if (password_baru && password_baru.trim() !== "") {
      if (password_baru.length < 6) {
        return { success: false, error: "Password baru minimal harus 6 karakter!" };
      }
      const hashedPassword = await bcrypt.hash(password_baru, 10);
      updatedData.password = hashedPassword;
    }

    // Simpan ke DB
    await prisma.users.update({
      where: { id: userId },
      data: updatedData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/edit-profile");

    return {
      success: true,
      message: "Profil Anda berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Error updateProfile:", error);
    return { success: false, error: "Gagal memperbarui profil Anda." };
  }
}

// ============= GET ALL USERS =============
export async function getUsers() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        nama_lengkap: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error getUsers:", error);
    return { success: false, error: "Gagal mengambil daftar pengguna." };
  }
}

// ============= ADD USER ACTION =============
export async function addUserAction(prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const nama_lengkap = formData.get("nama_lengkap") as string;
    const password = formData.get("password") as string;

    if (!username || !nama_lengkap || !password) {
      return { success: false, error: "Semua kolom wajib diisi!" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter!" };
    }

    const existingUser = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: "Username sudah digunakan!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        username,
        nama_lengkap,
        password: hashedPassword,
      },
    });

    revalidatePath("/user");
    return { success: true, message: "Pengguna berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error addUserAction:", error);
    return { success: false, error: "Gagal menambahkan pengguna." };
  }
}

// ============= GET USER BY ID =============
export async function getUserById(id: number) {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nama_lengkap: true,
      }
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error getUserById:", error);
    return { success: false, error: "Gagal mengambil data pengguna." };
  }
}

// ============= EDIT USER ACTION =============
export async function editUserAction(id: number, prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const nama_lengkap = formData.get("nama_lengkap") as string;
    const password = formData.get("password") as string;

    if (!username || !nama_lengkap) {
      return { success: false, error: "Username dan Nama Lengkap wajib diisi!" };
    }

    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "Pengguna tidak ditemukan!" };
    }

    if (username !== existingUser.username) {
      const usernameCheck = await prisma.users.findUnique({
        where: { username },
      });
      if (usernameCheck) {
        return { success: false, error: "Username sudah digunakan oleh akun lain!" };
      }
    }

    let updateData: any = {
      username,
      nama_lengkap,
      updated_at: new Date(),
    };

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return { success: false, error: "Password minimal 6 karakter!" };
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.users.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/user");
    return { success: true, message: "Pengguna berhasil diperbarui!" };
  } catch (error) {
    console.error("Error editUserAction:", error);
    return { success: false, error: "Gagal memperbarui pengguna." };
  }
}

// ============= DELETE USER ACTION =============
export async function deleteUserAction(id: number) {
  try {
    await prisma.users.delete({
      where: { id },
    });
    revalidatePath("/user");
    return { success: true, message: "Pengguna berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteUserAction:", error);
    return { success: false, error: "Gagal menghapus pengguna." };
  }
}
