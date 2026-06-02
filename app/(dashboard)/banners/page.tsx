"use client";

import { useState, useEffect, useTransition } from "react";
import PortalModal from "@/components/PortalModal";
import {
  getBanners,
  addBannerAction,
  editBannerAction,
  deleteBannerAction,
} from "@/actions/banners";

// ─── Types ───────────────────────────────────────────
type Banner = {
  id: number;
  judul_banner: string | null;
  url_foto_banner: string;
  link_tujuan: string | null;
  urutan: number;
  is_active: boolean | null;
  created_at: Date;
  updated_at: Date | null;
};
type Msg = { type: "success" | "error"; text: string };

// ─── Shared Input style ───────────────────────────────
const inputCls =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white";

// ─── Form Field ───────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────
function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return <PortalModal onClose={onClose}>{children}</PortalModal>;
}

// ─── Modal Header ─────────────────────────────────────
function ModalHeader({
  title,
  color,
  onClose,
}: {
  title: string;
  color: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <button
        onClick={onClose}
        title="Tutup"
        aria-label="Tutup modal"
        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Banner Form Fields ───────────────────────────────
function BannerFormFields({
  defaultValues,
}: {
  defaultValues?: Banner | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>(
    defaultValues?.url_foto_banner || "",
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert("Error: " + (data.error || "Gagal upload gambar"));
        setPreviewUrl(defaultValues?.url_foto_banner || "");
        return;
      }

      const data = await res.json();
      if (data.success) {
        const hiddenInput = document.querySelector(
          'input[name="url_foto_uploaded"]',
        ) as HTMLInputElement;
        if (hiddenInput) {
          hiddenInput.value = data.url;
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal upload gambar");
      setPreviewUrl(defaultValues?.url_foto_banner || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    const hiddenInput = document.querySelector(
      'input[name="url_foto_uploaded"]',
    ) as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = "";
    }
  };

  return (
    <>
      <Field label="Judul Banner">
        <input
          name="judul_banner"
          defaultValue={defaultValues?.judul_banner ?? ""}
          placeholder="contoh: Promo Akhir Tahun"
          className={inputCls}
        />
      </Field>

      <Field label="Link Tujuan">
        <input
          name="link_tujuan"
          type="url"
          defaultValue={defaultValues?.link_tujuan ?? ""}
          placeholder="https://contoh.com/halaman"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Urutan" required>
          <input
            name="urutan"
            type="number"
            min={0}
            required
            defaultValue={defaultValues?.urutan ?? 0}
            placeholder="0"
            className={inputCls}
          />
        </Field>

        <Field label="Status" required>
          <select
            name="is_active"
            title="Status Banner"
            aria-label="Pilih status aktif atau nonaktif banner"
            defaultValue={String(defaultValues?.is_active ?? true)}
            className={inputCls}
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </Field>
      </div>

      <Field label="Foto Banner" required>
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
            <svg
              className="w-8 h-8 text-slate-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Klik untuk upload atau drag file
              </p>
              <p className="text-xs text-slate-500 mt-1">
                JPG, PNG, GIF, WebP • Max 5MB
              </p>
            </div>
            <input
              type="file"
              name="url_foto"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {previewUrl && (
            <div className="relative inline-block">
              <div className="w-48 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg
                      className="w-5 h-5 animate-spin mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <p className="text-xs mt-1">Uploading...</p>
                  </div>
                </div>
              )}
              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  title="Hapus Gambar"
                  aria-label="Hapus gambar pratinjau"
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          <input
            type="hidden"
            name="url_foto_uploaded"
            defaultValue={defaultValues?.url_foto_banner || ""}
          />
        </div>
      </Field>
    </>
  );
}

// ════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════
export default function BannerPage() {
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageMsg, setPageMsg] = useState<Msg | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formMsg, setFormMsg] = useState<Msg | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State tambahan untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isPending, startTransition] = useTransition();

  // ── Load data ──
  const load = async () => {
    setLoading(true);
    try {
      const res = await getBanners();
      if (res.success && res.data) {
        setBannerList(res.data as Banner[]);
      } else {
        setPageMsg({ type: "error", text: res.error || "Gagal mengambil data banner." });
        setBannerList([]);
      }
    } catch (err) {
      console.error("Error loading banners:", err);
      setPageMsg({ type: "error", text: "Gagal memuat data banner." });
      setBannerList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reset ke halaman 1 jika user sedang mengetik di kolom pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (!pageMsg) return;
    const t = setTimeout(() => setPageMsg(null), 3500);
    return () => clearTimeout(t);
  }, [pageMsg]);

  // ── Handlers ──
  const openAdd = () => {
    setFormMsg(null);
    setShowAdd(true);
  };

  const openEdit = (b: Banner) => {
    setSelectedBanner(b);
    setFormMsg(null);
    setShowEdit(true);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addBannerAction(null, fd);
      if (res.success) {
        setShowAdd(false);
        setPageMsg({ type: "success", text: res.message! });
        await load();
        (e.target as HTMLFormElement).reset();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await editBannerAction(null, fd);
      if (res.success) {
        setShowEdit(false);
        setSelectedBanner(null);
        setPageMsg({ type: "success", text: res.message! });
        await load();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleDelete = (b: Banner) => {
    if (!confirm(`Hapus banner "${b.judul_banner || "tanpa judul"}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", String(b.id));
      const res = await deleteBannerAction(null, fd);
      if (res.success) {
        setPageMsg({ type: "success", text: res.message! });
        await load();
      } else {
        setPageMsg({ type: "error", text: res.error! });
      }
    });
  };

  // ── Filtered & Paginated list ──
  const filteredBanners = bannerList.filter(
    (b) =>
      (b.judul_banner?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (b.link_tujuan?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBanners = filteredBanners.slice(startIndex, startIndex + itemsPerPage);

  // ── Alert sub-component ──
  const Alert = ({ msg }: { msg: Msg }) => (
    <div
      className={`text-sm p-3 rounded-lg ${
        msg.type === "error"
          ? "bg-red-50 text-red-600 border border-red-100"
          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
      }`}
    >
      {msg.text}
    </div>
  );

  // ── Form footer buttons ──
  const FormFooter = ({
    onCancel,
    submitLabel,
  }: {
    onCancel: () => void;
    submitLabel: string;
  }) => (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {isPending && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {submitLabel}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-4">
      {/* ── Page Header dengan Tombol Tambah ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Manajemen Banner</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Kelola banner slider di halaman utama — tambah, edit, atau hapus.
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm shrink-0 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Banner
          </button>
        </div>
      </div>

      {/* ── Alert Banner ── */}
      {pageMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
            pageMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {pageMsg.type === "success" ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {pageMsg.text}
        </div>
      )}

      {/* ── Search (tanpa card) ── */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari banner..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* ── Banner Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Memuat data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 font-semibold">No</th>
                  <th className="py-4 px-4 font-semibold">Preview</th>
                  <th className="py-4 px-4 font-semibold">Judul</th>
                  <th className="py-4 px-4 font-semibold">Link Tujuan</th>
                  <th className="py-4 px-4 font-semibold text-center">Urutan</th>
                  <th className="py-4 px-4 font-semibold text-center">Status</th>
                  <th className="py-4 px-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedBanners.map((b, i) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-4 text-slate-500 text-sm align-middle">
                      {startIndex + i + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                        {b.url_foto_banner ? (
                          <img
                            src={b.url_foto_banner}
                            alt={b.judul_banner || "Banner"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.png";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800 text-sm">
                        {b.judul_banner || <span className="text-slate-400 italic">Tanpa judul</span>}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {b.link_tujuan ? (
                        <a
                          href={b.link_tujuan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium truncate block max-w-[200px] hover:underline"
                          title={b.link_tujuan}
                        >
                          {b.link_tujuan}
                          <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold">
                        {b.urutan}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          b.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {b.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          disabled={isPending}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBanners.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm font-medium">
                          {searchQuery ? "Banner tidak ditemukan" : "Belum ada banner"}
                        </p>
                        <p className="text-xs text-slate-300">
                          {searchQuery ? "Coba kata kunci lain" : 'Klik "Tambah Banner" untuk mulai'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer Tabel dengan Tombol Prev & Next ── */}
        {!loading && filteredBanners.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-slate-400">
              Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredBanners.length)} dari {filteredBanners.length} banner
            </p>
            
            {/* Tombol Pagination Sesuai Desain Gambar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-1.5 border border-slate-800 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-4 py-1.5 border border-slate-800 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════ ADD MODAL ══════ */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <ModalHeader
            title="Tambah Banner"
            color="bg-indigo-100 text-indigo-600"
            onClose={() => setShowAdd(false)}
          />
          <form onSubmit={handleAdd} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {formMsg && <Alert msg={formMsg} />}
            <BannerFormFields />
            <FormFooter
              onCancel={() => setShowAdd(false)}
              submitLabel="Simpan Banner"
            />
          </form>
        </Modal>
      )}

      {/* ══════ EDIT MODAL ══════ */}
      {showEdit && selectedBanner && (
        <Modal onClose={() => setShowEdit(false)}>
          <ModalHeader
            title="Edit Banner"
            color="bg-emerald-100 text-emerald-600"
            onClose={() => setShowEdit(false)}
          />
          <form onSubmit={handleEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <input type="hidden" name="id" value={selectedBanner.id} />
            {formMsg && <Alert msg={formMsg} />}
            <BannerFormFields defaultValues={selectedBanner} />
            <FormFooter
              onCancel={() => setShowEdit(false)}
              submitLabel="Simpan Perubahan"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}