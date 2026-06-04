"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function kuncianServer() {
  const cookieStore = await cookies();
  const session = cookieStore.get("user_session");

  // Jika tidak ada session, langsung arahkan ke halaman login
  if (!session) {
    redirect("/login"); 
  }

  // Mengembalikan nilai session agar bisa digunakan oleh fungsi pemanggil
  return session;
}