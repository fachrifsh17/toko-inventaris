"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"

interface Pengaturan {
  nama_toko: string | null
  url_logo: string | null
  no_wa_toko: string
}

interface Kategori {
  id: number
  nama_kategori: string
  slug: string
}

export default function NavbarPublic({
  pengaturan,
  kategoriList
}: {
  pengaturan: Pengaturan | null
  kategoriList: Kategori[]
}) {
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const waLink = `https://wa.me/${pengaturan?.no_wa_toko?.replace(/^0/, "62") || ""}`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
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
          <span className="text-sm sm:text-lg font-semibold tracking-tight text-gray-900 truncate max-w-[120px] sm:max-w-none">
            {pengaturan?.nama_toko || "Toko"}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Beranda
          </Link>
          {kategoriList.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Produk
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="bg-white border border-gray-200 rounded-xl p-2 min-w-[200px] shadow-xl">
                    <Link
                      href="/produkpublic"
                      onClick={() => setDropOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Semua Produk
                    </Link>
                    {kategoriList.map((k) => (
                      <Link
                        key={k.id}
                        href={`/produkpublic?kategori=${k.slug}`}
                        onClick={() => setDropOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {k.nama_kategori}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/produkpublic"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Produk
            </Link>
          )}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)] transition-all duration-300"
          >
            Hubungi Kami
          </a>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-500 hover:text-gray-900"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 sm:px-6 py-4 space-y-2">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block text-sm text-gray-500 hover:text-gray-900 py-2"
          >
            Beranda
          </Link>
          {kategoriList.length > 0 ? (
            <div>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-gray-900 py-2 transition-colors"
              >
                Produk
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropOpen && (
                <div className="pl-4 space-y-0.5 pb-2">
                  <Link
                    href="/produkpublic"
                    onClick={() => { setOpen(false); setDropOpen(false) }}
                    className="block text-sm text-gray-400 hover:text-gray-900 py-1.5 transition-colors"
                  >
                    Semua Produk
                  </Link>
                  {kategoriList.map((k) => (
                    <Link
                      key={k.id}
                      href={`/produkpublic?kategori=${k.slug}`}
                      onClick={() => { setOpen(false); setDropOpen(false) }}
                      className="block text-sm text-gray-400 hover:text-gray-900 py-1.5 transition-colors"
                    >
                      {k.nama_kategori}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/produkpublic"
              onClick={() => setOpen(false)}
              className="block text-sm text-gray-500 hover:text-gray-900 py-2"
            >
              Produk
            </Link>
          )}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium px-5 py-2.5 rounded-full mt-3"
          >
            Hubungi Kami
          </a>
        </div>
      )}
    </header>
  )
}