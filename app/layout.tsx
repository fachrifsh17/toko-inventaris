// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getCachedPengaturan = unstable_cache(
  async () => {
    return prisma.pengaturan.findFirst({
      select: { nama_toko: true },
    });
  },
  ["pengaturan-metadata"],
  { revalidate: 3600 }
);

export async function generateMetadata(): Promise<Metadata> {
  const pengaturan = await getCachedPengaturan();
  const namaToko = pengaturan?.nama_toko || "";

  return {
    title: {
      default: namaToko,
      template: `%s | ${namaToko}`,
    },
    description: "Kelola operasional dan persediaan produk dengan mudah dan modern.",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}