"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X, ChevronDown, PackageSearch, Plus, Minus, ShoppingBag, Trash2, MessageCircle, ArrowRight, AlertCircle } from "lucide-react"
import { getPengaturan, getProdukPublic, getKategoriList } from "@/actions/publicproduk"

interface Produk {
  id: number
  nama_produk: string
  harga_jual: number
  stok_sekarang: number | null
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
  no_wa_toko: string | null
}

interface CartItem {
  id: number
  nama_produk: string
  harga_jual: number
  stok_sekarang: number | null
  url_foto: string
  qty: number
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

// ========== KOMPPONEN UTAMA DIPINDAH KE SINI ==========
function ProdukContent() {
  const searchParams = useSearchParams()
  const activeKategori = searchParams.get("kategori") || "semua"

  const [pengaturan, setPengaturan] = useState<Pengaturan | null>(null)
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [produk, setProduk] = useState<Produk[]>([])
  const [semuaProduk, setSemuaProduk] = useState<Produk[]>([])
  const [search, setSearch] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [justAdded, setJustAdded] = useState<number | null>(null)

  const waNumber = pengaturan?.no_wa_toko ? formatWhatsApp(pengaturan.no_wa_toko) : ""

  const bagItems = [
    { x: "5%",   y: "4%",   size: 52, delay: "0s",    dur: "13.2s", opacity: 0.08, rotate: -18, pink: true  },
    { x: "85%",  y: "8%",   size: 68, delay: "1.8s",  dur: "16.7s", opacity: 0.06, rotate: 22,  pink: false },
    { x: "15%",  y: "15%",  size: 30, delay: "4.3s",  dur: "10.1s", opacity: 0.05, rotate: 40,  pink: true  },
    { x: "45%",  y: "3%",   size: 26, delay: "8.7s",  dur: "14.4s", opacity: 0.04, rotate: -5,  pink: false },
    { x: "65%",  y: "6%",   size: 44, delay: "2.1s",  dur: "18.3s", opacity: 0.06, rotate: 33,  pink: true  },
    { x: "92%",  y: "18%",  size: 36, delay: "6.4s",  dur: "11.8s", opacity: 0.05, rotate: -27, pink: false },
    { x: "2%",   y: "32%",  size: 60, delay: "3.2s",  dur: "15.5s", opacity: 0.07, rotate: 12,  pink: true  },
    { x: "35%",  y: "25%",  size: 22, delay: "11.1s", dur: "9.3s",  opacity: 0.04, rotate: -42, pink: false },
    { x: "58%",  y: "20%",  size: 48, delay: "0.7s",  dur: "17.1s", opacity: 0.06, rotate: 8,   pink: true  },
    { x: "78%",  y: "30%",  size: 32, delay: "5.9s",  dur: "12.6s", opacity: 0.05, rotate: -15, pink: false },
    { x: "10%",  y: "48%",  size: 42, delay: "7.3s",  dur: "14.8s", opacity: 0.06, rotate: 28,  pink: true  },
    { x: "30%",  y: "42%",  size: 20, delay: "13.5s", dur: "8.7s",  opacity: 0.04, rotate: -50, pink: false },
    { x: "52%",  y: "45%",  size: 56, delay: "1.4s",  dur: "19.2s", opacity: 0.06, rotate: -10, pink: true  },
    { x: "74%",  y: "42%",  size: 38, delay: "4.8s",  dur: "13.5s", opacity: 0.05, rotate: 35,  pink: false },
    { x: "90%",  y: "52%",  size: 28, delay: "9.2s",  dur: "10.9s", opacity: 0.04, rotate: -22, pink: true  },
    { x: "20%",  y: "62%",  size: 50, delay: "2.6s",  dur: "16.3s", opacity: 0.06, rotate: 15,  pink: false },
    { x: "42%",  y: "58%",  size: 24, delay: "12.0s", dur: "11.2s", opacity: 0.04, rotate: -38, pink: true  },
    { x: "63%",  y: "65%",  size: 46, delay: "0.3s",  dur: "18.7s", opacity: 0.06, rotate: 20,  pink: false },
    { x: "85%",  y: "60%",  size: 34, delay: "6.8s",  dur: "12.1s", opacity: 0.05, rotate: -8,  pink: true  },
    { x: "8%",   y: "78%",  size: 58, delay: "3.9s",  dur: "15.8s", opacity: 0.07, rotate: -25, pink: false },
  ]

  const addToCart = (p: Produk) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id)
      if (existing) {
        return prev.map((c) => c.id === p.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { id: p.id, nama_produk: p.nama_produk, harga_jual: p.harga_jual, stok_sekarang: p.stok_sekarang, url_foto: p.url_foto, qty: 1 }]
    })
    setJustAdded(p.id)
    setTimeout(() => setJustAdded(null), 600)
  }

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
    )
  }

  const setQty = (id: number, val: number) => {
    if (isNaN(val) || val < 1) return
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: val } : c))
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.harga_jual * c.qty, 0)
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)
  const getCartItemQty = (id: number) => cart.find((c) => c.id === id)?.qty || 0
  const hasOutOfStock = cart.some((c) => (c.stok_sekarang ?? 0) <= 0)
  const canSendWA = waNumber && !hasOutOfStock

  const sendWhatsApp = () => {
    if (!canSendWA) return
    const base = window.location.origin
    let msg = `*PESANAN BARU*\n\n`
    msg += `Halo, saya ingin memesan produk berikut:\n\n`
    cart.forEach((c, i) => {
      msg += `${i + 1}. *${c.nama_produk}*\n`
      msg += `   Jumlah  : ${c.qty} pcs\n`
      msg += `   Harga   : ${formatRupiah(c.harga_jual)}\n`
      msg += `   Subtotal: ${formatRupiah(c.harga_jual * c.qty)}\n`
      msg += `   Link    : ${base}/produkpublic/${c.id}\n\n`
    })
    msg += `━━━━━━━━━━━━━━━\n`
    msg += `*TOTAL: ${formatRupiah(cartTotal)}*\n`
    msg += `━━━━━━━━━━━━━━━\n\n`
    msg += `Mohon konfirmasi ketersediaan stok dan ongkir. Terima kasih!`
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank")
  }

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
    getProdukPublic("semua", 1, 9999).then((pr) => setSemuaProduk(pr))
  }, [])

  useEffect(() => {
    async function load() {
      setLoadingMore(true)
      const [p, k, pr] = await Promise.all([
        getPengaturan(),
        getKategoriList(),
        getProdukPublic(activeKategori, 1, 8)
      ])
      setPengaturan(p)
      setKategoriList(k)
      setProduk(pr)
      setPage(1)
      setHasMore(pr.length === 8)
      setIsExpanded(false)
      setLoadingMore(false)
    }
    load()
  }, [activeKategori])

  useEffect(() => {
    if (!isExpanded) return
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true)
          const nextPage = page + 1
          const newProduk = await getProdukPublic(activeKategori, nextPage, 8)
          if (newProduk.length < 8) setHasMore(false)
          setProduk((prev) => [...prev, ...newProduk])
          setPage(nextPage)
          setLoadingMore(false)
        }
      },
      { threshold: 0.1 }
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [page, hasMore, loadingMore, activeKategori, isExpanded])

  const filtered = produk.filter((p) =>
    p.nama_produk.toLowerCase().includes(search.toLowerCase())
  )

  const displayedProduk = isExpanded ? filtered : filtered.slice(0, 4)

  const activeLabel =
    activeKategori === "semua"
      ? "Semua Produk"
      : kategoriList.find((k) => k.slug === activeKategori)?.nama_kategori || "Semua Produk"

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-24 sm:pt-28 pb-16 sm:pb-24 font-sans antialiased text-gray-900 selection:bg-pink-200 selection:text-pink-900 bg-white">

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; }

        .glass-deep {
          background: rgba(255,255,255,0.28);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow: 0 8px 40px rgba(219,39,119,0.10), inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .glass-card {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(236,72,153,0.08);
          box-shadow: 0 4px 24px rgba(219,39,119,0.07), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.96);
          border-color: rgba(236,72,153,0.15);
          box-shadow: 0 16px 48px rgba(219,39,119,0.16), inset 0 1px 0 rgba(255,255,255,0.95);
          transform: translateY(-4px);
        }
        .glass-input {
          background: rgba(255,255,255,0.30);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow: 0 2px 16px rgba(219,39,119,0.06), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        .glass-input-pink {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-left: 3px solid rgba(236,72,153,0.4);
          border-right: 3px solid rgba(236,72,153,0.4);
          border-top: 1px solid rgba(236,72,153,0.1);
          border-bottom: 1px solid rgba(236,72,153,0.1);
          box-shadow: 0 2px 16px rgba(219,39,119,0.08), inset 0 1px 0 rgba(255,255,255,0.9), -3px 0 12px rgba(236,72,153,0.08), 3px 0 12px rgba(236,72,153,0.08);
          transition: all 0.3s ease;
        }
        .glass-input-pink:focus {
          border-left-color: rgba(236,72,153,0.7);
          border-right-color: rgba(236,72,153,0.7);
          border-top-color: rgba(236,72,153,0.2);
          border-bottom-color: rgba(236,72,153,0.2);
          box-shadow: 0 2px 24px rgba(219,39,119,0.14), inset 0 1px 0 rgba(255,255,255,0.9), -3px 0 18px rgba(236,72,153,0.12), 3px 0 18px rgba(236,72,153,0.12);
        }
        .glass-dropdown {
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(220,200,210,0.5);
          box-shadow: 0 20px 60px rgba(219,39,119,0.18), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95);
        }
        .glass-dropdown-item { transition: background 0.2s ease; border-radius: 0.75rem; }
        .glass-dropdown-item:hover { background: rgba(236,72,153,0.08); }
        .glass-empty {
          background: rgba(255,255,255,0.20);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px dashed rgba(236,72,153,0.25);
        }
        .glass-btn-expand {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(236,72,153,0.12);
          box-shadow: 0 8px 32px rgba(219,39,119,0.14);
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

        .bag-el { position: absolute; }
        .bag-stroke-pink { stroke: #ec4899; }
        .bag-stroke-light { stroke: #f9a8d4; }

        .bag-0  { left: 5%;  top: 4%;  opacity: 0.08; --bag-rot: -18deg; --bag-dur: 13.2s; --bag-delay: 0s; }
        .bag-1  { left: 85%; top: 8%;  opacity: 0.06; --bag-rot: 22deg;  --bag-dur: 16.7s; --bag-delay: 1.8s; }
        .bag-2  { left: 15%; top: 15%; opacity: 0.05; --bag-rot: 40deg;  --bag-dur: 10.1s; --bag-delay: 4.3s; }
        .bag-3  { left: 45%; top: 3%;  opacity: 0.04; --bag-rot: -5deg;  --bag-dur: 14.4s; --bag-delay: 8.7s; }
        .bag-4  { left: 65%; top: 6%;  opacity: 0.06; --bag-rot: 33deg;  --bag-dur: 18.3s; --bag-delay: 2.1s; }
        .bag-5  { left: 92%; top: 18%; opacity: 0.05; --bag-rot: -27deg; --bag-dur: 11.8s; --bag-delay: 6.4s; }
        .bag-6  { left: 2%;  top: 32%; opacity: 0.07; --bag-rot: 12deg;  --bag-dur: 15.5s; --bag-delay: 3.2s; }
        .bag-7  { left: 35%; top: 25%; opacity: 0.04; --bag-rot: -42deg; --bag-dur: 9.3s;  --bag-delay: 11.1s; }
        .bag-8  { left: 58%; top: 20%; opacity: 0.06; --bag-rot: 8deg;   --bag-dur: 17.1s; --bag-delay: 0.7s; }
        .bag-9  { left: 78%; top: 30%; opacity: 0.05; --bag-rot: -15deg; --bag-dur: 12.6s; --bag-delay: 5.9s; }
        .bag-10 { left: 10%; top: 48%; opacity: 0.06; --bag-rot: 28deg;  --bag-dur: 14.8s; --bag-delay: 7.3s; }
        .bag-11 { left: 30%; top: 42%; opacity: 0.04; --bag-rot: -50deg; --bag-dur: 8.7s;  --bag-delay: 13.5s; }
        .bag-12 { left: 52%; top: 45%; opacity: 0.06; --bag-rot: -10deg; --bag-dur: 19.2s; --bag-delay: 1.4s; }
        .bag-13 { left: 74%; top: 42%; opacity: 0.05; --bag-rot: 35deg;  --bag-dur: 13.5s; --bag-delay: 4.8s; }
        .bag-14 { left: 90%; top: 52%; opacity: 0.04; --bag-rot: -22deg; --bag-dur: 10.9s; --bag-delay: 9.2s; }
        .bag-15 { left: 20%; top: 62%; opacity: 0.06; --bag-rot: 15deg;  --bag-dur: 16.3s; --bag-delay: 2.6s; }
        .bag-16 { left: 42%; top: 58%; opacity: 0.04; --bag-rot: -38deg; --bag-dur: 11.2s; --bag-delay: 12.0s; }
        .bag-17 { left: 63%; top: 65%; opacity: 0.06; --bag-rot: 20deg;  --bag-dur: 18.7s; --bag-delay: 0.3s; }
        .bag-18 { left: 85%; top: 60%; opacity: 0.05; --bag-rot: -8deg;  --bag-dur: 12.1s; --bag-delay: 6.8s; }
        .bag-19 { left: 8%;  top: 78%; opacity: 0.07; --bag-rot: -25deg; --bag-dur: 15.8s; --bag-delay: 3.9s; }

        .serif { font-family: 'DM Serif Display', serif; }
        .price-gradient {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .shimmer-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(236,72,153,0.3), rgba(147,197,253,0.3), transparent);
        }

        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .pop-in { animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in { animation: fadeIn 0.3s ease; }

        .qty-input::-webkit-inner-spin-button,
        .qty-input::-webkit-outer-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        .qty-input { -moz-appearance: textfield; }

        .cart-item-enter {
          animation: cartItemSlide 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        @keyframes cartItemSlide {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .cart-fab {
          background: linear-gradient(135deg, #db2777, #ec4899, #f472b6);
          box-shadow: 0 12px 40px rgba(219,39,119,0.45), 0 4px 12px rgba(0,0,0,0.1);
        }
        .cart-panel {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          box-shadow: 0 -20px 60px rgba(219,39,119,0.15), 0 4px 20px rgba(0,0,0,0.08);
        }
        .cart-header-border {
          border-color: rgba(236,72,153,0.10);
        }
        .cart-icon-bg {
          background: rgba(236,72,153,0.10);
        }
        .cart-icon-color {
          color: #db2777;
        }
        .close-btn-color {
          color: #9ca3af;
        }
        .cart-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(236,72,153,0.2) transparent;
        }
        .cart-item-normal {
          background: rgba(249,168,212,0.06);
          border: 1px solid rgba(236,72,153,0.06);
        }
        .cart-item-oos {
          background: rgba(249,168,212,0.06);
          border: 1px solid rgba(239,68,68,0.15);
        }
        .cart-item-img-bg {
          background: rgba(255,255,255,0.6);
        }
        .qty-control {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(236,72,153,0.12);
        }
        .qty-btn-active {
          color: #db2777;
        }
        .qty-btn-disabled {
          color: #d1d5db;
        }
        .delete-btn-color {
          color: #fca5a5;
        }
        .cart-footer {
          border-color: rgba(236,72,153,0.10);
          background: rgba(255,255,255,0.5);
        }
        .wa-btn {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          box-shadow: 0 4px 24px rgba(236,72,153,0.25);
        }
        .cart-disabled-btn {
          background: rgba(255,255,255,0.28);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.50);
        }
        .clear-search-link {
          color: #ec4899;
          text-decoration-color: rgba(236,72,153,0.35);
        }
        .header-label {
          color: rgba(219,39,119,0.7);
        }
        .header-line {
          background: linear-gradient(90deg, rgba(236,72,153,0.5), transparent);
        }
        .title-pink {
          color: #db2777;
        }
        .search-icon-color {
          color: rgba(219,39,119,0.45);
        }
        .search-clear-color {
          color: rgba(219,39,119,0.4);
        }
        .filter-btn-active {
          color: #db2777;
        }
        .filter-btn-inactive {
          color: #4b5563;
        }
        .dropdown-item-active {
          background: rgba(236,72,153,0.12);
          color: #db2777;
        }
        .dropdown-item-inactive {
          background: transparent;
          color: #374151;
        }
        .badge-active {
          background: rgba(236,72,153,0.12);
          color: #ec4899;
        }
        .badge-inactive {
          background: rgba(156,163,175,0.12);
          color: #9ca3af;
        }
        .dropdown-divider {
          background: rgba(236,72,153,0.10);
        }
        .empty-icon-color {
          color: rgba(219,39,119,0.4);
        }
        .product-img-bg {
          background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(252,231,243,0.4));
        }
        .product-hover-radial {
          background: radial-gradient(circle at center, rgba(236,72,153,0.06), transparent 70%);
        }
        .product-bottom-line {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
        }
        .cat-label {
          color: rgba(219,39,119,0.65);
        }
        .add-btn {
          background: linear-gradient(135deg, #db2777, #ec4899);
          box-shadow: 0 4px 16px rgba(219,39,119,0.35);
        }
        .card-qty-control {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(236,72,153,0.15);
          box-shadow: 0 4px 16px rgba(219,39,119,0.15);
        }
        .cart-badge {
          background: linear-gradient(135deg, #db2777, #ec4899);
          box-shadow: 0 2px 8px rgba(219,39,119,0.3);
        }
        .expand-overlay {
          background: linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%);
        }
        .loading-spinner {
          border: 2px solid rgba(219,39,119,0.2);
          border-top-color: #ec4899;
        }
      `}</style>

      <div className="fixed inset-0 z-0 overflow-hidden">
        {bagItems.map((bag, i) => {
          const animClass = i % 4 === 0 ? "bag-float" : i % 4 === 1 ? "bag-drift" : i % 4 === 2 ? "bag-pulse" : "bag-wobble"
          return (
            <div
              key={i}
              className={`${animClass} bag-el bag-${i}`}
            >
              <svg
                width={bag.size}
                height={bag.size}
                viewBox="0 0 24 24"
                fill="none"
                className={bag.pink ? "bag-stroke-pink" : "bag-stroke-light"}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
          )
        })}
      </div>

      {cart.length > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed z-50 bottom-6 right-6 sm:bottom-8 sm:right-8 flex items-center gap-2.5 pl-5 pr-4 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-2xl pop-in cart-fab"
          aria-label={`Keranjang ${cartCount} item`}
        >
          <ShoppingBag size={17} />
          <span>{cartCount} item</span>
          <span className="ml-1 text-xs font-normal opacity-80">{formatRupiah(cartTotal)}</span>
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm fade-in"
            onClick={() => setCartOpen(false)}
          />
          <div
            className="absolute z-10 w-full sm:w-[420px] sm:right-0 sm:top-0 sm:bottom-0 bottom-0 max-h-[88vh] sm:max-h-full flex flex-col rounded-t-3xl sm:rounded-t-none sm:rounded-tl-3xl overflow-hidden cart-panel"
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b cart-header-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center cart-icon-bg">
                  <ShoppingBag size={17} className="cart-icon-color" />
                </div>
                <div>
                  <h2 className="serif text-lg text-gray-900 leading-tight">Keranjang</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">{cartCount} produk dipilih</p>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors hover:bg-pink-50 close-btn-color"
                aria-label="Tutup keranjang"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3 space-y-2.5 cart-scroll">
              {cart.map((item) => {
                const outOfStock = (item.stok_sekarang ?? 0) <= 0
                return (
                  <div key={item.id} className={`cart-item-enter flex gap-3 p-3 rounded-2xl transition-colors ${outOfStock ? "opacity-50" : ""} ${outOfStock ? "cart-item-oos" : "cart-item-normal"}`}>
                    <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-xl overflow-hidden flex-shrink-0 cart-item-img-bg">
                      <img src={item.url_foto} alt={item.nama_produk} className="w-full h-full object-contain p-1.5" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[13px] font-medium text-gray-800 line-clamp-2 leading-snug">{item.nama_produk}</h4>
                        <p className="price-gradient text-[12px] font-semibold mt-0.5">{formatRupiah(item.harga_jual)}</p>
                        {outOfStock && (
                          <span className="inline-block text-[10px] font-medium text-red-500 mt-1">Stok habis</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className={`flex items-center gap-0.5 rounded-xl overflow-hidden ${outOfStock ? "pointer-events-none opacity-40" : ""} qty-control`}>
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className={`h-7 w-7 flex items-center justify-center transition-colors hover:bg-pink-50 ${item.qty <= 1 ? "qty-btn-disabled" : "qty-btn-active"}`}
                            disabled={item.qty <= 1}
                            aria-label="Kurangi jumlah"
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => setQty(item.id, parseInt(e.target.value) || 1)}
                            className="qty-input w-10 h-7 text-center text-[12px] font-semibold text-gray-800 bg-transparent focus:outline-none"
                            disabled={outOfStock}
                            aria-label="Jumlah produk"
                          />
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="h-7 w-7 flex items-center justify-center transition-colors hover:bg-pink-50 qty-btn-active"
                            disabled={outOfStock}
                            aria-label="Tambah jumlah"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-gray-800">{formatRupiah(item.harga_jual * item.qty)}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 hover:scale-110 delete-btn-color"
                            aria-label="Hapus dari keranjang"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 sm:px-6 py-4 sm:py-5 border-t cart-footer">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="serif text-xl text-gray-900">{formatRupiah(cartTotal)}</span>
              </div>

              {canSendWA ? (
                <button
                  onClick={sendWhatsApp}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-white font-medium text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] wa-btn"
                >
                  <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Pesan via WhatsApp
                </button>
              ) : hasOutOfStock ? (
                <>
                  <div
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-gray-400 font-medium text-sm cursor-not-allowed cart-disabled-btn"
                  >
                    <PackageSearch size={16} />
                    Ada produk yang stoknya habis
                  </div>
                  <p className="text-[10px] text-center text-amber-500/70 mt-2.5 leading-relaxed">
                    Hapus produk stok habis dari keranjang untuk bisa mengirim pesanan.
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-gray-400 font-medium text-sm cursor-not-allowed cart-disabled-btn"
                  >
                    <AlertCircle size={16} />
                    Nomor WhatsApp belum diatur
                  </div>
                  <p className="text-[10px] text-center text-amber-500/70 mt-2.5 leading-relaxed">
                    Admin toko belum mengatur nomor WhatsApp di pengaturan. Pesanan tidak bisa dikirim.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        <div className="mb-10 sm:mb-14 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-8 header-line" />
            <span className="text-[10px] font-medium tracking-[0.22em] uppercase header-label">
              Katalog {pengaturan?.nama_toko || ""}
            </span>
          </div>
          <h1 className="serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-gray-900 leading-[1.05]">
            Temukan Semua<br />
            <span className="italic title-pink">Produk</span>
          </h1>
          <p className="text-sm text-gray-500 font-light mt-4 max-w-lg leading-relaxed">
            Jelajahi berbagai pilihan produk terbaik kami — dari skincare, bahan pokok, hingga layanan transaksi digital.
          </p>
          <div className="shimmer-line mt-8" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
          <div className="relative flex-1 max-w-md w-full">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 search-icon-color" />
            <input
              type="text"
              placeholder="Cari produk spesifik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input-pink w-full rounded-2xl pl-11 pr-10 py-3.5 text-sm text-gray-800 placeholder:text-gray-400/70 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors search-clear-color"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`glass-input-pink flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm transition-all min-w-[160px] sm:min-w-[180px] justify-between focus:outline-none ${activeKategori !== "semua" ? "filter-btn-active" : "filter-btn-inactive"}`}
              aria-label="Filter kategori"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal size={14} />
                <span className="truncate font-medium">{activeLabel}</span>
              </div>
              <ChevronDown
                size={13}
                className={`shrink-0 transition-transform duration-300 ${showFilter ? "rotate-180" : ""}`}
              />
            </button>

            {showFilter && (
              <div className="glass-dropdown absolute top-full left-0 right-0 mt-2 rounded-2xl p-2 z-50">
                <Link
                  href="/produkpublic"
                  onClick={() => setShowFilter(false)}
                  className={`glass-dropdown-item flex items-center justify-between px-4 py-3 text-sm ${activeKategori === "semua" ? "dropdown-item-active" : "dropdown-item-inactive"}`}
                >
                  <span className={activeKategori === "semua" ? "font-semibold" : "font-normal"}>Semua Produk</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${activeKategori === "semua" ? "badge-active" : "badge-inactive"}`}>
                    {semuaProduk.length}
                  </span>
                </Link>

                {kategoriList.length > 0 && <div className="h-px mx-3 my-1.5 dropdown-divider" />}

                {kategoriList.map((k) => {
                  const count = semuaProduk.filter((p) => p.kategori?.slug === k.slug).length
                  const isActive = activeKategori === k.slug
                  return (
                    <Link
                      key={k.id}
                      href={`/produkpublic?kategori=${k.slug}`}
                      onClick={() => setShowFilter(false)}
                      className={`glass-dropdown-item flex items-center justify-between px-4 py-3 text-sm ${isActive ? "dropdown-item-active" : "dropdown-item-inactive"}`}
                    >
                      <span className={isActive ? "font-semibold" : "font-normal"}>{k.nama_kategori}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? "badge-active" : "badge-inactive"}`}>
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
          <div className="glass-empty text-center py-24 sm:py-32 rounded-3xl">
            <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl mb-5 glass-deep">
              <PackageSearch size={28} strokeWidth={1.5} className="empty-icon-color" />
            </div>
            <h3 className="serif text-xl text-gray-900">Koleksi Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto font-light">
              Kami tidak dapat menemukan produk yang sesuai dengan pencarian Anda. Silakan coba kata kunci lain.
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-6 text-sm font-medium underline underline-offset-4 transition-all clear-search-link"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {displayedProduk.map((p) => {
                  const inCart = getCartItemQty(p.id)
                  const isJustAdded = justAdded === p.id
                  const outOfStock = (p.stok_sekarang ?? 0) <= 0
                  return (
                    <div key={p.id} className="group relative">
                      <Link href={`/produkpublic/${p.id}`}>
                        <div className="glass-card rounded-2xl overflow-hidden">
                          <div className="aspect-square relative overflow-hidden product-img-bg">
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 product-hover-radial"
                            />
                            <div className="w-full h-full p-3 sm:p-4 relative z-10">
                              <div className="w-full h-full rounded-xl overflow-hidden">
                                <img
                                  src={p.url_foto}
                                  alt={p.nama_produk}
                                  className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                              </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-px product-bottom-line" />
                            {outOfStock && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                                <span className="text-[11px] sm:text-xs font-semibold text-red-500 bg-white/80 px-3 py-1.5 rounded-full">Stok Habis</span>
                              </div>
                            )}
                          </div>
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-3">
                            {p.kategori && (
                              <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.14em] cat-label">
                                {p.kategori.nama_kategori}
                              </span>
                            )}
                            <h3 className="text-xs sm:text-sm font-normal text-gray-800 mt-1 line-clamp-2 transition-colors duration-300 leading-snug min-h-[2.5em] group-hover:text-pink-800">
                              {p.nama_produk}
                            </h3>
                            <p className="price-gradient text-sm sm:text-base font-semibold mt-2.5">
                              {formatRupiah(p.harga_jual)}
                            </p>
                          </div>
                        </div>
                      </Link>

                      {!outOfStock && (
                        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20">
                          {inCart === 0 ? (
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(p) }}
                              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 add-btn ${isJustAdded ? "pop-in" : ""}`}
                              aria-label={`Tambah ${p.nama_produk} ke keranjang`}
                            >
                              <Plus size={16} strokeWidth={2.5} />
                            </button>
                          ) : (
                            <div
                              className={`flex items-center rounded-xl overflow-hidden card-qty-control ${isJustAdded ? "pop-in" : ""}`}
                            >
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (inCart <= 1) removeFromCart(p.id); else updateQty(p.id, -1) }}
                                className="h-9 w-9 flex items-center justify-center transition-colors hover:bg-pink-50 qty-btn-active"
                                aria-label="Kurangi jumlah"
                              >
                                <Minus size={13} strokeWidth={2.5} />
                              </button>
                              <span className="w-8 text-center text-[13px] font-bold text-gray-800 select-none">{inCart}</span>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(p) }}
                                className="h-9 w-9 flex items-center justify-center transition-colors hover:bg-pink-50 qty-btn-active"
                                aria-label="Tambah jumlah"
                              >
                                <Plus size={13} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {inCart > 0 && !outOfStock && (
                        <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-20 pop-in">
                          <span
                            className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-lg text-[10px] sm:text-[11px] font-bold text-white cart-badge"
                          >
                            {inCart}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {!isExpanded && filtered.length > 4 && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-44 flex items-end justify-center z-20 pb-3 expand-overlay"
                >
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="glass-btn-expand text-pink-700 px-7 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    Lihat Selengkapnya
                    <ChevronDown size={15} />
                  </button>
                </div>
              )}
            </div>

            {isExpanded && (
              <div ref={observerTarget} className="w-full h-16 flex items-center justify-center mt-6">
                {loadingMore && hasMore && (
                  <div className="h-6 w-6 rounded-full animate-spin loading-spinner" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ========== EXPORT DEFAULT DENGAN SUSPENSE WRAPPER ==========
export default function ProdukPage() {
  return (
    <Suspense>
      <ProdukContent />
    </Suspense>
  )
}