"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
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
  const [scrolled, setScrolled] = useState(false)
  const [mobileDrop, setMobileDrop] = useState(false)
  const [animating, setAnimating] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const waLink = `https://wa.me/${pengaturan?.no_wa_toko?.replace(/^0/, "62") || ""}`
  const isActive = scrolled || open || animating

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener("mousedown", handleClick, { passive: true })
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleClose = () => {
    if (open) {
      setAnimating(true)
      setMobileDrop(false)
      setTimeout(() => {
        setOpen(false)
        setDropOpen(false)
        setAnimating(false)
      }, 220)
    } else {
      setDropOpen(false)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    setAnimating(false)
  }

  return (
    <>
      <style>{`
        .nb-header {
          font-family: 'DM Sans', sans-serif;
        }
        .nb-glow-outer {
          background: linear-gradient(135deg, rgba(236,72,153,0.18), rgba(219,39,119,0.08), rgba(59,130,246,0.12), rgba(236,72,153,0.14));
          filter: blur(6px);
          opacity: 0.5;
          transition: opacity 0.5s;
        }
        .nb-glow-outer-active {
          opacity: 0.8;
        }
        .nb-glow-inner {
          background: linear-gradient(180deg, rgba(236,72,153,0.25), rgba(219,39,119,0.10), rgba(59,130,246,0.08), rgba(236,72,153,0.18));
          filter: blur(2px);
          opacity: 0.6;
          transition: opacity 0.5s;
        }
        .nb-glow-inner-active {
          opacity: 0.9;
        }
        .nb-main {
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.60);
          box-shadow: 0 0 20px rgba(236,72,153,0.08), 0 0 40px rgba(219,39,119,0.04), 0 4px 24px rgba(219,39,119,0.08), inset 0 1px 0 rgba(255,255,255,0.60);
          border-radius: 2rem;
          transition: all 0.5s ease-out;
        }
        .nb-main-active {
          background: rgba(255,255,255,0.65);
          box-shadow: 0 0 30px rgba(236,72,153,0.10), 0 0 60px rgba(219,39,119,0.06), 0 8px 40px rgba(219,39,119,0.12), inset 0 1px 0 rgba(255,255,255,0.70);
        }
        .nb-main-open {
          border-radius: 1.5rem;
        }
        .nb-top-line {
          height: 1px;
          background: linear-gradient(90deg, transparent 10%, rgba(236,72,153,0.30), rgba(147,197,253,0.22), transparent 90%);
        }
        .nb-logo-img {
          border: 1px solid rgba(255,255,255,0.70);
          box-shadow: 0 2px 10px rgba(219,39,119,0.08);
        }
        .nb-logo-fallback {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          box-shadow: 0 4px 16px rgba(236,72,153,0.28);
        }
        .nb-dropdown {
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.60);
          box-shadow: 0 0 20px rgba(236,72,153,0.08), 0 8px 40px rgba(219,39,119,0.12), inset 0 1px 0 rgba(255,255,255,0.70);
          transform: translateZ(0);
        }
        .nb-dropdown-active {
          background: rgba(255,255,255,0.65);
        }
        .nb-dropdown a:hover {
          background: rgba(236,72,153,0.07);
        }
        .nb-wa-btn {
          background: linear-gradient(135deg, #ec4899, #db2777, #3b82f6);
          box-shadow: 0 4px 20px rgba(236,72,153,0.22);
        }
        .nb-menu-btn {
          background: rgba(255,255,255,0.50);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.60);
          box-shadow: 0 2px 10px rgba(219,39,119,0.06);
        }
        .nb-icon-wrap {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nb-icon-rotated {
          transform: rotate(90deg);
        }
        .nb-mobile-menu {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 220ms cubic-bezier(0.32, 0.72, 0, 1);
          transform: translateZ(0);
        }
        .nb-mobile-menu-open {
          grid-template-rows: 1fr;
        }
        .nb-mobile-menu > div {
          overflow: hidden;
        }
        .nb-mobile-inner {
          border-top: 1px solid rgba(236,72,153,0.10);
        }
        .nb-mob-item {
          opacity: 0;
          transform: translateX(-10px);
          transition: opacity 180ms ease-out, transform 180ms ease-out;
          transition-delay: 0ms;
        }
        .nb-mob-item-active {
          opacity: 1;
          transform: translateX(0);
        }
        .nb-mob-item-active.nb-mob-item-1 {
          transition-delay: 40ms;
        }
        .nb-mob-item-active.nb-mob-item-2 {
          transition-delay: 80ms;
        }
        .nb-mob-cta {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 180ms ease-out, transform 180ms ease-out;
          transition-delay: 0ms;
        }
        .nb-mob-cta-active {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 120ms;
        }
        .nb-mob-link:hover {
          background: rgba(255,255,255,0.55);
        }
        .nb-mob-sub-link:hover {
          background: rgba(255,255,255,0.50);
        }
        .nb-mobile-drop {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 200ms cubic-bezier(0.32, 0.72, 0, 1);
          transform: translateZ(0);
        }
        .nb-mobile-drop > div {
          overflow: hidden;
        }
        .nb-mobile-drop-open {
          grid-template-rows: 1fr;
        }
        .nb-chevron {
          transition: transform 200ms ease-out;
        }
        .nb-chevron-up {
          transform: rotate(180deg);
        }
      `}</style>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 sm:pt-4 px-4 nb-header">
        <div ref={navRef} className="w-full max-w-3xl relative">
          <div className={`absolute -inset-[3px] rounded-[2.1rem] transition-all duration-500 pointer-events-none nb-glow-outer ${isActive ? "nb-glow-outer-active" : ""}`} />
          <div className={`absolute -inset-[1px] rounded-[2.05rem] transition-all duration-500 pointer-events-none nb-glow-inner ${isActive ? "nb-glow-inner-active" : ""}`} />
          <div className={`relative nb-main ${isActive ? "nb-main-active" : ""} ${open ? "nb-main-open" : ""}`}>
            <div className="absolute top-0 left-0 right-0 nb-top-line" />
            <div className="relative px-4 sm:px-6 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 group" onClick={handleClose}>
                {pengaturan?.url_logo ? (
                  <img
                    src={pengaturan.url_logo}
                    alt={pengaturan.nama_toko || "Toko"}
                    className="h-8 w-8 rounded-xl object-cover transition-all duration-300 nb-logo-img"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold text-xs nb-logo-fallback">
                    {pengaturan?.nama_toko?.charAt(0) || "G"}
                  </div>
                )}
                <span className="text-sm font-semibold tracking-tight text-gray-900 truncate max-w-[100px] sm:max-w-[140px]">
                  {pengaturan?.nama_toko || "Toko"}
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-pink-700 transition-colors duration-200 font-light px-4 py-2 rounded-2xl hover:bg-white/40"
                >
                  Beranda
                </Link>

                {kategoriList.length > 0 ? (
                  <div className="relative">
                    <button
                      onClick={() => setDropOpen(!dropOpen)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-700 transition-colors duration-200 font-light px-4 py-2 rounded-2xl hover:bg-white/40"
                    >
                      Produk
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${dropOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {dropOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[60]">
                        <div className={`p-2 min-w-[200px] rounded-2xl nb-dropdown ${isActive ? "nb-dropdown-active" : ""}`}>
                          <Link
                            href="/produkpublic"
                            onClick={() => setDropOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-500 hover:text-pink-700 rounded-xl transition-all duration-200 font-light"
                          >
                            Semua Produk
                          </Link>
                          {kategoriList.map((k) => (
                            <Link
                              key={k.id}
                              href={`/produkpublic?kategori=${k.slug}`}
                              onClick={() => setDropOpen(false)}
                              className="block px-4 py-2.5 text-sm text-gray-500 hover:text-pink-700 rounded-xl transition-all duration-200 font-light"
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
                    className="text-sm text-gray-500 hover:text-pink-700 transition-colors duration-200 font-light px-4 py-2 rounded-2xl hover:bg-white/40"
                  >
                    Produk
                  </Link>
                )}

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm font-medium px-5 py-2 rounded-full transition-all duration-500 ml-2 nb-wa-btn"
                >
                  Hubungi Kami
                </a>
              </nav>

              <button
                onClick={open ? handleClose : handleOpen}
                className="md:hidden h-9 w-9 rounded-full flex items-center justify-center text-gray-700 hover:text-pink-700 transition-all duration-300 nb-menu-btn"
              >
                <div className={`nb-icon-wrap ${open && !animating ? "nb-icon-rotated" : ""}`}>
                  {open && !animating ? <X size={18} /> : <Menu size={18} />}
                </div>
              </button>
            </div>

            <div className={`md:hidden nb-mobile-menu ${!animating && open ? "nb-mobile-menu-open" : ""}`}>
              <div>
                <div className="px-4 pb-5 pt-1 space-y-1 nb-mobile-inner">
                  <div className={`nb-mob-item nb-mob-item-1 ${!animating && open ? "nb-mob-item-active" : ""}`}>
                    <Link
                      href="/"
                      onClick={handleClose}
                      className="flex items-center text-[15px] text-gray-800 hover:text-pink-700 font-medium py-3 px-4 rounded-2xl transition-all duration-200 nb-mob-link"
                    >
                      Beranda
                    </Link>
                  </div>

                  {kategoriList.length > 0 ? (
                    <div className={`nb-mob-item nb-mob-item-2 ${!animating && open ? "nb-mob-item-active" : ""}`}>
                      <button
                        onClick={() => setMobileDrop(!mobileDrop)}
                        className="flex items-center justify-between w-full text-[15px] text-gray-800 hover:text-pink-700 font-medium py-3 px-4 rounded-2xl transition-all duration-200 nb-mob-link"
                      >
                        Produk
                        <ChevronDown
                          size={14}
                          className={`nb-chevron ${mobileDrop ? "nb-chevron-up" : ""}`}
                        />
                      </button>
                      <div className={`nb-mobile-drop ${mobileDrop && !animating ? "nb-mobile-drop-open" : ""}`}>
                        <div>
                          <div className="pl-4 space-y-0.5 pb-2">
                            <Link
                              href="/produkpublic"
                              onClick={handleClose}
                              className="block text-[14px] text-gray-600 hover:text-pink-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 nb-mob-sub-link"
                            >
                              Semua Produk
                            </Link>
                            {kategoriList.map((k) => (
                              <Link
                                key={k.id}
                                href={`/produkpublic?kategori=${k.slug}`}
                                onClick={handleClose}
                                className="block text-[14px] text-gray-600 hover:text-pink-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 nb-mob-sub-link"
                              >
                                {k.nama_kategori}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`nb-mob-item nb-mob-item-2 ${!animating && open ? "nb-mob-item-active" : ""}`}>
                      <Link
                        href="/produkpublic"
                        onClick={handleClose}
                        className="flex items-center text-[15px] text-gray-800 hover:text-pink-700 font-medium py-3 px-4 rounded-2xl transition-all duration-200 nb-mob-link"
                      >
                        Produk
                      </Link>
                    </div>
                  )}

                  <div className={`pt-2 nb-mob-cta ${!animating && open ? "nb-mob-cta-active" : ""}`}>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-white text-[15px] font-semibold px-5 py-3.5 rounded-full nb-wa-btn"
                    >
                      Hubungi Kami
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}