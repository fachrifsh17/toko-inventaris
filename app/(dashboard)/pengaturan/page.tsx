"use client";

import { useActionState, useEffect, useState } from "react";
import { getPengaturan, updatePengaturanAction } from "@/actions/pengaturan";
import { toast } from "react-hot-toast";

export default function PengaturanPage() {
  const [state, formAction] = useActionState(updatePengaturanAction, undefined);
  const [pengaturan, setPengaturan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    getPengaturan().then((result) => {
      if (result.success && result.data) {
        setPengaturan(result.data);
        setLogoPreview(result.data.url_logo || null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message || "Pengaturan berhasil disimpan!", { position: "top-center" });
        getPengaturan().then((result) => {
          if (result.success && result.data) {
            setPengaturan(result.data);
            setLogoPreview(result.data.url_logo || null);
          }
        });
      } else {
        toast.error(state.message || "Gagal menyimpan pengaturan.", { position: "top-center" });
      }
    }
  }, [state]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Memuat pengaturan...</span>
        </div>
      </div>
    );
  }

  if (!pengaturan) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xs max-w-2xl">
        <p className="text-rose-500 text-sm">Gagal memuat data pengaturan toko.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan Toko</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Kelola informasi dasar, kontak, dan identitas visual toko Anda secara real-time.
        </p>
      </div>

      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <input type="hidden" name="id" value={pengaturan.id} />

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-800 text-sm">Identitas Toko</div>
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="nama_toko" className="block text-xs font-bold text-slate-600 uppercase mb-2">Nama Toko *</label>
                <input id="nama_toko" name="nama_toko" type="text" defaultValue={pengaturan.nama_toko} placeholder="Masukkan nama toko" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
              </div>
              <div>
                <label htmlFor="tagline" className="block text-xs font-bold text-slate-600 uppercase mb-2">Tagline</label>
                <input id="tagline" name="tagline" type="text" defaultValue={pengaturan.tagline} placeholder="Masukkan slogan atau tagline toko" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
              </div>
              <div>
                <label htmlFor="deskripsi" className="block text-xs font-bold text-slate-600 uppercase mb-2">Deskripsi</label>
                <textarea id="deskripsi" name="deskripsi" rows={4} defaultValue={pengaturan.deskripsi} placeholder="Tulis deskripsi profil singkat toko Anda" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-800 text-sm">Kontak, Alamat & Peta</div>
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="no_wa_toko" className="block text-xs font-bold text-slate-600 uppercase mb-2">No. WhatsApp Toko *</label>
                <input id="no_wa_toko" name="no_wa_toko" type="text" defaultValue={pengaturan.no_wa_toko} placeholder="Contoh: 628123456789" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="link_instagram" className="block text-xs font-bold text-slate-600 uppercase mb-2">Link Instagram</label>
                  <input id="link_instagram" name="link_instagram" type="url" defaultValue={pengaturan.link_instagram} placeholder="https://instagram.com/nama_toko" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
                </div>
                <div>
                  <label htmlFor="link_facebook" className="block text-xs font-bold text-slate-600 uppercase mb-2">Link Facebook</label>
                  <input id="link_facebook" name="link_facebook" type="url" defaultValue={pengaturan.link_facebook} placeholder="https://facebook.com/nama_toko" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
                </div>
              </div>
              <div>
                <label htmlFor="link_tiktok" className="block text-xs font-bold text-slate-600 uppercase mb-2">Link TikTok</label>
                <input id="link_tiktok" name="link_tiktok" type="url" defaultValue={pengaturan.link_tiktok} placeholder="https://tiktok.com/@nama_toko" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
              </div>
              <div>
                <label htmlFor="alamat" className="block text-xs font-bold text-slate-600 uppercase mb-2">Alamat Lengkap</label>
                <textarea id="alamat" name="alamat" rows={2} defaultValue={pengaturan.alamat} placeholder="Masukkan nama jalan, nomor gedung, RT/RW, kecamatan, dan kota" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
              </div>
              <div>
                <label htmlFor="embed_maps" className="block text-xs font-bold text-slate-600 uppercase mb-2">Embed Code Google Maps</label>
                <textarea id="embed_maps" name="embed_maps" rows={3} defaultValue={pengaturan.embed_maps} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>' />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 text-center">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Logo Toko</h3>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-4 flex flex-col items-center transition-colors duration-200 group">
              {logoPreview && <img src={logoPreview} alt="Logo" className="w-32 h-32 object-contain mb-2 rounded-xl" />}
              <input 
                id="url_logo"
                type="file" 
                name="url_logo" 
                onChange={handleLogoChange} 
                title="Pilih logo toko"
                aria-label="Pilih logo toko"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <span className="text-xs text-slate-400 group-hover:text-indigo-600 transition-colors duration-200">Klik untuk ganti logo</span>
            </div>
            <div className="mt-6">
              <SubmitButton />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { useFormStatus } = require("react-dom");
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition duration-200 shadow-sm cursor-pointer disabled:cursor-not-allowed">
      {pending ? "Menyimpan..." : "Simpan Pengaturan"}
    </button>
  );
}