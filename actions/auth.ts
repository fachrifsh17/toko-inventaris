"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username dan password wajib diisi!" };
  }

  try {
    const user = await prisma.users.findUnique({
      where: { username: username },
    });

    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(
          "dummy",
          "$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhash",
        );

    if (!user || !isPasswordValid) {
      return { error: "Username atau password salah!" };
    }

    const cookieStore = await cookies();
    
    const INACTIVITY_TIMEOUT = 60 * 60 * 3; 

    cookieStore.set("user_session", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: INACTIVITY_TIMEOUT, 
    });
  } catch (error) {
    return { error: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  redirect("/login");
}