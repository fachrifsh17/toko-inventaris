"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MessageCircle, X } from "lucide-react"
import { getProdukDetailData } from "@/actions/publicproduk"

interface Produk {
  id: number
  nama_produk: string
  deskripsi: string | null
  harga_jual: number
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

function formatWhatsApp(nomor: string) {
  if (!nomor) return ""
  const clean = nomor.replace(/[^0-9]/g, "")
  if (clean.startsWith("0")) return "62" + clean.slice(1)
  if (clean.startsWith("62")) return clean
  if (clean.startsWith("+")) return clean.slice(1)
  return clean
}

export default function ProdukDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [pengaturan, setPengaturan] = useState<Pengaturan | null>(null)
  const [produk, setProduk] = useState<Produk | null>(null)
  const [loading, setLoading] = useState(true)
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    getProdukDetailData(id).then(({ pengaturan, produk }) => {
      setPengaturan(pengaturan)
      setProduk(produk)
      setLoading(false)
    })
  }, [id])

  const base = typeof window !== "undefined" ? window.location.origin : ""
  const produkLink = `${base}/produkpublic/${id}`
  const waNum = pengaturan?.no_wa_toko ? formatWhatsApp(pengaturan.no_wa_toko) : ""

  const waMsg = produk
    ? `*PESANAN BARU*\n\nHalo, saya ingin memesan produk berikut:\n\n1. *${produk.nama_produk}*\n  Jumlah  : 1 pcs\n  Harga   : ${formatRupiah(produk.harga_jual)}\n  Subtotal: ${formatRupiah(produk.harga_jual)}\n  Link    : ${produkLink}\n\n━━━━━━━━━━━━━━━\n*TOTAL: ${formatRupiah(produk.harga_jual)}*\n━━━━━━━━━━━━━━━\n\nMohon konfirmasi ketersediaan stok dan ongkir. Terima kasih!`
    : ""

  const waLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}` : "#"

  const sharedBg = (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        .serif { font-family: 'DM Serif Display', serif; }
        .price-gradient {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .orb { position: absolute; border-radius: 50%; pointer-events: none; }
        .page-root { font-family: 'DM Sans', sans-serif; }
        .bg-wrapper { background: #ffffff; }
        .orb-1 {
          width: 55vw; height: 55vw; max-width: 700px; max-height: 700px;
          top: -12%; right: -10%;
          background: radial-gradient(circle, rgba(244,114,182,0.42) 0%, rgba(236,72,153,0.18) 60%, transparent 100%);
          filter: blur(120px);
        }
        .orb-2 {
          width: 50vw; height: 50vw; max-width: 620px; max-height: 620px;
          top: 40%; left: -12%;
          background: radial-gradient(circle, rgba(147,197,253,0.38) 0%, rgba(96,165,250,0.16) 60%, transparent 100%);
          filter: blur(110px);
        }
        .orb-3 {
          width: 38vw; height: 38vw; max-width: 460px; max-height: 460px;
          bottom: 8%; right: 8%;
          background: radial-gradient(circle, rgba(249,168,212,0.30) 0%, rgba(244,114,182,0.12) 60%, transparent 100%);
          filter: blur(100px);
        }
        .noise-overlay {
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4;
        }
        .loading-spinner {
          border: 2px solid rgba(219,39,119,0.18);
          border-top-color: #ec4899;
        }
        .back-btn {
          background: rgba(255,255,255,0.32);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.58);
          box-shadow: 0 2px 16px rgba(219,39,119,0.06);
        }
        .product-image-card {
          background: rgba(255,255,255,0.22);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.50);
          box-shadow: 0 8px 40px rgba(219,39,119,0.10), inset 0 1px 0 rgba(255,255,255,0.55);
        }
        .product-image-inner {
          background: linear-gradient(135deg, rgba(255,255,255,0.30), rgba(252,231,243,0.20));
        }
        .product-hover-radial {
          background: radial-gradient(circle at center, rgba(236,72,153,0.07), transparent 70%);
        }
        .product-bottom-line {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
        }
        .cat-label { color: rgba(219,39,119,0.65); }
        .stock-dot-instock { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.5); }
        .stock-dot-oos { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.4); }
        .stock-text-instock { color: #059669; }
        .stock-text-oos { color: #dc2626; }
        .desc-border { border-top: 1px solid rgba(236,72,153,0.15); }
        .wa-btn-active {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          color: #fff;
          box-shadow: 0 4px 24px rgba(236,72,153,0.25);
        }
        .wa-btn-disabled {
          background: rgba(255,255,255,0.28);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.50);
          color: rgba(156,163,175,0.8);
          cursor: not-allowed;
        }
        .lightbox-overlay {
          background: rgba(8,4,20,0.82);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .lightbox-close {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.20);
        }
        .lightbox-glow {
          background: radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%);
          filter: blur(30px);
        }
        .lightbox-img {
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
        }
      `}</style>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-wrapper">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="absolute inset-0 noise-overlay" />
      </div>
    </>
  )

  if (loading) {
    return (
      <div className="pt-24 sm:pt-28 pb-12 sm:pb-20 min-h-screen flex items-center justify-center relative overflow-hidden page-root">
        {sharedBg}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full animate-spin loading-spinner" />
          <span className="text-sm text-gray-400 font-light tracking-wide">Memuat produk...</span>
        </div>
      </div>
    )
  }

  if (!produk) {
    return (
      <div className="pt-24 sm:pt-28 pb-12 sm:pb-20 min-h-screen flex items-center justify-center relative overflow-hidden page-root">
        {sharedBg}
        <div className="relative z-10 text-center">
          <div className="text-5xl sm:text-6xl mb-5">😕</div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 serif">Produk Tidak Ditemukan</h2>
          <p className="text-sm text-gray-400 font-light mt-2">Produk yang kamu cari tidak tersedia.</p>
          <Link
            href="/produkpublic"
            className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 mt-6 transition-colors"
          >
            <ArrowLeft size={15} />
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    )
  }

  const inStock = (produk.stok_sekarang ?? 0) > 0

  return (
    <div className="pt-24 sm:pt-28 pb-12 sm:pb-20 min-h-screen relative overflow-x-hidden page-root">
      {sharedBg}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <Link
          href="/produkpublic"
          className="inline-flex items-center gap-2.5 text-sm font-medium text-pink-700 rounded-full px-5 py-2.5 mb-6 sm:mb-8 transition-all duration-300 back-btn"
        >
          <ArrowLeft size={15} />
          Kembali
        </Link>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-10">
          <div
            className="aspect-square rounded-[2rem] overflow-hidden cursor-pointer group product-image-card"
            onClick={() => setShowImage(true)}
            role="button"
            tabIndex={0}
            aria-label="Lihat gambar produk"
            onKeyDown={(e) => { if (e.key === "Enter") setShowImage(true) }}
          >
            <div className="w-full h-full relative overflow-hidden product-image-inner">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 product-hover-radial" />
              <img
                src={produk.url_foto}
                alt={produk.nama_produk}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 relative z-10"
              />
              <div className="absolute inset-x-0 bottom-0 h-px product-bottom-line" />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {produk.kategori && (
              <Link
                href={`/produkpublic?kategori=${produk.kategori.slug}`}
                className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] hover:text-pink-600 transition-colors w-fit cat-label"
              >
                {produk.kategori.nama_kategori}
              </Link>
            )}

            <h1 className="serif text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-gray-900 mt-2 sm:mt-3 leading-tight">
              {produk.nama_produk}
            </h1>

            <div className="mt-4 sm:mt-5">
              <span className="price-gradient text-2xl sm:text-3xl font-semibold">
                {formatRupiah(produk.harga_jual)}
              </span>
            </div>

            <div className="flex items-center gap-2.5 mt-4">
              <div className={`h-2.5 w-2.5 rounded-full ${inStock ? "stock-dot-instock" : "stock-dot-oos"}`} />
              <span className={`text-xs sm:text-sm font-light ${inStock ? "stock-text-instock" : "stock-text-oos"}`}>
                {inStock ? `Stok tersedia (${produk.stok_sekarang})` : "Stok habis"}
              </span>
            </div>

            {produk.deskripsi && (
              <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 desc-border">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Deskripsi Produk</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed whitespace-pre-line line-clamp-4">
                  {produk.deskripsi}
                </p>
              </div>
            )}

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 sm:mt-8 flex items-center justify-center gap-2.5 font-medium px-6 sm:px-7 py-4 rounded-full text-xs sm:text-sm transition-all duration-500 w-full sm:w-auto ${!inStock || !waNum ? "pointer-events-none" : ""} ${inStock && waNum ? "wa-btn-active" : "wa-btn-disabled"}`}
            >
              <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {showImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 lightbox-overlay"
          onClick={() => setShowImage(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setShowImage(false) }}
            aria-label="Tutup gambar"
            className="absolute top-5 right-5 h-11 w-11 rounded-full flex items-center justify-center text-white transition-all duration-300 lightbox-close"
          >
            <X size={18} />
          </button>
          <div className="relative max-w-full max-h-[90vh]">
            <div className="absolute -inset-6 rounded-3xl pointer-events-none lightbox-glow" />
            <img
              src={produk?.url_foto}
              alt={produk?.nama_produk || "Foto Produk"}
              className="relative max-w-full max-h-[85vh] object-contain rounded-3xl lightbox-img"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}