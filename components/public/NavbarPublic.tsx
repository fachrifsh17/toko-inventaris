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
  const navRef = useRef<HTMLDivElement>(null)

  const waLink = `https://wa.me/${pengaturan?.no_wa_toko?.replace(/^0/, "62") || ""}`
  const isActive = scrolled || open

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false)
        setDropOpen(false)
        setMobileDrop(false)
      }
    }
    document.addEventListener("mousedown", onClick, { passive: true })
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const toggleMenu = () => {
    if (open) setMobileDrop(false)
    setOpen(!open)
  }

  const closeMenu = () => {
    setOpen(false)
    setDropOpen(false)
    setMobileDrop(false)
  }

  return (
    <>
      <style>{`
        .nb-header{font-family:'DM Sans',sans-serif}
        .nb-glow-outer{
          background:linear-gradient(135deg,rgba(236,72,153,.18),rgba(219,39,119,.08),rgba(59,130,246,.12),rgba(236,72,153,.14));
          filter:blur(6px);opacity:.5;transition:opacity .5s
        }
        .nb-glow-outer-active{opacity:.8}
        .nb-glow-inner{
          background:linear-gradient(180deg,rgba(236,72,153,.25),rgba(219,39,119,.10),rgba(59,130,246,.08),rgba(236,72,153,.18));
          filter:blur(2px);opacity:.6;transition:opacity .5s
        }
        .nb-glow-inner-active{opacity:.9}
        .nb-main{
          background:rgba(255,255,255,.45);
          backdrop-filter:blur(40px) saturate(200%);
          -webkit-backdrop-filter:blur(40px) saturate(200%);
          border:1px solid rgba(255,255,255,.60);
          box-shadow:0 0 20px rgba(236,72,153,.08),0 0 40px rgba(219,39,119,.04),0 4px 24px rgba(219,39,119,.08),inset 0 1px 0 rgba(255,255,255,.60);
          border-radius:2rem;transition:background .4s,box-shadow .4s,border-radius .3s
        }
        .nb-main-active{
          background:rgba(255,255,255,.65);
          box-shadow:0 0 30px rgba(236,72,153,.10),0 0 60px rgba(219,39,119,.06),0 8px 40px rgba(219,39,119,.12),inset 0 1px 0 rgba(255,255,255,.70)
        }
        .nb-main-open{border-radius:1.5rem}
        .nb-top-line{height:1px;background:linear-gradient(90deg,transparent 10%,rgba(236,72,153,.30),rgba(147,197,253,.22),transparent 90%)}
        .nb-logo-img{border:1px solid rgba(255,255,255,.70);box-shadow:0 2px 10px rgba(219,39,119,.08)}
        .nb-logo-fallback{background:linear-gradient(135deg,#ec4899,#db2777,#3b82f6);box-shadow:0 4px 16px rgba(236,72,153,.28)}
        .nb-dropdown{
          background:rgba(255,255,255,.45);
          backdrop-filter:blur(40px) saturate(200%);
          -webkit-backdrop-filter:blur(40px) saturate(200%);
          border:1px solid rgba(255,255,255,.60);
          box-shadow:0 0 20px rgba(236,72,153,.08),0 8px 40px rgba(219,39,119,.12),inset 0 1px 0 rgba(255,255,255,.70)
        }
        .nb-dropdown-active{background:rgba(255,255,255,.65)}
        .nb-dropdown a:hover{background:rgba(236,72,153,.07)}
        .nb-wa-btn{background:linear-gradient(135deg,#ec4899,#db2777,#3b82f6);box-shadow:0 4px 20px rgba(236,72,153,.22)}
        .nb-menu-btn{
          background:rgba(255,255,255,.50);
          backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,.60);box-shadow:0 2px 10px rgba(219,39,119,.06)
        }
        .nb-mob-grid{
          display:grid;grid-template-rows:0fr;
          transition:grid-template-rows 180ms cubic-bezier(.32,.72,0,1)
        }
        .nb-mob-grid-open{grid-template-rows:1fr}
        .nb-mob-grid>div{overflow:hidden}
        .nb-mobile-inner{border-top:1px solid rgba(236,72,153,.10)}
        .nb-mob-link:hover{background:rgba(255,255,255,.55)}
        .nb-mob-sub-link:hover{background:rgba(255,255,255,.50)}
        .nb-sub-grid{
          display:grid;grid-template-rows:0fr;
          transition:grid-template-rows 160ms cubic-bezier(.32,.72,0,1)
        }
        .nb-sub-grid-open{grid-template-rows:1fr}
        .nb-sub-grid>div{overflow:hidden}
        .nb-chevron{transition:transform 200ms ease-out}
        .nb-chevron-up{transform:rotate(180deg)}
      `}</style>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 sm:pt-4 px-4 nb-header">
        <div ref={navRef} className="w-full max-w-3xl relative">
          <div className={`absolute -inset-[3px] rounded-[2.1rem] transition-all duration-500 pointer-events-none nb-glow-outer ${isActive ? "nb-glow-outer-active" : ""}`} />
          <div className={`absolute -inset-[1px] rounded-[2.05rem] transition-all duration-500 pointer-events-none nb-glow-inner ${isActive ? "nb-glow-inner-active" : ""}`} />
          <div className={`relative nb-main ${isActive ? "nb-main-active" : ""} ${open ? "nb-main-open" : ""}`}>
            <div className="absolute top-0 left-0 right-0 nb-top-line" />
            <div className="relative px-4 sm:px-6 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5" onClick={closeMenu}>
                {pengaturan?.url_logo ? (
                  <img src={pengaturan.url_logo} alt={pengaturan.nama_toko || "Toko"} className="h-8 w-8 rounded-xl object-cover nb-logo-img" />
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
                <Link href="/" className="text-sm text-gray-500 hover:text-pink-700 transition-colors duration-200 font-light px-4 py-2 rounded-2xl hover:bg-white/40">Beranda</Link>
                {kategoriList.length > 0 ? (
                  <div className="relative">
                    <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-700 transition-colors duration-200 font-light px-4 py-2 rounded-2xl hover:bg-white/40">
                      Produk
                      <ChevronDown size={14} className={`transition-transform duration-300 ${dropOpen ? "rotate-180" : ""}`} />
                    </button>
                    {dropOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[60]">
                        <div className={`p-2 min-w-[200px] rounded-2xl nb-dropdown ${isActive ? "nb-dropdown-active" : ""}`}>
                          <Link href="/produkpublic" onClick={() => setDropOpen(false)} className="block px-4 py-2.5 text-sm text-gray-500 hover:text-pink-700 rounded-xl transition-all duration-200 font-light">Semua Produk</Link>
                          {kategoriList.map((k) => (
                            <Link key={k.id} href={`/produkpublic?kategori=${k.slug}`} onClick={() => setDropOpen(false)} className="block px-4 py-2.5 text-sm text-gray-500 hover:text-pink-700 rounded-xl transition-all duration-200 font-light">{k.nama_kategori}</Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/produkpublic" className="text-sm text-gray-500 hover:text-pink-700 transition-colors duration-200 font-light px-4 py-2 rounded-2xl hover:bg-white/40">Produk</Link>
                )}
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-white text-sm font-medium px-5 py-2 rounded-full transition-all duration-500 ml-2 nb-wa-btn">Hubungi Kami</a>
              </nav>

              <button onClick={toggleMenu} className="md:hidden h-9 w-9 rounded-full flex items-center justify-center text-gray-700 hover:text-pink-700 transition-colors duration-200 nb-menu-btn">
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

            <div className={`md:hidden nb-mob-grid ${open ? "nb-mob-grid-open" : ""}`}>
              <div>
                <div className="px-4 pb-5 pt-1 space-y-1 nb-mobile-inner">
                  <Link href="/" onClick={closeMenu} className="flex items-center text-[15px] text-gray-800 hover:text-pink-700 font-medium py-3 px-4 rounded-2xl transition-colors duration-150 nb-mob-link">Beranda</Link>
                  {kategoriList.length > 0 ? (
                    <div>
                      <button onClick={() => setMobileDrop(!mobileDrop)} className="flex items-center justify-between w-full text-[15px] text-gray-800 hover:text-pink-700 font-medium py-3 px-4 rounded-2xl transition-colors duration-150 nb-mob-link">
                        Produk
                        <ChevronDown size={14} className={`nb-chevron ${mobileDrop ? "nb-chevron-up" : ""}`} />
                      </button>
                      <div className={`nb-sub-grid ${mobileDrop ? "nb-sub-grid-open" : ""}`}>
                        <div>
                          <div className="pl-4 space-y-0.5 pb-2">
                            <Link href="/produkpublic" onClick={closeMenu} className="block text-[14px] text-gray-600 hover:text-pink-700 font-medium py-2.5 px-4 rounded-xl transition-colors duration-150 nb-mob-sub-link">Semua Produk</Link>
                            {kategoriList.map((k) => (
                              <Link key={k.id} href={`/produkpublic?kategori=${k.slug}`} onClick={closeMenu} className="block text-[14px] text-gray-600 hover:text-pink-700 font-medium py-2.5 px-4 rounded-xl transition-colors duration-150 nb-mob-sub-link">{k.nama_kategori}</Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link href="/produkpublic" onClick={closeMenu} className="flex items-center text-[15px] text-gray-800 hover:text-pink-700 font-medium py-3 px-4 rounded-2xl transition-colors duration-150 nb-mob-link">Produk</Link>
                  )}
                  <div className="pt-2">
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="block text-center text-white text-[15px] font-semibold px-5 py-3.5 rounded-full nb-wa-btn">Hubungi Kami</a>
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