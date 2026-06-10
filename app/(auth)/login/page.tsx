"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth";
import { getPengaturan } from "@/actions/pengaturan";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 overflow-hidden group"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Memvalidasi...</span>
        </>
      ) : (
        <>
          <span>Masuk</span>
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </>
      )}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, undefined);
  const [namaToko, setNamaToko] = useState("Toko");
  const [tagline, setTagline] = useState("Masuk ke pusat kendali operasional skincare");
  const [urlLogo, setUrlLogo] = useState("");

  useEffect(() => {
    getPengaturan().then((result) => {
      if (result.success && result.data) {
        setNamaToko(result.data.nama_toko || "Toko");
        setTagline(result.data.tagline || "Masuk ke pusat kendali operasional");
        setUrlLogo(result.data.url_logo || "");
      }
    });
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-100/50 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rose-100/50 blur-[120px] pointer-events-none"></div>
      <div className="relative w-full max-w-md animate-fade-in z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          {urlLogo ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 bg-white mb-4 shadow-lg">
              <img
                src={urlLogo}
                alt={namaToko}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/20 text-white mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{namaToko} Dashboard</h2>
          <p className="text-sm text-gray-400 mt-2">{tagline}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-200 relative overflow-hidden">
          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 text-sm"
                  placeholder="Masukkan username Anda"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 text-sm"
                  placeholder="Masukkan password Anda"
                  required
                />
              </div>
            </div>
            {state?.error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{state.error}</span>
              </div>
            )}
            <SubmitButton />
          </form>
        </div>
        <p className="text-center text-xs text-gray-300 mt-8">
          &copy; {new Date().getFullYear()} {namaToko}. All rights reserved.
        </p>
      </div>
    </div>
  );
}