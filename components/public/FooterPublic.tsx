"use client"

import Link from "next/link"
import { MapPin, Phone, Mail } from "lucide-react"

interface Pengaturan {
  nama_toko: string | null
  tagline: string | null
  alamat: string | null
  no_wa_toko: string
  email: string | null
  link_instagram: string | null
  link_facebook: string | null
  link_tiktok: string | null
  url_logo: string | null
}

interface Kategori {
  id: number
  nama_kategori: string
  slug: string
}

export default function FooterPublic({
  pengaturan,
  kategoriList
}: {
  pengaturan: Pengaturan | null
  kategoriList: Kategori[]
}) {
  const waLink = `https://wa.me/${pengaturan?.no_wa_toko?.replace(/^0/, "62") || ""}`

  return (
    <footer className="relative overflow-hidden footer-root">
      <style jsx global>{`
        .footer-root { font-family: 'DM Sans', sans-serif; }
        .footer-top-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(236,72,153,0.25), rgba(147,197,253,0.20), transparent);
        }
        .footer-gradient-overlay {
          background: linear-gradient(180deg, rgba(245,224,235,0.0) 0%, rgba(242,220,232,0.55) 100%);
        }
        .footer-orb-pink {
          background: radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%);
          filter: blur(100px);
        }
        .footer-orb-blue {
          background: radial-gradient(circle, rgba(147,197,253,0.14) 0%, transparent 70%);
          filter: blur(90px);
        }
        .footer-orb-light {
          background: radial-gradient(circle, rgba(249,168,212,0.12) 0%, transparent 70%);
          filter: blur(80px);
        }
        .footer-logo-img {
          border: 1px solid rgba(255,255,255,0.65);
          box-shadow: 0 2px 12px rgba(219,39,119,0.10);
        }
        .footer-logo-fallback {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          box-shadow: 0 4px 16px rgba(236,72,153,0.28);
        }
        .footer-social-icon {
          background: rgba(255,255,255,0.30);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.55);
        }
        .footer-contact-icon {
          background: rgba(236,72,153,0.10);
          border: 1px solid rgba(236,72,153,0.15);
        }
        .footer-bottom-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(236,72,153,0.22), rgba(147,197,253,0.18), transparent);
        }
      `}</style>

      <div className="footer-top-line" />

      <div className="absolute inset-0 pointer-events-none footer-gradient-overlay" />
      <div className="absolute bottom-0 left-[5%] w-[350px] h-[350px] rounded-full pointer-events-none footer-orb-pink" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full pointer-events-none footer-orb-blue" />
      <div className="absolute top-0 left-[40%] w-[200px] h-[200px] rounded-full pointer-events-none footer-orb-light" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-8 sm:pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
              {pengaturan?.url_logo ? (
                <img
                  src={pengaturan.url_logo}
                  alt={pengaturan.nama_toko || "Store"}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover footer-logo-img"
                />
              ) : (
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm footer-logo-fallback">
                  {pengaturan?.nama_toko?.charAt(0) || "G"}
                </div>
              )}
              <span className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                {pengaturan?.nama_toko || "Toko"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-[200px] sm:max-w-none">
              {pengaturan?.tagline || "Pancarkan Pesona Alami Kulitmu"}
            </p>

            <div className="flex items-center gap-2.5 sm:gap-3 mt-5">
              {pengaturan?.link_instagram && (
                <a
                  href={pengaturan.link_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-pink-600 transition-all duration-300 footer-social-icon"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {pengaturan?.link_facebook && (
                <a
                  href={pengaturan.link_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-pink-600 transition-all duration-300 footer-social-icon"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {pengaturan?.link_tiktok && (
                <a
                  href={pengaturan.link_tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-pink-600 transition-all duration-300 footer-social-icon"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.2 8.2 0 0 0 4.76 1.52V6.79a4.84 4.84 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-4 text-pink-700">
              Kategori
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/produkpublic"
                  className="text-xs sm:text-sm text-gray-700 hover:text-pink-700 transition-colors duration-200 font-medium"
                >
                  Semua Produk
                </Link>
              </li>
              {kategoriList.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/produkpublic?kategori=${k.slug}`}
                    className="text-xs sm:text-sm text-gray-700 hover:text-pink-700 transition-colors duration-200 font-medium"
                  >
                    {k.nama_kategori}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-4 text-pink-700">
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs sm:text-sm text-gray-700 hover:text-pink-700 transition-colors duration-200 font-medium">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/produkpublic" className="text-xs sm:text-sm text-gray-700 hover:text-pink-700 transition-colors duration-200 font-medium">
                  Produk
                </Link>
              </li>
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-gray-700 hover:text-pink-700 transition-colors duration-200 font-medium"
                >
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-4 text-pink-700">
              Kontak
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 footer-contact-icon">
                  <Phone size={12} className="text-pink-600" />
                </div>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-gray-700 hover:text-pink-700 transition-colors duration-200 font-medium leading-relaxed pt-0.5"
                >
                  {pengaturan?.no_wa_toko || "-"}
                </a>
              </li>
              {pengaturan?.email && (
                <li className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 footer-contact-icon">
                    <Mail size={12} className="text-pink-600" />
                  </div>
                  <a
                    href={`mailto:${pengaturan.email}`}
                    className="text-xs sm:text-sm text-gray-700 hover:text-pink-700 transition-colors duration-200 font-medium leading-relaxed pt-0.5 break-all"
                  >
                    {pengaturan.email}
                  </a>
                </li>
              )}
              {pengaturan?.alamat && (
                <li className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 footer-contact-icon">
                    <MapPin size={12} className="text-pink-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed pt-0.5">
                    {pengaturan.alamat}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="relative mt-12 sm:mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="absolute top-0 left-0 right-0 footer-bottom-line" />
          <p className="text-[11px] sm:text-xs text-gray-500 text-center sm:text-left font-medium">
            © {new Date().getFullYear()} {pengaturan?.nama_toko || "Toko"}. All rights reserved.
          </p>
          <p className="text-[11px] sm:text-xs font-medium text-pink-500">
            Crafted with care for your skin
          </p>
        </div>
      </div>
    </footer>
  )
}