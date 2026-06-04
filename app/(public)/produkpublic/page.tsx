"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X, ChevronDown, PackageSearch } from "lucide-react"
import { getPengaturan, getKategoriList } from "@/actions/public"
import { getProdukPublic } from "@/actions/publicproduk"

interface Produk {
  id: number
  nama_produk: string
  harga_jual: number
  url_foto: string
  kategori: { nama_kategori: string; slug: string } | null
}

interface Kategori {
  id: number
  nama_kategori: string
  slug: string
}

interface Pengaturan {
  nama_toko: string | null
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(num)
}

export default function ProdukPage() {
  const searchParams = useSearchParams()
  const activeKategori = searchParams.get("kategori") || "semua"

  const [pengaturan, setPengaturan] = useState<Pengaturan | null>(null)
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [produk, setProduk] = useState<Produk[]>([])
  const [semuaProduk, setSemuaProduk] = useState<Produk[]>([])
  const [search, setSearch] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    getProdukPublic("semua").then((pr) => setSemuaProduk(pr))
  }, [])

  useEffect(() => {
    async function load() {
      const [p, k, pr] = await Promise.all([
        getPengaturan(),
        getKategoriList(),
        getProdukPublic(activeKategori)
      ])
      setPengaturan(p)
      setKategoriList(k)
      setProduk(pr)
    }
    load()
  }, [activeKategori])

  const filtered = produk.filter((p) =>
    p.nama_produk.toLowerCase().includes(search.toLowerCase())
  )

  const activeLabel =
    activeKategori === "semua"
      ? "Semua Produk"
      : kategoriList.find((k) => k.slug === activeKategori)?.nama_kategori || "Semua Produk"

  return (
    <div className="bg-white text-gray-900 selection:bg-violet-200 selection:text-violet-900 min-h-screen font-sans antialiased pt-24 sm:pt-28 pb-16 sm:pb-24 relative">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8 sm:mb-12 border-b border-violet-100 pb-8">
          <span className="text-[11px] font-medium text-violet-500 uppercase tracking-widest">
            Katalog {pengaturan?.nama_toko || ""}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-gray-900 mt-2">
            Semua Produk
          </h1>
          <p className="text-sm text-gray-500 font-light mt-3 max-w-xl leading-relaxed">
            Temukan rangkaian perawatan kulit yang disempurnakan. Diformulasikan khusus untuk menjaga dan memancarkan pesona alami Anda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
          <div className="relative flex-1 max-w-md w-full">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari produk spesifik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300 transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 bg-white border rounded-xl px-5 py-3 text-sm transition-all min-w-[160px] sm:min-w-[180px] justify-between shadow-sm ${
                activeKategori !== "semua"
                  ? "border-violet-300 text-violet-700 bg-violet-50/30"
                  : "border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal size={15} />
                <span className="truncate font-medium">{activeLabel}</span>
              </div>
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform duration-300 ${showFilter ? "rotate-180" : ""}`}
              />
            </button>

            {showFilter && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-2 z-50 transform origin-top transition-all">
                <Link
                  href="/produkpublic"
                  onClick={() => setShowFilter(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeKategori === "semua"
                      ? "bg-violet-50 text-violet-700 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span>Semua Produk</span>
                  <span className={`text-[11px] ${activeKategori === "semua" ? "text-violet-500" : "text-gray-400"}`}>
                    {semuaProduk.length}
                  </span>
                </Link>
                
                {kategoriList.length > 0 && <div className="h-px bg-gray-100 my-1 mx-2" />}

                {kategoriList.map((k) => {
                  const count = semuaProduk.filter(
                    (p) => p.kategori?.slug === k.slug
                  ).length
                  const isActive = activeKategori === k.slug

                  return (
                    <Link
                      key={k.id}
                      href={`/produkpublic?kategori=${k.slug}`}
                      onClick={() => setShowFilter(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span>{k.nama_kategori}</span>
                      <span className={`text-[11px] ${isActive ? "text-violet-500" : "text-gray-400"}`}>
                        {count}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 sm:py-32 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white border border-gray-100 mb-5 shadow-sm">
              <PackageSearch size={28} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 font-serif">
              Koleksi Tidak Ditemukan
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto font-light">
              Kami tidak dapat menemukan produk yang sesuai dengan pencarian Anda. Silakan coba kata kunci lain.
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-6 text-sm font-medium text-violet-600 hover:text-violet-700 underline underline-offset-4"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        ) : (
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/produkpublic/${p.id}`}
                className="group"
              >
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-500 group-hover:border-violet-300 group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)]">
                  <div className="aspect-square bg-gray-50 p-3 sm:p-4">
                    <div className="w-full h-full rounded-xl overflow-hidden">
                      <img
                        src={p.url_foto}
                        alt={p.nama_produk}
                        className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    {p.kategori && (
                      <span className="text-[10px] font-medium text-violet-500 uppercase tracking-wider">
                        {p.kategori.nama_kategori}
                      </span>
                    )}
                    <h3 className="text-xs sm:text-sm font-normal text-gray-800 mt-1 line-clamp-2 group-hover:text-violet-700 transition-colors duration-300 leading-snug min-h-[2.5em]">
                      {p.nama_produk}
                    </h3>
                    <p className="text-sm sm:text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mt-2">
                      {formatRupiah(p.harga_jual)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}