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
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              {pengaturan?.url_logo ? (
                <img
                  src={pengaturan.url_logo}
                  alt={pengaturan.nama_toko || "Store"}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  {pengaturan?.nama_toko?.charAt(0) || "G"}
                </div>
              )}
              <span className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                {pengaturan?.nama_toko || "GlowAura SkinLab"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              {pengaturan?.tagline || "Pancarkan Pesona Alami Kulitmu"}
            </p>
            <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5">
              {pengaturan?.link_instagram && (
                <a
                  href={pengaturan.link_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-300 transition-all"
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
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-300 transition-all"
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
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-300 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.2 8.2 0 0 0 4.76 1.52V6.79a4.84 4.84 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3 sm:mb-4">
              Kategori
            </h4>
            <ul className="space-y-1.5 sm:space-y-2.5">
              <li>
                <Link
                  href="/produkpublic"
                  className="text-xs sm:text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Semua Produk
                </Link>
              </li>
              {kategoriList.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/produkpublic?kategori=${k.slug}`}
                    className="text-xs sm:text-sm text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {k.nama_kategori}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3 sm:mb-4">
              Navigasi
            </h4>
            <ul className="space-y-1.5 sm:space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-xs sm:text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/produkpublic"
                  className="text-xs sm:text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Produk
                </Link>
              </li>
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3 sm:mb-4">
              Kontak
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <Phone size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {pengaturan?.no_wa_toko || "-"}
                </a>
              </li>
              {pengaturan?.email && (
                <li className="flex items-start gap-2 sm:gap-3">
                  <Mail size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <a
                    href={`mailto:${pengaturan.email}`}
                    className="text-xs sm:text-sm text-gray-400 hover:text-gray-900 transition-colors break-all"
                  >
                    {pengaturan.email}
                  </a>
                </li>
              )}
              {pengaturan?.alamat && (
                <li className="flex items-start gap-2 sm:gap-3">
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {pengaturan.alamat}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-gray-300 text-center sm:text-left">
            © {new Date().getFullYear()}{" "}
            {pengaturan?.nama_toko || "GlowAura SkinLab"}. All rights reserved.
          </p>
          <p className="text-[10px] sm:text-xs text-gray-300">
            Crafted with care for your skin
          </p>
        </div>
      </div>
    </footer>
  )
}