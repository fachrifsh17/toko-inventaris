"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MessageCircle, ShoppingBag, X } from "lucide-react"
import { getPengaturan } from "@/actions/public"
import { getProdukBySlug } from "@/actions/publicproduk"

interface Produk {
  id: number
  nama_produk: string
  deskripsi: string | null
  harga_jual: number
  harga_modal: number
  stok_sekarang: number | null
  url_foto: string
  kategori: { nama_kategori: string; slug: string } | null
}

interface Pengaturan {
  nama_toko: string | null
  no_wa_toko: string
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(num)
}

export default function ProdukDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [pengaturan, setPengaturan] = useState<Pengaturan | null>(null)
  const [produk, setProduk] = useState<Produk | null>(null)
  const [loading, setLoading] = useState(true)
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    async function load() {
      const [p, pr] = await Promise.all([
        getPengaturan(),
        getProdukBySlug(id)
      ])
      setPengaturan(p)
      setProduk(pr)
      setLoading(false)
    }
    load()
  }, [id])

  const produkLink = typeof window !== "undefined" ? window.location.href : ""

  const waLink = `https://wa.me/${
    pengaturan?.no_wa_toko?.replace(/^0/, "62") || ""
  }?text=${encodeURIComponent(
    `Halo ${pengaturan?.nama_toko || "Toko"}, saya ingin memesan:\n\n*${produk?.nama_produk}*\nHarga: ${produk ? formatRupiah(produk.harga_jual) : ""}\n\nLink: ${produkLink}\n\nMohon info ketersediaan stok. Terima kasih!`
  )}`

  if (loading) {
    return (
      <div className="pt-24 sm:pt-28 pb-12 sm:pb-20 min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-violet-200/30 rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="relative z-10 h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!produk) {
    return (
      <div className="pt-24 sm:pt-28 pb-12 sm:pb-20 min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-violet-200/30 rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="relative z-10 text-center">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">😕</div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-700">
            Produk Tidak Ditemukan
          </h2>
          <Link
            href="/produkpublic"
            className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 mt-4"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </div>
      </div>
    )
  }

  const inStock = (produk.stok_sekarang ?? 0) > 0

  return (
    <div className="pt-24 sm:pt-28 pb-12 sm:pb-20 min-h-screen bg-white relative overflow-hidden">
      <div className="absolute top-20 right-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-violet-200/30 rounded-full blur-[100px] sm:blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[200px] sm:w-[350px] h-[200px] sm:h-[300px] bg-purple-200/20 rounded-full blur-[80px] sm:blur-[100px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <Link
          href="/produkpublic"
          className="inline-flex items-center gap-2.5 text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-full px-5 py-2.5 transition-all duration-200 mb-6 sm:mb-8"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-10">
          <div 
            className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group"
            onClick={() => setShowImage(true)}
            role="button"
            tabIndex={0}
            aria-label="Lihat gambar produk"
            onKeyDown={(e) => { if (e.key === "Enter") setShowImage(true) }}
          >
            <img
              src={produk.url_foto}
              alt={produk.nama_produk}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-col justify-center">
            {produk.kategori && (
              <Link
                href={`/produkpublic?kategori=${produk.kategori.slug}`}
                className="text-[10px] sm:text-xs font-medium text-violet-600 uppercase tracking-widest hover:text-violet-700 transition-colors w-fit"
              >
                {produk.kategori.nama_kategori}
              </Link>
            )}

            <h1 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-gray-900 mt-2 sm:mt-3">
              {produk.nama_produk}
            </h1>

            <div className="mt-3 sm:mt-4">
              <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {formatRupiah(produk.harga_jual)}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3 sm:mt-4">
              <div
                className={`h-2 w-2 rounded-full ${
                  inStock ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`text-xs sm:text-sm ${
                  inStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {inStock
                  ? `Stok tersedia (${produk.stok_sekarang})`
                  : "Stok habis"}
              </span>
            </div>

            {produk.deskripsi && (
              <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Deskripsi Produk
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed whitespace-pre-line line-clamp-4">
                  {produk.deskripsi}
                </p>
              </div>
            )}

            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 font-medium px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm transition-all duration-300 ${
                  inStock
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-[0_0_40px_-5px_rgba(139,92,246,0.4)]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                }`}
              >
                <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                Pesan via WhatsApp
              </a>
              <button
                disabled={!inStock}
                aria-label="Tambah ke keranjang"
                className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-medium border transition-all duration-300 ${
                  inStock
                    ? "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    : "border-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                Tambah
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowImage(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowImage(false)
            }}
            aria-label="Tutup gambar"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={produk?.url_foto}
            alt={produk?.nama_produk || "Foto Produk"}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}