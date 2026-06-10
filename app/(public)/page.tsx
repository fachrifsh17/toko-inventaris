"use client"
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Smartphone,
  MessageCircle,
  MapPin,
  ShoppingBag,
  Package,
  ShoppingCart,
  Hash,
  Send,
  ExternalLink
} from "lucide-react"
import { getPengaturan, getBanners, getProduk } from "@/actions/public"

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
    <div className="mt-4 rounded-2xl overflow-hidden aspect-video map-embed-border">
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
  const [activeStep, setActiveStep] = useState(0)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const bagItems = [
    { x: "2%",   y: "3%",   size: 52, delay: "0s",    dur: "13.2s", opacity: 0.21, rotate: -18, pink: true  },
    { x: "87%",  y: "7%",   size: 68, delay: "1.8s",  dur: "16.7s", opacity: 0.17, rotate: 22,  pink: false },
    { x: "15%",  y: "12%",  size: 30, delay: "4.3s",  dur: "10.1s", opacity: 0.13, rotate: 40,  pink: true  },
    { x: "43%",  y: "1%",   size: 26, delay: "8.7s",  dur: "14.4s", opacity: 0.11, rotate: -5,  pink: false },
    { x: "67%",  y: "4%",   size: 44, delay: "2.1s",  dur: "18.3s", opacity: 0.16, rotate: 33,  pink: true  },
    { x: "95%",  y: "15%",  size: 36, delay: "6.4s",  dur: "11.8s", opacity: 0.14, rotate: -27, pink: false },
    { x: "0%",   y: "28%",  size: 60, delay: "3.2s",  dur: "15.5s", opacity: 0.20, rotate: 12,  pink: true  },
    { x: "33%",  y: "22%",  size: 22, delay: "11.1s", dur: "9.3s",  opacity: 0.10, rotate: -42, pink: false },
    { x: "58%",  y: "18%",  size: 48, delay: "0.7s",  dur: "17.1s", opacity: 0.18, rotate: 8,   pink: true  },
    { x: "78%",  y: "26%",  size: 32, delay: "5.9s",  dur: "12.6s", opacity: 0.15, rotate: -15, pink: false },
    { x: "8%",   y: "45%",  size: 42, delay: "7.3s",  dur: "14.8s", opacity: 0.19, rotate: 28,  pink: true  },
    { x: "28%",  y: "38%",  size: 20, delay: "13.5s", dur: "8.7s",  opacity: 0.09, rotate: -50, pink: false },
    { x: "51%",  y: "42%",  size: 56, delay: "1.4s",  dur: "19.2s", opacity: 0.17, rotate: -10, pink: true  },
    { x: "74%",  y: "39%",  size: 38, delay: "4.8s",  dur: "13.5s", opacity: 0.16, rotate: 35,  pink: false },
    { x: "92%",  y: "48%",  size: 28, delay: "9.2s",  dur: "10.9s", opacity: 0.12, rotate: -22, pink: true  },
    { x: "18%",  y: "58%",  size: 50, delay: "2.6s",  dur: "16.3s", opacity: 0.18, rotate: 15,  pink: false },
    { x: "40%",  y: "55%",  size: 24, delay: "12.0s", dur: "11.2s", opacity: 0.11, rotate: -38, pink: true  },
    { x: "62%",  y: "62%",  size: 46, delay: "0.3s",  dur: "18.7s", opacity: 0.17, rotate: 20,  pink: false },
    { x: "85%",  y: "57%",  size: 34, delay: "6.8s",  dur: "12.1s", opacity: 0.14, rotate: -8,  pink: true  },
    { x: "4%",   y: "72%",  size: 58, delay: "3.9s",  dur: "15.8s", opacity: 0.20, rotate: -25, pink: false },
    { x: "25%",  y: "75%",  size: 26, delay: "10.4s", dur: "9.8s",  opacity: 0.12, rotate: 45,  pink: true  },
    { x: "48%",  y: "78%",  size: 40, delay: "1.1s",  dur: "17.4s", opacity: 0.16, rotate: -12, pink: false },
    { x: "70%",  y: "82%",  size: 54, delay: "5.2s",  dur: "14.2s", opacity: 0.19, rotate: 30,  pink: true  },
    { x: "90%",  y: "76%",  size: 30, delay: "8.1s",  dur: "10.5s", opacity: 0.13, rotate: -33, pink: false },
    { x: "12%",  y: "88%",  size: 36, delay: "7.7s",  dur: "13.9s", opacity: 0.15, rotate: 18,  pink: true  },
    { x: "36%",  y: "92%",  size: 48, delay: "2.8s",  dur: "16.9s", opacity: 0.18, rotate: -20, pink: false },
    { x: "55%",  y: "95%",  size: 22, delay: "14.2s", dur: "8.4s",  opacity: 0.10, rotate: 50,  pink: true  },
    { x: "76%",  y: "90%",  size: 42, delay: "0.5s",  dur: "15.1s", opacity: 0.17, rotate: -14, pink: false },
    { x: "96%",  y: "88%",  size: 32, delay: "9.8s",  dur: "11.6s", opacity: 0.14, rotate: 38,  pink: true  },
    { x: "20%",  y: "6%",   size: 64, delay: "4.1s",  dur: "20.1s", opacity: 0.16, rotate: -7,  pink: false },
    { x: "50%",  y: "30%",  size: 18, delay: "15.3s", dur: "7.9s",  opacity: 0.08, rotate: 55,  pink: true  },
    { x: "82%",  y: "68%",  size: 52, delay: "1.6s",  dur: "17.8s", opacity: 0.18, rotate: -28, pink: false },
    { x: "38%",  y: "68%",  size: 28, delay: "11.8s", dur: "12.4s", opacity: 0.13, rotate: 22,  pink: true  },
    { x: "65%",  y: "50%",  size: 20, delay: "6.1s",  dur: "9.1s",  opacity: 0.09, rotate: -45, pink: false },
  ]

  useEffect(() => {
    async function load() {
      const [p, b, pr] = await Promise.all([
        getPengaturan(),
        getBanners(),
        getProduk()
      ])
      setPengaturan(p)
      setBanners(b)
      setProduk(pr || [])
    }
    load()
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-bag-idx]")
    els.forEach((el) => {
      const idx = Number(el.getAttribute("data-bag-idx"))
      const bag = bagItems[idx]
      if (!bag) return
      el.style.setProperty("--bag-x", bag.x)
      el.style.setProperty("--bag-y", bag.y)
      el.style.setProperty("--bag-opacity", String(bag.opacity))
      el.style.setProperty("--bag-rot", `${bag.rotate}deg`)
      el.style.setProperty("--bag-dur", bag.dur)
      el.style.setProperty("--bag-delay", bag.delay)
    })
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

  useEffect(() => {
    const steps = document.querySelectorAll("[data-step]")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-step"))
            setActiveStep(idx)
          }
        })
      },
      { threshold: 0.4 }
    )
    steps.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [produk.length])

  useEffect(() => {
    const revealEls = document.querySelectorAll("[data-reveal]")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      { threshold: 0.12 }
    )
    revealEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [produk.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX
  }
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) < 50) return
    if (diff > 0) goBanner((currentBanner + 1) % banners.length)
    else goBanner((currentBanner - 1 + banners.length) % banners.length)
  }

  const waLink = `https://wa.me/${pengaturan?.no_wa_toko?.replace(/^0/, "62") || ""}`
  const waMessage = `Halo ${pengaturan?.nama_toko || "Toko"}, saya ingin bertanya tentang produk Anda.`

  const tutorialSteps = [
    {
      icon: ShoppingBag,
      number: "01",
      title: "Masuk Halaman Produk",
      desc: "Jelajahi katalog produk lengkap kami dan temukan item yang sesuai dengan kebutuhan Anda."
    },
    {
      icon: Package,
      number: "02",
      title: "Pilih Produk",
      desc: "Klik produk yang diinginkan untuk melihat detail lengkap termasuk keterangan dan manfaat."
    },
    {
      icon: ShoppingCart,
      number: "03",
      title: "Masukkan ke Keranjang",
      desc: "Tambahkan produk ke keranjang sementara. Anda bisa menambah beberapa produk sekaligus."
    },
    {
      icon: Hash,
      number: "04",
      title: "Atur Jumlah Produk",
      desc: "Tentukan jumlah pesanan sesuai kebutuhan. Harga total akan otomatis terhitung."
    },
    {
      icon: Send,
      number: "05",
      title: "Kirim ke WhatsApp",
      desc: "Klik tombol kirim dan pesanan Anda langsung diteruskan ke WhatsApp kami untuk diproses."
    }
  ]

  return (
    <div className="text-gray-900 selection:bg-pink-200 selection:text-pink-900 min-h-screen antialiased relative overflow-x-hidden page-enter page-root">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        html { scroll-behavior: smooth; }
        .serif { font-family: 'DM Serif Display', serif; }

        .page-root {
          background: #ffffff;
          font-family: 'DM Sans', sans-serif;
          scroll-behavior: smooth;
        }
        .bg-wrapper {
          background: #ffffff;
        }
        .radial-pink-top {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(252,231,243,0.45) 0%, transparent 70%);
        }
        .radial-blue-bottom {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 50% 40% at 100% 100%, rgba(219,234,254,0.30) 0%, transparent 70%);
        }
        .hero-section {
          height: 100dvh;
        }
        .hero-title-pr {
          padding-right: 8px;
        }
        .hero-cta-btn {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          box-shadow: 0 4px 24px rgba(236,72,153,0.25);
        }
        .hero-stats-border {
          border-top: 1px solid rgba(236,72,153,0.12);
        }
        .banner-overlay {
          background: linear-gradient(to top, rgba(15,10,30,0.65) 0%, rgba(15,10,30,0.08) 50%, transparent 100%);
        }
        .banner-dot-active {
          width: 1.5rem;
          background: rgba(255,255,255,0.90);
          box-shadow: 0 0 12px rgba(255,255,255,0.5);
        }
        .banner-dot-inactive {
          width: 0.375rem;
          background: rgba(255,255,255,0.35);
          box-shadow: none;
        }
        .product-header-border {
          border-bottom: 1px solid rgba(236,72,153,0.12);
        }
        .product-img-bg {
          background: linear-gradient(135deg, rgba(252,231,243,0.18), rgba(219,234,254,0.15));
        }
        .product-hover-radial {
          background: radial-gradient(circle at center, rgba(236,72,153,0.04), transparent 70%);
        }
        .cat-label {
          color: rgba(219,39,119,0.65);
        }
        .feature-icon-pink {
          color: #ec4899;
        }
        .tutorial-cta-btn {
          background: linear-gradient(135deg, #ec4899, #3b82f6);
          box-shadow: 0 2px 12px rgba(236,72,153,0.20);
        }
        .step-node-mobile {
          width: 48px;
          height: 48px;
        }
        .step-number-badge-mobile {
          width: 18px;
          height: 18px;
          font-size: 8px;
          top: -4px;
          right: -4px;
        }
        .v-line-wrap-mobile {
          height: 32px;
          margin-left: 23px;
        }
        .contact-radial-pink {
          background: radial-gradient(circle at top right, rgba(252,231,243,0.60), transparent 70%);
        }
        .contact-icon-pink {
          color: #ec4899;
        }
        .contact-radial-blue {
          background: radial-gradient(circle at top right, rgba(219,234,254,0.50), transparent 70%);
        }
        .contact-icon-blue {
          color: #3b82f6;
        }
        .map-embed-border {
          border: 1px solid rgba(0,0,0,0.08);
        }

        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-enter {
          animation: pageEnter 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        .bag-item {
          position: absolute;
          left: var(--bag-x);
          top: var(--bag-y);
          opacity: var(--bag-opacity);
        }

        @keyframes bagFloat {
          0%   { transform: translateY(0px) rotate(var(--bag-rot)); }
          25%  { transform: translateY(-22px) rotate(calc(var(--bag-rot) + 6deg)); }
          50%  { transform: translateY(-8px) rotate(calc(var(--bag-rot) - 5deg)); }
          75%  { transform: translateY(-28px) rotate(calc(var(--bag-rot) + 4deg)); }
          100% { transform: translateY(0px) rotate(var(--bag-rot)); }
        }
        .bag-float {
          animation: bagFloat var(--bag-dur) ease-in-out infinite;
          animation-delay: var(--bag-delay);
        }

        @keyframes bagPulse {
          0%, 100% { transform: scale(1) rotate(var(--bag-rot)); }
          50% { transform: scale(1.10) rotate(calc(var(--bag-rot) + 7deg)); }
        }
        .bag-pulse {
          animation: bagPulse var(--bag-dur) ease-in-out infinite;
          animation-delay: var(--bag-delay);
        }

        @keyframes bagDrift {
          0%   { transform: translate(0, 0) rotate(var(--bag-rot)); }
          33%  { transform: translate(16px, -30px) rotate(calc(var(--bag-rot) + 8deg)); }
          66%  { transform: translate(-12px, -16px) rotate(calc(var(--bag-rot) - 6deg)); }
          100% { transform: translate(0, 0) rotate(var(--bag-rot)); }
        }
        .bag-drift {
          animation: bagDrift var(--bag-dur) ease-in-out infinite;
          animation-delay: var(--bag-delay);
        }

        @keyframes bagWobble {
          0%   { transform: rotate(var(--bag-rot)) translateY(0); }
          20%  { transform: rotate(calc(var(--bag-rot) + 10deg)) translateY(-14px); }
          40%  { transform: rotate(calc(var(--bag-rot) - 8deg)) translateY(-24px); }
          60%  { transform: rotate(calc(var(--bag-rot) + 5deg)) translateY(-10px); }
          80%  { transform: rotate(calc(var(--bag-rot) - 3deg)) translateY(-20px); }
          100% { transform: rotate(var(--bag-rot)) translateY(0); }
        }
        .bag-wobble {
          animation: bagWobble var(--bag-dur) ease-in-out infinite;
          animation-delay: var(--bag-delay);
        }

        .glass-panel {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(236,72,153,0.12);
          box-shadow: 0 8px 40px rgba(219,39,119,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .glass-card {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(219,39,119,0.05);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .glass-card:hover {
          background: #fff;
          border-color: rgba(236,72,153,0.20);
          box-shadow: 0 12px 40px rgba(219,39,119,0.12), 0 2px 8px rgba(0,0,0,0.04);
          transform: translateY(-5px);
        }

        .glass-hero-badge {
          background: rgba(252,231,243,0.80);
          border: 1px solid rgba(236,72,153,0.18);
          box-shadow: 0 2px 12px rgba(219,39,119,0.06);
        }

        .glass-btn-secondary {
          background: #ffffff;
          border: 1.5px solid rgba(236,72,153,0.22);
          box-shadow: 0 2px 12px rgba(219,39,119,0.06);
          transition: all 0.3s ease;
        }
        .glass-btn-secondary:hover {
          background: rgba(252,231,243,0.40);
          border-color: rgba(236,72,153,0.40);
          box-shadow: 0 4px 20px rgba(219,39,119,0.12);
        }

        .glass-banner {
          background: #f8f8f8;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 30px rgba(0,0,0,0.06);
        }

        .glass-banner-btn {
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 2px 12px rgba(219,39,119,0.08);
          transition: all 0.3s ease;
        }
        .glass-banner-btn:hover {
          background: #fff;
          box-shadow: 0 4px 20px rgba(219,39,119,0.14);
          transform: scale(1.05);
        }

        .glass-feature-card {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 4px 40px rgba(219,39,119,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }

        .glass-contact-card {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 24px rgba(219,39,119,0.05);
          transition: all 0.5s cubic-bezier(0.23,1,0.32,1);
        }
        .glass-contact-card:hover {
          border-color: rgba(236,72,153,0.18);
          box-shadow: 0 12px 48px rgba(219,39,119,0.12);
          transform: translateY(-4px);
        }

        .glass-icon {
          background: rgba(252,231,243,0.50);
          border: 1px solid rgba(236,72,153,0.12);
          transition: all 0.4s ease;
        }

        .glass-feature-row {
          border: 1px solid transparent;
          border-radius: 1rem;
          transition: all 0.4s ease;
        }
        .glass-feature-row:hover {
          background: rgba(252,231,243,0.30);
          border-color: rgba(236,72,153,0.12);
          box-shadow: 0 2px 16px rgba(219,39,119,0.06);
        }

        .step-node {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid rgba(236,72,153,0.18);
          box-shadow: 0 2px 12px rgba(219,39,119,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          flex-shrink: 0;
          cursor: pointer;
        }
        .step-node:hover,
        .step-node.active {
          background: linear-gradient(135deg, #ec4899, #3b82f6);
          border-color: transparent;
          box-shadow: 0 8px 32px rgba(236,72,153,0.30);
          transform: scale(1.15);
        }
        .step-node:hover svg,
        .step-node.active svg {
          color: white !important;
        }

        .step-number-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid rgba(236,72,153,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          color: #db2777;
          z-index: 3;
          transition: all 0.5s ease;
        }
        .step-node:hover .step-number-badge,
        .step-node.active .step-number-badge {
          background: white;
          color: #db2777;
          box-shadow: 0 2px 8px rgba(236,72,153,0.20);
        }

        .h-line-wrap {
          width: 48px;
          height: 2px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          margin-top: 31px;
        }
        .h-line-bg {
          width: 100%;
          height: 100%;
          background: rgba(236,72,153,0.12);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
        }
        .h-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #ec4899, #3b82f6);
          border-radius: 999px;
          transition: width 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .h-line-wrap.filled .h-line-fill {
          width: 100%;
        }

        .v-line-wrap {
          width: 2px;
          height: 44px;
          flex-shrink: 0;
          margin-left: 31px;
          position: relative;
          z-index: 1;
        }
        .v-line-bg {
          width: 100%;
          height: 100%;
          background: rgba(236,72,153,0.12);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
        }
        .v-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 0%;
          background: linear-gradient(180deg, #ec4899, #3b82f6);
          border-radius: 999px;
          transition: height 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .v-line-wrap.filled .v-line-fill {
          height: 100%;
        }

        .step-text-active .step-title-text {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }
        .d100 { animation-delay: 100ms; }
        .d200 { animation-delay: 200ms; }
        .d300 { animation-delay: 300ms; }
        .d500 { animation-delay: 500ms; }

        [data-reveal] {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        [data-reveal].revealed {
          opacity: 1;
          transform: translateY(0);
        }
        [data-reveal-delay="100"] { transition-delay: 100ms; }
        [data-reveal-delay="200"] { transition-delay: 200ms; }
        [data-reveal-delay="300"] { transition-delay: 300ms; }
        [data-reveal-delay="400"] { transition-delay: 400ms; }

        .price-gradient {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .shimmer-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(236,72,153,0.25), rgba(147,197,253,0.25), transparent);
        }

        @keyframes nodePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(236,72,153,0.20); }
          50% { box-shadow: 0 0 0 10px rgba(236,72,153,0); }
        }
        .step-node.active {
          animation: nodePulse 2.5s ease-in-out infinite;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(236,72,153,0.15), rgba(147,197,253,0.15), transparent);
          margin: 0 auto;
          max-width: 80%;
        }

        .bag-svg-pink {
          stroke: #ec4899;
        }
        .bag-svg-light {
          stroke: #f9a8d4;
        }
      `}</style>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-wrapper">
        {bagItems.map((bag, i) => {
          const animClass = i % 4 === 0 ? "bag-float" : i % 4 === 1 ? "bag-drift" : i % 4 === 2 ? "bag-pulse" : "bag-wobble"
          return (
            <div
              key={i}
              className={`bag-item ${animClass}`}
              data-bag-idx={i}
            >
              <svg
                width={bag.size}
                height={bag.size}
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={bag.pink ? "bag-svg-pink" : "bag-svg-light"}
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
          )
        })}
        <div className="radial-pink-top" />
        <div className="radial-blue-bottom" />
      </div>

      <section className="relative flex items-center justify-center px-4 z-10 hero-section">
        <div className="max-w-4xl mx-auto text-center z-20">
          <div className="fade-up">
            <div className="glass-hero-badge inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6 sm:mb-8">
              <Sparkles size={13} className="text-pink-600 animate-pulse" />
              <span className="text-[11px] font-medium text-pink-700 tracking-[0.15em] uppercase serif">
                Selamat Datang
              </span>
            </div>
          </div>

          <h1 className="fade-up d100 text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-gray-900 mb-5 sm:mb-7 leading-[1.08] serif hero-title-pr">
            {pengaturan?.nama_toko || "Toko"}{" "}
          </h1>

          <p className="fade-up d200 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-11 font-light">
            {pengaturan?.tagline || ""}
          </p>

          <div className="fade-up d300 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link
              href="/produkpublic"
              className="group w-full sm:w-auto text-white font-medium px-9 py-3.5 sm:py-4 rounded-full text-sm flex items-center justify-center gap-2.5 transition-all duration-500 hero-cta-btn"
            >
              Jelajahi Produk
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            <a
              href={`${waLink}?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-btn-secondary w-full sm:w-auto text-pink-700 font-medium px-9 py-3.5 sm:py-4 rounded-full text-sm text-center"
            >
              Konsultasi Gratis
            </a>
          </div>

          <div className="fade-up d500 mt-10 sm:mt-16 pt-6 sm:pt-8 grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto hero-stats-border">
            {[
              { value: "Authentic", label: "100% Original Brand" },
              { value: "BPOM", label: "Certified Safe" },
              { value: "Curated", label: "Selected for You" }
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xs sm:text-sm font-semibold price-gradient tracking-wider uppercase serif">
                  {item.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-gray-400 font-light mt-1 sm:mt-1.5">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {banners.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pb-10 sm:pb-20" data-reveal>
          <div
            className="glass-banner relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/7] sm:aspect-[21/8] group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  index === currentBanner ? "opacity-100 scale-100" : "opacity-0 scale-[1.03] pointer-events-none"
                }`}
              >
                <img
                  src={banner.url_foto_banner}
                  alt={banner.judul_banner || "Banner"}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {banner.judul_banner && (
                  <div className="absolute inset-0 flex items-end p-4 sm:p-12 pointer-events-none banner-overlay">
                    <h3 className="text-sm sm:text-2xl font-light tracking-wide text-white serif drop-shadow-lg">
                      {banner.judul_banner}
                    </h3>
                  </div>
                )}
              </div>
            ))}

            {banners[currentBanner]?.link_tujuan && (
              <a
                href={banners[currentBanner].link_tujuan}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-20 glass-banner-btn h-8 sm:h-10 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-pink-800 text-[11px] sm:text-xs font-medium"
              >
                <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Kunjungi</span>
              </a>
            )}

            {banners.length > 1 && (
              <>
                <button
                  onClick={() => goBanner((currentBanner - 1 + banners.length) % banners.length)}
                  aria-label="Slide sebelumnya"
                  className="glass-banner-btn absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-pink-800 z-20"
                >
                  <ChevronLeft size={14} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={() => goBanner((currentBanner + 1) % banners.length)}
                  aria-label="Slide selanjutnya"
                  className="glass-banner-btn absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-pink-800 z-20"
                >
                  <ChevronRight size={14} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2.5 z-20 pointer-events-none">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goBanner(index)}
                      aria-label={`Lihat banner ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-400 pointer-events-auto ${index === currentBanner ? "banner-dot-active" : "banner-dot-inactive"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {produk.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-12 pb-4 sm:pb-6 gap-3 sm:gap-4 product-header-border" data-reveal>
            <div>
              <span className="text-[11px] font-medium text-pink-500 uppercase tracking-[0.15em]">
                Our Collection
              </span>
              <h2 className="text-xl sm:text-3xl text-gray-900 tracking-tight mt-1 sm:mt-1.5 serif">
                Rekomendasi Terbaru
              </h2>
            </div>
            <Link
              href="/produkpublic"
              className="flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors shrink-0 group"
            >
              Lihat Semua Koleksi
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-5">
            {produk.map((p, idx) => (
              <div key={p.id} data-reveal data-reveal-delay={String(((idx % 4) * 100) as number)}>
                <Link href={`/produkpublic/${p.id}`} className="group">
                  <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden">
                    <div className="aspect-square relative overflow-hidden p-2 sm:p-4 product-img-bg">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 product-hover-radial" />
                      <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden relative z-10">
                        <img
                          src={p.url_foto}
                          alt={p.nama_produk}
                          loading="lazy"
                          className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="px-2 sm:px-4 pb-2 sm:pb-4 pt-2 sm:pt-3">
                      {p.kategori && (
                        <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.14em] cat-label">
                          {p.kategori.nama_kategori}
                        </span>
                      )}
                      <h3 className="text-[11px] sm:text-sm font-normal text-gray-800 mt-0.5 sm:mt-1 line-clamp-2 group-hover:text-pink-800 transition-colors duration-300 leading-snug min-h-[2em] sm:min-h-[2.5em]">
                        {p.nama_produk}
                      </h3>
                      <p className="price-gradient text-xs sm:text-base font-semibold mt-1.5 sm:mt-2.5">
                        {formatRupiah(p.harga_jual)}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="relative z-10 section-divider my-2 sm:my-4" />

      <section className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-20 my-3 sm:my-6" data-reveal>
        <div className="glass-feature-card relative rounded-xl sm:rounded-[2rem] overflow-hidden p-5 sm:p-14">
          <div className="relative z-10 grid md:grid-cols-12 gap-8 sm:gap-12 items-center">
            <div className="md:col-span-5">
              <span className="text-[11px] font-medium text-pink-600 uppercase tracking-[0.15em]">
                Layanan Kami
              </span>
              <h2 className="text-xl sm:text-3xl text-gray-900 tracking-tight mt-2 sm:mt-2.5 leading-snug serif">
                Solusi Praktis{" "}
                <span className="price-gradient">Kebutuhan Anda</span>
              </h2>
              <p className="text-xs sm:text-base text-gray-500 font-light leading-relaxed mt-3 sm:mt-5">
                {pengaturan?.deskripsi || "Satu platform untuk semua kebutuhanmu — transaksi digital, perawatan kulit, hingga kebutuhan pokok sehari-hari."}
              </p>
            </div>

            <div className="md:col-span-6 md:col-start-7 space-y-2 sm:space-y-3">
              {[
                {
                  icon: Smartphone,
                  title: "Transaksi Digital",
                  desc: "Melayani top up, pembayaran PPOB, transfer, dan tarik tunai secara cepat dan aman."
                },
                {
                  icon: Sparkles,
                  title: "Skincare MS Glow",
                  desc: "Tersedia paketan dan eceran produk perawatan kulit MS Glow original."
                },
                {
                  icon: Leaf,
                  title: "Bahan Pokok",
                  desc: "Kebutuhan sehari-hari seperti minyak, beras, dan kebutuhan lainnya."
                }
              ].map((f, i) => (
                <div key={i} className="glass-feature-row flex items-start gap-3 sm:gap-4 p-3 sm:p-5 group">
                  <div className="glass-icon h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 group-hover:!bg-gradient-to-br transition-all duration-500 feature-icon-pink">
                    <f.icon size={16} className="sm:!w-[18px] sm:!h-[18px]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-800">{f.title}</h3>
                    <p className="text-[11px] sm:text-sm text-gray-500 font-light mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 section-divider my-2 sm:my-4" />

      <section className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 py-8 sm:py-20 my-3 sm:my-6">
        <div className="relative z-10 text-center mb-8 sm:mb-14" data-reveal>
          <div className="glass-hero-badge inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 mb-4 sm:mb-6">
            <Sparkles size={13} className="text-pink-600 animate-pulse" />
            <span className="text-[11px] font-medium text-pink-700 tracking-[0.15em] uppercase serif">
              Panduan Mudah
            </span>
          </div>
          <h2 className="text-xl sm:text-4xl text-gray-900 tracking-tight mt-2 serif">
            Cara Pesan{" "}
            <span className="price-gradient">dalam 5 Langkah</span>
          </h2>
          <p className="text-xs sm:text-base text-gray-500 font-light mt-3 sm:mt-4 max-w-lg mx-auto leading-relaxed">
            Ikuti langkah sederhana berikut untuk melakukan pemesanan produk dengan cepat dan mudah.
          </p>
        </div>

        <div className="relative z-10 hidden md:flex md:items-start" data-reveal>
          {tutorialSteps.map((step, i) => (
            <div key={i} className="flex items-start" data-step={i}>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className={`step-node ${activeStep === i ? "active" : ""}`}
                  onMouseEnter={() => setActiveStep(i)}
                >
                  <div className="step-number-badge">{step.number}</div>
                  <step.icon size={24} className="text-pink-600 transition-colors duration-500" />
                </div>
                <div className={`mt-5 text-center px-1 transition-all duration-500 ${activeStep === i ? "step-text-active" : ""}`}>
                  <h3 className="step-title-text text-sm font-semibold text-gray-800 leading-snug mb-1.5 transition-all duration-500">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                    {step.desc}
                  </p>
                  {i === tutorialSteps.length - 1 && (
                    <Link
                      href="/produkpublic"
                      className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-white px-4 py-2 rounded-full transition-all duration-400 hover:shadow-lg hover:scale-105 tutorial-cta-btn"
                    >
                      Mulai Pesan
                      <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
              {i < tutorialSteps.length - 1 && (
                <div className={`h-line-wrap ${activeStep > i ? "filled" : ""}`}>
                  <div className="h-line-bg">
                    <div className="h-line-fill" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="relative z-10 md:hidden">
          {tutorialSteps.map((step, i) => (
            <div key={i} data-step={i}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`step-node step-node-mobile ${activeStep === i ? "active" : ""}`}
                    onClick={() => setActiveStep(i)}
                  >
                    <div className="step-number-badge step-number-badge-mobile">{step.number}</div>
                    <step.icon size={18} className="text-pink-600 transition-colors duration-500" />
                  </div>
                  {i < tutorialSteps.length - 1 && (
                    <div className={`v-line-wrap v-line-wrap-mobile ${activeStep > i ? "filled" : ""}`}>
                      <div className="v-line-bg">
                        <div className="v-line-fill" />
                      </div>
                    </div>
                  )}
                </div>
                <div className={`pb-5 transition-all duration-500 ${activeStep === i ? "step-text-active" : ""}`}>
                  <h3 className="step-title-text text-xs font-semibold text-gray-800 leading-snug mb-0.5 transition-all duration-500">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                    {step.desc}
                  </p>
                  {i === tutorialSteps.length - 1 && (
                    <Link
                      href="/produkpublic"
                      className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-white px-4 py-2 rounded-full transition-all duration-400 hover:shadow-lg hover:scale-105 tutorial-cta-btn"
                    >
                      Mulai Pesan
                      <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-8 sm:mt-14 flex justify-center">
          <div className="shimmer-line w-full max-w-2xl" />
        </div>
      </section>

      <div className="relative z-10 section-divider my-2 sm:my-4" />

      <section className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-20 mb-4 sm:mb-8">
        <div className="relative z-10 text-center mb-8 sm:mb-14" data-reveal>
          <span className="text-[11px] font-medium text-pink-600 uppercase tracking-[0.15em]">
            Support & Location
          </span>
          <h2 className="text-xl sm:text-3xl text-gray-900 tracking-tight mt-2 serif">
            Butuh Bantuan Lebih Lanjut?
          </h2>
          <p className="text-[11px] sm:text-sm text-gray-500 font-light mt-2 sm:mt-3 max-w-md mx-auto leading-relaxed">
            Konsultan produk kami siap memberikan penjelasan detail mengenai produk kami untuk Anda.
          </p>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-3 sm:gap-6 items-stretch" data-reveal>
          <a
            href={`${waLink}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-contact-card rounded-xl sm:rounded-2xl p-5 sm:p-10 block relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-125 contact-radial-pink" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="glass-icon h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-8 group-hover:shadow-[0_8px_30px_rgba(236,72,153,0.18)] transition-all duration-500 contact-icon-pink">
                <MessageCircle size={22} className="sm:!w-[28px] sm:!h-[28px]" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 serif">Layanan WhatsApp</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium mt-2 sm:mt-3 tracking-wide">
                {pengaturan?.no_wa_toko || "-"}
              </p>
              <p className="text-[11px] sm:text-sm text-gray-400 font-light mt-1 sm:mt-2">
                Responsif di jam operasional kerja (09.00 – 17.00).
              </p>
              <div className="mt-auto pt-6 sm:pt-10">
                <div className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-pink-600 tracking-wider uppercase group-hover:gap-4 transition-all duration-400">
                  Mulai Konsultasi
                  <ArrowRight size={14} className="sm:!w-[15px] sm:!h-[15px] group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </a>

          <div className="glass-contact-card rounded-xl sm:rounded-2xl p-5 sm:p-10 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 rounded-bl-full pointer-events-none contact-radial-blue" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="glass-icon h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-8 contact-icon-blue">
                <MapPin size={22} className="sm:!w-[28px] sm:!h-[28px]" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 serif">Lokasi</h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light mt-2 sm:mt-3 leading-relaxed">
                {pengaturan?.alamat || "Belum ada alamat terdaftar"}
              </p>
              <div className="mt-auto pt-4 sm:pt-6">
                {pengaturan?.embed_maps && <MapEmbed html={pengaturan.embed_maps} />}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}