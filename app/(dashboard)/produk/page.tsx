"use client";

import { useState, useEffect, useTransition } from "react";
import PortalModal from "@/components/PortalModal";
import { toast } from "react-hot-toast";
import {
  getProduk,
  addProdukAction,
  editProdukAction,
  deleteProdukAction,
} from "@/actions/produk";
import {
  getKategori as getKategoriList,
  addKategoriAction,
  editKategoriAction,
  deleteKategoriAction,
} from "@/actions/kategori";

type Kategori = {
  id: number;
  nama_kategori: string;
  slug?: string;
  _count?: { produk: number };
};
type Produk = {
  id: number;
  nama_produk: string;
  deskripsi: string | null;
  harga_jual: number;
  harga_modal: number;
  stok_sekarang: number | null;
  kategori_id: number | null;
  url_foto: string;
  is_active: boolean | null;
  created_at: Date;
  kategori: { id: number; nama_kategori: string } | null;
};
type Msg = { type: "success" | "error"; text: string };
type Tab = "produk" | "kategori";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const inputCls =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white";

const iconCube = "M20 7l-8-4-8 4m0 0l8-4m0 0l8 4m0 0v10l-8 4m0-10L4 17m16 0l-8 4m0 0l-8-4m0 0v-10";
const iconEdit = "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        <span className="block mb-1.5">{label}</span>
        {children}
      </label>
    </div>
  );
}

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return <PortalModal onClose={onClose}>{children}</PortalModal>;
}

