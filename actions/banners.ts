"use server";

import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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

    if (!url_foto_banner && raw_url_foto && typeof (raw_url_foto as any).name === "string" && (raw_url_foto as any).size > 0) {
      const file = raw_url_foto as File;
      const fileExt = file.name.split(".").pop();
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      url_foto_banner = data.publicUrl;
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

    if (url_foto_uploaded && url_foto_uploaded !== existing.url_foto_banner) {
      url_foto_banner = url_foto_uploaded;
    } else if (raw_url_foto && typeof (raw_url_foto as any).name === "string" && (raw_url_foto as any).size > 0) {
      const file = raw_url_foto as File;
      const fileExt = file.name.split(".").pop();
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      url_foto_banner = data.publicUrl;
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

    revalidatePath("/banners");
    return { success: true, message: "Banner berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleteBannerAction:", error);
    return { success: false, error: "Gagal menghapus banner." };
  }
}