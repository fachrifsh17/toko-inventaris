"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

export async function getBanners() {
  try {
    const banners = await prisma.banners.findMany({
      orderBy: { urutan: "asc" },
    });
    return { success: true, data: banners };
  } catch (error) {
    console.error("Error getBanners:", error);
    return { success: false, error: "Gagal mengambil data banner.", data: [] };
  }
}

export async function addBannerAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const judul_banner = (formData.get("judul_banner") as string)?.trim() || null;
    const link_tujuan = (formData.get("link_tujuan") as string)?.trim() || null;
    const urutan = Number(formData.get("urutan") || 0);
    const is_active = formData.get("is_active") === "true";
    
    const url_foto_uploaded = (formData.get("url_foto_uploaded") as string)?.trim() || "";
    const raw_url_foto = formData.get("url_foto");
    let url_foto_banner = url_foto_uploaded || "";

    if (
      !url_foto_banner && 
      raw_url_foto && 
      typeof (raw_url_foto as any).name === "string" &&
      (raw_url_foto as any).size > 0
    ) {
      try {
        const file: any = raw_url_foto;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = path.extname(file.name) || ".jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "banners");
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.writeFile(path.join(uploadsDir, fileName), buffer);
        url_foto_banner = `/uploads/banners/${fileName}`;
      } catch (err) {
        console.error("Error saving banner file:", err);
      }
    }

    if (!url_foto_banner) return { success: false, error: "Foto banner wajib diisi!" };

    await prisma.banners.create({
      data: {
        judul_banner,
        url_foto_banner,
        link_tujuan,
        urutan,
        is_active,
      },
    });

    revalidatePath("/banners");
    return { success: true, message: "Banner berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error addBannerAction:", error);
    return { success: false, error: "Gagal menambahkan banner." };
  }
}

export async function editBannerAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) return { success: false, error: "ID tidak valid." };

    const judul_banner = (formData.get("judul_banner") as string)?.trim() || null;
    const link_tujuan = (formData.get("link_tujuan") as string)?.trim() || null;
    const urutan = Number(formData.get("urutan") || 0);
    const is_active = formData.get("is_active") === "true";

    const existing = await prisma.banners.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Banner tidak ditemukan." };

    const url_foto_uploaded = (formData.get("url_foto_uploaded") as string)?.trim() || "";
    const raw_url_foto = formData.get("url_foto");
    
    let url_foto_banner = existing.url_foto_banner;
    let apakah_foto_berubah = false;

    if (url_foto_uploaded && url_foto_uploaded !== existing.url_foto_banner) {
      url_foto_banner = url_foto_uploaded;
      apakah_foto_berubah = true;
    } else if (
      raw_url_foto &&
      typeof (raw_url_foto as any).name === "string" &&
      (raw_url_foto as any).size > 0
    ) {
      try {
        const file: any = raw_url_foto;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = path.extname(file.name) || ".jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "banners");
        
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.writeFile(path.join(uploadsDir, fileName), buffer);
        
        url_foto_banner = `/uploads/banners/${fileName}`;
        apakah_foto_berubah = true;
      } catch (err) {
        console.error("Error saving banner file:", err);
        return { success: false, error: "Gagal menyimpan file foto baru." };
      }
    }

    if (apakah_foto_berubah && existing.url_foto_banner && existing.url_foto_banner.startsWith("/uploads/")) {
      try {
        const oldFilePath = path.join(process.cwd(), "public", existing.url_foto_banner);
        await fs.unlink(oldFilePath);
      } catch (unlinkErr) {
        console.error("Gagal menghapus file foto lama dari server:", unlinkErr);
      }
    }

    await prisma.banners.update({
      where: { id },
      data: {
        judul_banner,
        link_tujuan,
        urutan,
        is_active,
        url_foto_banner,
        updated_at: new Date(),
      },
    });

    revalidatePath("/banners");
    return { success: true, message: "Banner berhasil diperbarui!" };
  } catch (error) {
    console.error("Error editBannerAction:", error);
    return { success: false, error: "Gagal memperbarui banner." };
  }
}

export async function deleteBannerAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    if (isNaN(id) || id <= 0) return { success: false, error: "ID tidak valid." };

    const existing = await prisma.banners.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Banner tidak ditemukan." };

    await prisma.banners.delete({ where: { id } });

    if (existing.url_foto_banner && existing.url_foto_banner.startsWith("/uploads/")) {
      try {
        const oldFilePath = path.join(process.cwd(), "public", existing.url_foto_banner);
        await fs.unlink(oldFilePath);
      } catch (unlinkErr) {
        console.error("Gagal menghapus file foto saat hapus banner:", unlinkErr);
      }
    }

    revalidatePath("/banners");
    return { success: true, message: "Banner berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteBannerAction:", error);
    return { success: false, error: "Gagal menghapus banner." };
  }
}