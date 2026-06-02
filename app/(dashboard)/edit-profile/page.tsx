"use client";

import { useActionState, useEffect, useState } from "react";
import { getCurrentUser, updateUserProfileAction } from "@/actions/user";

export default function EditProfilePage() {
  const [state, formAction] = useActionState(updateUserProfileAction, undefined);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((result) => {
      if (result.success && result.data) {
        setUser(result.data);
      }
      setLoading(false);
    });
  }, []);

  // Refresh data setelah berhasil update profil
  useEffect(() => {
    if (state?.success) {
      getCurrentUser().then((result) => {
        if (result.success && result.data) {
          setUser(result.data);
        }
      });
    }
  }, [state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Memuat profil...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xs max-w-2xl">
        <p className="text-rose-500 text-sm">Gagal memuat data profil Anda. Sesi Anda mungkin telah habis.</p>
        <button
          onClick={() => window.location.href = "/login"}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Ke Halaman Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profil Saya
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Perbarui data akun personal dan atur kata sandi keamanan Anda di sini.
        </p>
      </div>

      {/* Status Messages */}
      {state?.success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{state.message}</span>
        </div>
      )}
      {state?.error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm animate-fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{state.error}</span>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Data Akun (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Form Detail Profile */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4.5 h-4.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informasi Akun
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label htmlFor="nama_lengkap" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  id="nama_lengkap"
                  name="nama_lengkap"
                  type="text"
                  defaultValue={user.nama_lengkap}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-450 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={user.username}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-450 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                  placeholder="Masukkan username unik"
                />
                <p className="text-[10px] text-slate-400 font-medium">Username digunakan untuk masuk (*login*) ke dashboard.</p>
              </div>

            </div>
          </div>

          {/* Keamanan & Password Baru */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4.5 h-4.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Ganti Kata Sandi (Opsional)
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              
              <div className="space-y-2">
                <label htmlFor="password_baru" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password Baru
                </label>
                <input
                  id="password_baru"
                  name="password_baru"
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  placeholder="Isi hanya jika ingin mengubah password"
                />
                <p className="text-[10px] text-slate-400 font-medium">Kosongkan jika Anda tidak berniat untuk merubah password saat ini. Minimal 6 karakter.</p>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Avatar & Verification Password */}
        <div className="space-y-6">
          
          {/* Avatar Profile Preview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col items-center text-center">
            
            {/* Elegant Avatar Initials */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 select-none animate-pulse">
              {(user.nama_lengkap || "U").substring(0, 2).toUpperCase()}
            </div>

            <h4 className="text-sm font-bold text-slate-800">{user.nama_lengkap}</h4>
            <p className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
              @{user.username}
            </p>

            <div className="border-t border-slate-100 my-4 w-full"></div>

            <span className="text-[10px] text-slate-400 font-medium block">
              Terdaftar sejak:{" "}
              <span className="text-slate-600 font-semibold block mt-0.5">
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </span>

          </div>

          {/* Secure confirmation card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
            
            <div className="space-y-2">
              <label htmlFor="password_sekarang" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                Password Saat Ini <span className="text-rose-500">*</span>
              </label>
              <input
                id="password_sekarang"
                name="password_sekarang"
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                placeholder="Verifikasi password lama Anda"
              />
              <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                Anda wajib memasukkan password Anda yang aktif saat ini untuk dapat menyimpan setiap perubahan profil.
              </p>
            </div>

            <div className="border-t border-slate-100 my-2"></div>

            <SubmitButton />

          </div>

        </div>

      </form>
    </div>
  );
}

// Tombol submit menggunakan useFormStatus
function SubmitButton() {
  const { useFormStatus } = require("react-dom");
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
    >
      {pending ? (
        <>
          <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Menyimpan...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Perbarui Profil</span>
        </>
      )}
    </button>
  );
}