function ModalHeader({
  title,
  color,
  iconPath,
  onClose,
}: {
  title: string;
  color: string;
  iconPath: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`} aria-hidden="true">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <button
        onClick={onClose}
        aria-label="Tutup modal"
        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ProdukFormFields({
  kategoriList,
  defaultValues,
}: {
  kategoriList: Kategori[];
  defaultValues?: Produk | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>(
    defaultValues?.url_foto || "",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [hargaModalStr, setHargaModalStr] = useState<string>(
    defaultValues?.harga_modal ? String(defaultValues.harga_modal) : "0",
  );
  const [hargaJualStr, setHargaJualStr] = useState<string>(
    defaultValues?.harga_jual ? String(defaultValues.harga_jual) : "0",
  );
  const [stokStr, setStokStr] = useState<string>(
    defaultValues?.stok_sekarang != null
      ? String(defaultValues.stok_sekarang)
      : "0",
  );

  const format = (v: string | number) => {
    const n = Number(String(v).replace(/[^0-9-]/g, "")) || 0;
    return n.toLocaleString("id-ID");
  };
  const parse = (s: string) => Number(String(s).replace(/[^0-9-]/g, "")) || 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setPreviewUrl("");
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
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Field label="Nama Produk">
        <input
          name="nama_produk"
          required
          defaultValue={defaultValues?.nama_produk}
          placeholder="contoh: Serum Vitamin C"
          className={inputCls}
        />
      </Field>

      <Field label="Deskripsi">
        <textarea
          name="deskripsi"
          rows={3}
          defaultValue={defaultValues?.deskripsi ?? ""}
          placeholder="Deskripsi singkat produk..."
          className={inputCls + " resize-none"}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Harga Modal (Rp)">
          <div>
            <label htmlFor="harga_modal_display" className="sr-only">Harga Modal</label>
            <input
              id="harga_modal_display"
              type="text"
              value={format(hargaModalStr)}
              onChange={(e) => setHargaModalStr(String(parse(e.target.value)))}
              placeholder="0"
              className={inputCls}
            />
            <input type="hidden" name="harga_modal" value={parse(hargaModalStr)} />
          </div>
        </Field>
        <Field label="Harga Jual (Rp)">
          <div>
            <label htmlFor="harga_jual_display" className="sr-only">Harga Jual</label>
            <input
              id="harga_jual_display"
              type="text"
              value={format(hargaJualStr)}
              onChange={(e) => setHargaJualStr(String(parse(e.target.value)))}
              placeholder="0"
              className={inputCls}
            />
            <input type="hidden" name="harga_jual" value={parse(hargaJualStr)} />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Stok Sekarang">
          <div>
            <label htmlFor="stok_sekarang_display" className="sr-only">Stok Sekarang</label>
            <input
              id="stok_sekarang_display"
              type="text"
              value={format(stokStr)}
              onChange={(e) => setStokStr(String(parse(e.target.value)))}
              className={inputCls}
            />
            <input type="hidden" name="stok_sekarang" value={parse(stokStr)} />
          </div>
        </Field>
        <Field label="Kategori">
          <label htmlFor="kategori_id" className="sr-only">Pilih Kategori</label>
          <select
            id="kategori_id"
            name="kategori_id"
            defaultValue={defaultValues?.kategori_id ?? ""}
            className={inputCls}
          >
            <option value="">-- Pilih Kategori --</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama_kategori}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Foto Produk">
        <div className="space-y-3">
          <label
            htmlFor="url_foto_file"
            className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors"
          >
            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">Klik untuk upload atau drag file</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, GIF, WebP • Max 5MB</p>
            </div>
            <input
              id="url_foto_file"
              type="file"
              name="url_foto"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {previewUrl && (
            <div className="relative w-24 h-24">
              <img
                src={previewUrl}
                alt="Preview produk"
                className="w-24 h-24 object-cover rounded-lg border border-slate-200"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="w-4 h-4 animate-spin mx-auto" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}

          <input type="hidden" name="url_foto_uploaded" defaultValue={defaultValues?.url_foto || ""} />
        </div>
      </Field>

      <Field label="Status">
        <label htmlFor="is_active" className="sr-only">Status Aktif</label>
        <select
          id="is_active"
          name="is_active"
          defaultValue={String(defaultValues?.is_active ?? true)}
          className={inputCls}
        >
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
      </Field>
    </>
  );
}

function KategoriFormFields({
  defaultValues,
}: {
  defaultValues?: Kategori | null;
}) {
  return (
    <>
      <Field label="Nama Kategori">
        <input
          name="nama_kategori"
          required
          defaultValue={defaultValues?.nama_kategori}
          placeholder="contoh: Skincare, Makeup"
          className={inputCls}
        />
      </Field>

      <Field label="Slug">
        <input
          name="slug"
          defaultValue={defaultValues?.slug ?? ""}
          placeholder="auto-generated dari nama kategori"
          className={inputCls}
        />
      </Field>
    </>
  );
}

export default function ProdukPage() {
  const [activeTab, setActiveTab] = useState<Tab>("produk");

  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [produkPage, setProdukPage] = useState<number>(1);
  const [produkPageSize] = useState<number>(10);
  const [produkTotal, setProdukTotal] = useState<number>(0);
  const [kategoriFilter, setKategoriFilter] = useState<string>("");
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduk, setShowAddProduk] = useState(false);
  const [showEditProduk, setShowEditProduk] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [formMsg, setFormMsg] = useState<Msg | null>(null);
  const [searchProduk, setSearchProduk] = useState("");

  const [showDeleteProduk, setShowDeleteProduk] = useState(false);
  const [deleteProdukTarget, setDeleteProdukTarget] = useState<Produk | null>(null);

  const [kategoriEditList, setKategoriEditList] = useState<Kategori[]>([]);
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [showEditKategori, setShowEditKategori] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [searchKategori, setSearchKategori] = useState("");
  const [catPage, setCatPage] = useState<number>(1);
  const [catPageSize] = useState<number>(8);

  const [showDeleteKategori, setShowDeleteKategori] = useState(false);
  const [deleteKategoriTarget, setDeleteKategoriTarget] = useState<Kategori | null>(null);

  const [isPending, startTransition] = useTransition();

  const load = async () => {
    setLoading(true);
    try {
      const p = await getProduk({
        page: produkPage,
        pageSize: produkPageSize,
        kategori_id: kategoriFilter === "" ? undefined : Number(kategoriFilter),
      });
      if (!p.success) {
        setProdukList([]);
        setProdukTotal(0);
      } else if (p.success && p.data) {
        if (Array.isArray(p.data)) {
          setProdukList(p.data as Produk[]);
          setProdukTotal((p.data as Produk[]).length);
        } else {
          setProdukList((p.data as any).rows as Produk[]);
          setProdukTotal((p.data as any).total ?? 0);
        }
      }

      try {
        const k = await getKategoriList();
        if (k.success && k.data) setKategoriList(k.data as Kategori[]);
      } catch (errK) {
        console.error("Error getKategoriList:", errK);
      }
    } catch (err) {
      console.error("Error loading produk/kategori:", err);
      setProdukList([]);
      setProdukTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadKategori = async () => {
    const res = await getKategoriList();
    if (res.success && res.data) {
      setKategoriEditList(res.data as Kategori[]);
      setKategoriList(res.data as Kategori[]);
    }
  };

  useEffect(() => {
    load();
    loadKategori();
  }, [produkPage, kategoriFilter]);

  const openAddProduk = () => {
    setFormMsg(null);
    setShowAddProduk(true);
  };
  const openEditProduk = (p: Produk) => {
    setSelectedProduk(p);
    setFormMsg(null);
    setShowEditProduk(true);
  };
  const openAddKategori = () => {
    setFormMsg(null);
    setShowAddKategori(true);
  };
  const openEditKategori = (k: Kategori) => {
    setSelectedKategori(k);
    setFormMsg(null);
    setShowEditKategori(true);
  };

  const handleAddProduk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addProdukAction(null, fd);
      if (res.success) {
        setShowAddProduk(false);
        toast.success(res.message || "Produk berhasil disimpan!", { position: "top-center" });
        await load();
        (e.target as HTMLFormElement).reset();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleEditProduk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await editProdukAction(null, fd);
      if (res.success) {
        setShowEditProduk(false);
        setSelectedProduk(null);
        toast.success(res.message || "Perubahan berhasil disimpan!", { position: "top-center" });
        await load();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleDeleteProduk = (p: Produk) => {
    setDeleteProdukTarget(p);
    setShowDeleteProduk(true);
  };

  const executeDeleteProduk = () => {
    if (!deleteProdukTarget) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", String(deleteProdukTarget.id));
      const res = await deleteProdukAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Produk berhasil dihapus!", { position: "top-center" });
        setShowDeleteProduk(false);
        setDeleteProdukTarget(null);
        await load();
      } else {
        toast.error(res.error || "Gagal menghapus produk.", { position: "top-center" });
        setShowDeleteProduk(false);
        setDeleteProdukTarget(null);
      }
    });
  };

  const handleAddKategori = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addKategoriAction(null, fd);
      if (res.success) {
        setShowAddKategori(false);
        toast.success(res.message || "Kategori berhasil disimpan!", { position: "top-center" });
        await loadKategori();
        (e.target as HTMLFormElement).reset();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleEditKategori = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await editKategoriAction(null, fd);
      if (res.success) {
        setShowEditKategori(false);
        setSelectedKategori(null);
        toast.success(res.message || "Perubahan berhasil disimpan!", { position: "top-center" });
        await loadKategori();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleDeleteKategori = (k: Kategori) => {
    setDeleteKategoriTarget(k);
    setShowDeleteKategori(true);
  };

  const executeDeleteKategori = () => {
    if (!deleteKategoriTarget) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", String(deleteKategoriTarget.id));
      const res = await deleteKategoriAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Kategori berhasil dihapus!", { position: "top-center" });
        setShowDeleteKategori(false);
        setDeleteKategoriTarget(null);
        await loadKategori();
      } else {
        toast.error(res.error || "Gagal menghapus kategori.", { position: "top-center" });
        setShowDeleteKategori(false);
        setDeleteKategoriTarget(null);
      }
    });
  };

  const filteredProduk = produkList.filter(
    (p) =>
      (p.nama_produk.toLowerCase().includes(searchProduk.toLowerCase()) ||
        (p.kategori?.nama_kategori ?? "")
          .toLowerCase()
          .includes(searchProduk.toLowerCase())) &&
      (!kategoriFilter || String(p.kategori_id) === kategoriFilter),
  );

  const filteredKategori = kategoriEditList.filter((k) =>
    k.nama_kategori.toLowerCase().includes(searchKategori.toLowerCase()),
  );

  const pagedKategori = filteredKategori.slice(
    (catPage - 1) * catPageSize,
    catPage * catPageSize,
  );

  const totalPagesProduk = Math.ceil(produkTotal / produkPageSize);
  const totalPagesKategori = Math.ceil(filteredKategori.length / catPageSize);

  const getPaginationNumbers = (currentPage: number, totalPages: number) => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const Alert = ({ msg }: { msg: Msg }) => (
    <div
      role="alert"
      className={`text-sm p-3 rounded-lg ${msg.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
    >
      {msg.text}
    </div>
  );

  const FormFooter = ({
    onCancel,
    submitLabel,
  }: {
    onCancel: () => void;
    submitLabel: string;
  }) => (
    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
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
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {submitLabel}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Produk & Kategori</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola produk dan kategori toko — tambah, edit, atau hapus.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1 flex gap-1 inline-flex">
        <button
          onClick={() => setActiveTab("produk")}
          aria-label="Tab Produk"
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "produk" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8-4m0 0l8 4m0 0v10l-8 4m0-10L4 17m16 0l-8 4m0 0l-8-4m0 0v-10" />
          </svg>
          Produk
        </button>
        <button
          onClick={() => setActiveTab("kategori")}
          aria-label="Tab Kategori"
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "kategori" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Kategori
        </button>
      </div>

      {activeTab === "produk" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Daftar Produk</h2>
              <p className="text-slate-500 text-sm mt-1">Kelola semua produk toko anda</p>
            </div>
            <button
              onClick={openAddProduk}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Produk
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <label htmlFor="search_produk" className="sr-only">Cari produk atau kategori</label>
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="search_produk"
                value={searchProduk}
                onChange={(e) => setSearchProduk(e.target.value)}
                placeholder="Cari produk atau kategori..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="filter_kategori" className="sr-only">Filter kategori</label>
              <select
                id="filter_kategori"
                value={kategoriFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setKategoriFilter(v);
                  setProdukPage(1);
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="">Semua Kategori</option>
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
                      <th className="py-4 px-4 font-semibold">Produk</th>
                      <th className="py-4 px-4 font-semibold">Kategori</th>
                      <th className="py-4 px-4 font-semibold">Harga Modal</th>
                      <th className="py-4 px-4 font-semibold">Harga Jual</th>
                      <th className="py-4 px-4 font-semibold">Stok</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredProduk.map((p, i) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 text-slate-500 text-sm align-middle">{p.id}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50 flex items-center justify-center">
                              {p.url_foto ? (
                                <img src={p.url_foto} alt={p.nama_produk} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{p.nama_produk}</p>
                              {p.deskripsi && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 max-w-xs">{p.deskripsi}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {p.kategori ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">{p.kategori.nama_kategori}</span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-sm font-medium">{idr(p.harga_modal)}</td>
                        <td className="py-3 px-4 text-slate-800 text-sm font-semibold">{idr(p.harga_jual)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${(p.stok_sekarang ?? 0) <= 0 ? "bg-red-50 text-red-600 border border-red-100" : (p.stok_sekarang ?? 0) <= 5 ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                            {p.stok_sekarang ?? 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                            {p.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditProduk(p)}
                              aria-label={`Edit produk ${p.nama_produk}`}
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteProduk(p)}
                              disabled={isPending}
                              aria-label={`Hapus produk ${p.nama_produk}`}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProduk.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m0 0l8-4m0 0l8 4m0 0v10l-8 4m0-10L4 17m16 0l-8 4m0 0l-8-4m0 0v-10" />
                            </svg>
                            <p className="text-sm font-medium">{searchProduk ? "Produk tidak ditemukan" : "Belum ada produk"}</p>
                            <p className="text-xs text-slate-300">{searchProduk ? "Coba kata kunci lain" : 'Klik "Tambah Produk" untuk mulai'}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && totalPagesProduk > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-slate-400">Total <span className="font-semibold text-slate-600">{produkTotal}</span> produk</p>
                <nav className="flex items-center gap-1" aria-label="Navigasi halaman produk">
                  <button
                    type="button"
                    disabled={produkPage === 1}
                    onClick={() => setProdukPage((p) => Math.max(1, p - 1))}
                    aria-label="Halaman sebelumnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {getPaginationNumbers(produkPage, totalPagesProduk).map((page, idx) =>
                    typeof page === "string" ? (
                      <span key={`dot-p-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm" aria-hidden="true">...</span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setProdukPage(page)}
                        aria-label={`Halaman ${page}`}
                        aria-current={page === produkPage ? "page" : undefined}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === produkPage
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={produkPage === totalPagesProduk}
                    onClick={() => setProdukPage((p) => Math.min(p + 1, totalPagesProduk))}
                    aria-label="Halaman berikutnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
            {!loading && totalPagesProduk <= 1 && filteredProduk.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-400">Total <span className="font-semibold text-slate-600">{produkTotal}</span> produk</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "kategori" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Daftar Kategori</h2>
              <p className="text-slate-500 text-sm mt-1">Kelola semua kategori produk</p>
            </div>
            <button
              onClick={openAddKategori}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Kategori
            </button>
          </div>

          <div className="relative">
            <label htmlFor="search_kategori" className="sr-only">Cari kategori</label>
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search_kategori"
              value={searchKategori}
              onChange={(e) => setSearchKategori(e.target.value)}
              placeholder="Cari kategori..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
                      <th className="py-4 px-4 font-semibold">Nama Kategori</th>
                      <th className="py-4 px-4 font-semibold">Slug</th>
                      <th className="py-4 px-4 font-semibold">Produk</th>
                      <th className="py-4 px-4 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pagedKategori.map((k, i) => (
                      <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-slate-500 text-sm">{(catPage - 1) * catPageSize + i + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 text-sm">{k.nama_kategori}</p>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-slate-100 px-2.5 py-1 rounded text-slate-600">{k.slug}</code>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{k._count?.produk ?? 0} produk</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditKategori(k)}
                              aria-label={`Edit kategori ${k.nama_kategori}`}
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteKategori(k)}
                              disabled={isPending}
                              aria-label={`Hapus kategori ${k.nama_kategori}`}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredKategori.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            <p className="text-sm font-medium">{searchKategori ? "Kategori tidak ditemukan" : "Belum ada kategori"}</p>
                            <p className="text-xs text-slate-300">{searchKategori ? "Coba kata kunci lain" : 'Klik "Tambah Kategori" untuk mulai'}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && totalPagesKategori > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-slate-400">Total <span className="font-semibold text-slate-600">{filteredKategori.length}</span> kategori</p>
                <nav className="flex items-center gap-1" aria-label="Navigasi halaman kategori">
                  <button
                    type="button"
                    disabled={catPage === 1}
                    onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                    aria-label="Halaman sebelumnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {getPaginationNumbers(catPage, totalPagesKategori).map((page, idx) =>
                    typeof page === "string" ? (
                      <span key={`dot-k-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm" aria-hidden="true">...</span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCatPage(page)}
                        aria-label={`Halaman ${page}`}
                        aria-current={page === catPage ? "page" : undefined}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === catPage
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={catPage === totalPagesKategori}
                    onClick={() => setCatPage((p) => Math.min(p + 1, totalPagesKategori))}
                    aria-label="Halaman berikutnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
            {!loading && totalPagesKategori <= 1 && filteredKategori.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-400">Total <span className="font-semibold text-slate-600">{filteredKategori.length}</span> kategori</p>
              </div>
            )}
          </div>
        </>
      )}

      {showAddProduk && (
        <Modal onClose={() => setShowAddProduk(false)}>
          <ModalHeader title="Tambah Produk" color="bg-indigo-100 text-indigo-600" iconPath={iconCube} onClose={() => setShowAddProduk(false)} />
          <form onSubmit={handleAddProduk} className="p-6 space-y-4">
            {formMsg && <Alert msg={formMsg} />}
            <ProdukFormFields kategoriList={kategoriList} />
            <FormFooter onCancel={() => setShowAddProduk(false)} submitLabel="Simpan Produk" />
          </form>
        </Modal>
      )}

      {showEditProduk && selectedProduk && (
        <Modal onClose={() => setShowEditProduk(false)}>
          <ModalHeader title="Edit Produk" color="bg-amber-100 text-amber-600" iconPath={iconEdit} onClose={() => setShowEditProduk(false)} />
          <form key={selectedProduk.id} onSubmit={handleEditProduk} className="p-6 space-y-4">
            <input type="hidden" name="id" value={selectedProduk.id} />
            {formMsg && <Alert msg={formMsg} />}
            <ProdukFormFields kategoriList={kategoriList} defaultValues={selectedProduk} />
            <FormFooter onCancel={() => setShowEditProduk(false)} submitLabel="Simpan Perubahan" />
          </form>
        </Modal>
      )}

      {showDeleteProduk && deleteProdukTarget && (
        <Modal onClose={() => { setShowDeleteProduk(false); setDeleteProdukTarget(null); }}>
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto" aria-hidden="true">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Produk</h3>
              <p className="text-slate-500 text-sm mt-2">
                Yakin ingin menghapus produk <span className="font-semibold text-slate-700">&quot;{deleteProdukTarget.nama_produk}&quot;</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteProduk(false); setDeleteProdukTarget(null); }}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteProduk}
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAddKategori && (
        <Modal onClose={() => setShowAddKategori(false)}>
          <ModalHeader title="Tambah Kategori" color="bg-indigo-100 text-indigo-600" iconPath={iconCube} onClose={() => setShowAddKategori(false)} />
          <form onSubmit={handleAddKategori} className="p-6 space-y-4">
            {formMsg && <Alert msg={formMsg} />}
            <KategoriFormFields />
            <FormFooter onCancel={() => setShowAddKategori(false)} submitLabel="Simpan Kategori" />
          </form>
        </Modal>
      )}

      {showEditKategori && selectedKategori && (
        <Modal onClose={() => setShowEditKategori(false)}>
          <ModalHeader title="Edit Kategori" color="bg-amber-100 text-amber-600" iconPath={iconEdit} onClose={() => setShowEditKategori(false)} />
          <form key={selectedKategori.id} onSubmit={handleEditKategori} className="p-6 space-y-4">
            <input type="hidden" name="id" value={selectedKategori.id} />
            {formMsg && <Alert msg={formMsg} />}
            <KategoriFormFields defaultValues={selectedKategori} />
            <FormFooter onCancel={() => setShowEditKategori(false)} submitLabel="Simpan Perubahan" />
          </form>
        </Modal>
      )}

      {showDeleteKategori && deleteKategoriTarget && (
        <Modal onClose={() => { setShowDeleteKategori(false); setDeleteKategoriTarget(null); }}>
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto" aria-hidden="true">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Kategori</h3>
              <p className="text-slate-500 text-sm mt-2">
                Yakin ingin menghapus kategori <span className="font-semibold text-slate-700">&quot;{deleteKategoriTarget.nama_kategori}&quot;</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteKategori(false); setDeleteKategoriTarget(null); }}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteKategori}
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}