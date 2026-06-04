"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Shield,
  Heart,
  MessageCircle,
  MapPin
} from "lucide-react"
import { getPengaturan, getBanners } from "@/actions/public"
import { getProdukTerbaru } from "@/actions/publicproduk"

interface Pengaturan {
  nama_toko: string | null
  tagline: string | null
  deskripsi: string | null
  no_wa_toko: string
  alamat: string | null
  embed_maps: string | null
}

interface Banner {
  id: number
  judul_banner: string | null
  url_foto_banner: string
  link_tujuan: string | null
}

interface Produk {
  id: number
  nama_produk: string
  harga_jual: number
  url_foto: string
  kategori: { nama_kategori: string; slug: string } | null
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(num)
}

function extractMapSrc(html: string): string | null {
  const match = html.match(/src="([^"]+)"/)
  return match ? match[1] : null
}

function MapEmbed({ html }: { html: string }) {
  const src = extractMapSrc(html)
  if (!src) return null
  return (
    <div className="mt-6 rounded-2xl overflow-hidden border border-violet-100 aspect-video">
      <iframe
        src={src}
        width="100%"
        height="100%"
        className="border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Lokasi Toko"
      />
    </div>
  )
}

export default function HomePage() {
  const [pengaturan, setPengaturan] = useState<Pengaturan | null>(null)
  const [banners, setBanners] = useState<Banner[]>([])
  const [produk, setProduk] = useState<Produk[]>([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [bannerTransitioning, setBannerTransitioning] = useState(false)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    async function load() {
      const [p, b, pr] = await Promise.all([
        getPengaturan(),
        getBanners(),
        getProdukTerbaru(8)
      ])
      setPengaturan(p)
      setBanners(b)
      setProduk(pr)
    }
    load()
  }, [])

  const goBanner = useCallback(
    (index: number) => {
      if (bannerTransitioning) return
      setBannerTransitioning(true)
      setCurrentBanner(index)
      setTimeout(() => setBannerTransitioning(false), 500)
    },
    [bannerTransitioning]
  )

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      goBanner((currentBanner + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length, currentBanner, goBanner])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) < 50) return
    if (diff > 0) {
      goBanner((currentBanner + 1) % banners.length)
    } else {
      goBanner((currentBanner - 1 + banners.length) % banners.length)
    }
  }

  const waLink = `https://wa.me/${pengaturan?.no_wa_toko?.replace(/^0/, "62") || ""}`
  const waMessage = `Halo ${pengaturan?.nama_toko || "GlowAura SkinLab"}, saya ingin bertanya tentang produk Anda.`

  return (
    <div className="bg-white text-gray-900 selection:bg-violet-200 selection:text-violet-900 min-h-screen font-sans antialiased">

      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 border-b border-violet-100 bg-gradient-to-b from-violet-50/50 to-white overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-200/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200/80 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <Sparkles size={13} className="text-violet-600 animate-pulse" />
            <span className="text-[11px] font-medium text-violet-700 tracking-widest uppercase">
              {pengaturan?.tagline || "Pancarkan Pesona Alami Kulitmu"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-gray-900 mb-6 leading-[1.1]">
            {pengaturan?.nama_toko || "GlowAura"}{" "}
            <span className="font-serif italic bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent block sm:inline">
              SkinLab
            </span>
          </h1>

          {pengaturan?.deskripsi && (
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
              {pengaturan.deskripsi}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link
              href="/produkpublic"
              className="group w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium px-8 py-4 rounded-full text-sm hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Jelajahi Produk
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <a
              href={`${waLink}?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white border border-violet-200 text-violet-700 font-medium px-8 py-4 rounded-full text-sm hover:bg-violet-50 hover:border-violet-300 transition-all duration-300 text-center shadow-sm"
            >
              Konsultasi Gratis
            </a>
          </div>

          <div className="mt-16 pt-12 border-t border-violet-100 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { value: "100%", label: "Original Brand" },
              { value: "BPOM", label: "Certified Safe" },
              { value: "Cruelty", label: "Free Formula" }
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-sm font-semibold text-violet-700 tracking-wider uppercase">
                  {item.value}
                </div>
                <div className="text-[11px] text-gray-400 font-light mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div
            className="relative rounded-2xl overflow-hidden aspect-[16/7] sm:aspect-[21/8] bg-violet-50 group shadow-inner"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {banners.map((banner, index) => (
              <a
                key={banner.id}
                href={banner.link_tujuan || "#"}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  index === currentBanner ? "opacity-100 scale-100" : "opacity-0 scale-102 pointer-events-none"
                }`}
              >
                <img
                  src={banner.url_foto_banner}
                  alt={banner.judul_banner || "Banner"}
                  className="w-full h-full object-cover brightness-[0.95]"
                />
                {banner.judul_banner && (
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent flex items-end p-6 sm:p-12">
                    <h3 className="text-lg sm:text-2xl font-light tracking-wide text-white font-serif">
                      {banner.judul_banner}
                    </h3>
                  </div>
                )}
              </a>
            ))}

            {banners.length > 1 && (
              <>
                <button
                  onClick={() => goBanner((currentBanner - 1 + banners.length) % banners.length)}
                  aria-label="Slide sebelumnya"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/90 backdrop-blur-md border border-violet-200/50 flex items-center justify-center text-violet-800 transition-all duration-300 shadow-sm hover:bg-violet-50 hover:text-violet-600 z-20"
                >
                  <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={() => goBanner((currentBanner + 1) % banners.length)}
                  aria-label="Slide selanjutnya"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/90 backdrop-blur-md border border-violet-200/50 flex items-center justify-center text-violet-800 transition-all duration-300 shadow-sm hover:bg-violet-50 hover:text-violet-600 z-20"
                >
                  <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goBanner(index)}
                      aria-label={`Lihat banner ${index + 1}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentBanner ? "w-8 bg-violet-600" : "w-1.5 bg-white/60 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {produk.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 border-b border-violet-100 pb-6 gap-4">
            <div>
              <span className="text-[11px] font-medium text-violet-500 uppercase tracking-widest">
                Our Collection
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 tracking-tight mt-1">
                Rekomendasi Terbaru
              </h2>
            </div>
            <Link
              href="/produkpublic"
              className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-purple-700 transition-colors shrink-0"
            >
              Lihat Semua Koleksi
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {produk.map((p) => (
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
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 my-8 bg-violet-50/50 rounded-3xl border border-violet-100/50">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <span className="text-[11px] font-medium text-violet-600 uppercase tracking-widest">
              Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 tracking-tight mt-2">
              Mengapa Memilih {pengaturan?.nama_toko || "GlowAura"}?
            </h2>
            <p className="text-sm sm:text-base text-gray-500 font-light leading-relaxed mt-4">
              {pengaturan?.deskripsi ||
                "Kami berkomitmen menghadirkan produk perawatan kulit berkualitas tinggi yang aman dan efektif. Setiap produk dirancang dengan teliti untuk memberikan hasil terbaik bagi kulit Anda."}
            </p>
          </div>

          <div className="md:col-span-6 md:col-start-7 space-y-4">
            {[
              {
                icon: Leaf,
                title: "Bahan Alami Pilihan",
                desc: "Formulasi dengan bahan-bahan alami terpilih untuk menjaga skin-barrier sehat."
              },
              {
                icon: Shield,
                title: "Teruji Secara Klinis",
                desc: "Setiap produk melewati uji dermatologi ketat untuk keamanan optimal kulit Anda."
              },
              {
                icon: Heart,
                title: "Dibuat Untuk Semua Kulit",
                desc: "Dirancang secara inklusif untuk semua jenis kulit, bahkan yang paling sensitif sekalipun."
              }
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-violet-200 hover:bg-white transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-white border border-violet-100 flex items-center justify-center shrink-0 shadow-sm text-violet-600">
                  <f.icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-light mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <span className="text-[11px] font-medium text-violet-600 uppercase tracking-widest">
            Support & Location
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 tracking-tight mt-2">
            Butuh Bantuan Lebih Lanjut?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light mt-2 max-w-md mx-auto">
            Konsultan kulit kami siap membantu merancang rutinitas yang tepat untuk Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <a
            href={`${waLink}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 hover:border-violet-300 transition-all duration-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.08)] block relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

            <div className="h-12 w-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 text-violet-600 transition-colors duration-300 shadow-sm">
              <MessageCircle size={22} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 font-serif">
              Layanan WhatsApp
            </h3>
            <p className="text-sm text-gray-700 font-medium mt-2">
              {pengaturan?.no_wa_toko || "-"}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 font-light mt-1">
              Responsif di jam operasional kerja (09.00 - 17.00).
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-violet-600 tracking-wider uppercase group-hover:gap-3 transition-all duration-300">
              Mulai Konsultasi →
            </div>
          </a>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10" />

            <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-6 shadow-sm">
              <MapPin size={22} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 font-serif">
              Studio & Lab
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-2 leading-relaxed">
              {pengaturan?.alamat || "Belum ada alamat terdaftar"}
            </p>
            {pengaturan?.embed_maps && (
              <MapEmbed html={pengaturan.embed_maps} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}