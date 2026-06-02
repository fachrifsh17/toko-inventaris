"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";

interface NavbarProps {
  onMenuClick?: () => void;
  namaToko?: string;
  urlLogo?: string | null;
}

export default function Navbar({
  onMenuClick,
  namaToko = "Toko",
  urlLogo,
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-slate-200/50 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left - Breadcrumb & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu on Mobile */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Title */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-850 tracking-tight leading-tight">
              Selamat Datang
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium hidden sm:block">
              Kelola bisnis Anda dengan mudah &amp; akurat
            </p>
          </div>
        </div>

        {/* Right - Profile & Settings */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button 
            aria-label="Notifikasi"
            title="Notifikasi"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-indigo-600 transition-colors relative cursor-pointer group"
          >
            <svg
              className="w-5.5 h-5.5 transition-transform duration-200 group-hover:rotate-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white group-hover:scale-110 transition-transform"></span>
          </button>

          <div className="w-px h-6 bg-slate-200"></div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <div className="w-8.5 h-8.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/10">
                U
              </div>
              <div className="text-left hidden sm:block pr-1">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  User Admin
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">
                  Super Administrator
                </p>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2.5 w-52 bg-white rounded-2xl shadow-xl border border-indigo-500/40 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-indigo-50">
                  <p className="text-xs font-semibold text-slate-800">
                    User Admin
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    admin@
                    {namaToko.toLowerCase().replace(/[^a-z0-9]/g, "") ||
                      "Toko"}
                    .id
                  </p>
                </div>

                <Link
                  href="/edit-profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors"
                >
                  <svg
                    className="w-4.5 h-4.5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profil Saya</span>
                </Link>

                <Link
                  href="/pengaturan"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors"
                >
                  <svg
                    className="w-4.5 h-4.5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Pengaturan</span>
                </Link>

                <div className="border-t border-indigo-50 my-1.5"></div>

                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    await logoutAction();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer font-medium"
                >
                  <svg
                    className="w-4.5 h-4.5 text-rose-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}