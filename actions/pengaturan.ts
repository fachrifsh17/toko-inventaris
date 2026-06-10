"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

export async function getPengaturan() {
  try {
    let pengaturan = await prisma.pengaturan.findFirst();

    if (!pengaturan) {
      pengaturan = await prisma.pengaturan.create({
        data: {
          nama_toko: "Toko",
          tagline: "Tagline Toko",
          no_wa_toko: "628123456789",
          email: "admin@gmail.com",
        },
      });
    }

    return {
      success: true,
      data: pengaturan,
    };
  } catch (error) {
    console.error("Error getPengaturan:", error);
    return {
      success: false,
      error: "Gagal mengambil data pengaturan",
    };
  }
}

export async function updatePengaturanAction(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) {
      return { success: false, error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const id = Number(formData.get("id"));
    const nama_toko = formData.get("nama_toko") as string;
    const tagline = formData.get("tagline") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const no_wa_toko = formData.get("no_wa_toko") as string;
    const email = formData.get("email") as string;
    const link_instagram = formData.get("link_instagram") as string;
    const link_facebook = formData.get("link_facebook") as string;
    const link_tiktok = formData.get("link_tiktok") as string;
    const alamat = formData.get("alamat") as string;
    const embed_maps = formData.get("embed_maps") as string;

    const logoFile = formData.get("url_logo") as File | null;
    let url_logo: string | null = null;

    const currentPengaturan = await prisma.pengaturan.findUnique({
      where: { id },
    });

    if (logoFile && logoFile.size > 0 && logoFile.name !== "undefined") {
      if (currentPengaturan?.url_logo) {
        const oldPath = path.join(process.cwd(), "public", currentPengaturan.url_logo);
        await fs.unlink(oldPath).catch(() => {});
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads", "logo");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileExt = path.extname(logoFile.name) || ".png";
      const fileName = `logo-${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(filePath, buffer);

      url_logo = `/uploads/logo/${fileName}`;
    } else {
      url_logo = currentPengaturan?.url_logo || null;
    }

    if (!nama_toko || !no_wa_toko) {
      return {
        success: false,
        error: "Nama Toko dan Nomor WhatsApp wajib diisi!",
      };
    }

    await prisma.pengaturan.update({
      where: { id },
      data: {
        nama_toko,
        tagline: tagline || null,
        deskripsi: deskripsi || null,
        no_wa_toko,
        email: email || null,
        url_logo,
        link_instagram: link_instagram || null,
        link_facebook: link_facebook || null,
        link_tiktok: link_tiktok || null,
        alamat: alamat || null,
        embed_maps: embed_maps || null,
        updated_at: new Date(),
      },
    });

    revalidatePath("/dashboard/pengaturan");
    revalidatePath("/dashboard");
    revalidatePath("/pengaturan");
    revalidatePath("/login");
    revalidatePath("/");

    return {
      success: true,
      message: "Pengaturan toko berhasil disimpan!",
    };
  } catch (error) {
    console.error("Error updatePengaturan:", error);
    return {
      success: false,
      error: "Gagal menyimpan pengaturan toko.",
    };
  }
}