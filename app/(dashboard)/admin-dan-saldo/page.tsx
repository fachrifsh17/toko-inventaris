"use client";

import { useState, useEffect, useTransition } from "react";
import PortalModal from "@/components/PortalModal";
import { toast } from "react-hot-toast";
import {
  getSaldo,
  addSaldoAction,
  editSaldoAction,
  deleteSaldoAction,
} from "@/actions/saldo";
import {
  getBiayaAdmin,
  addBiayaAdminAction,
  editBiayaAdminAction,
  deleteBiayaAdminAction,
} from "@/actions/byadmin";

type Saldo = {
  id: number;
  nama_akun: string;
  total_saldo: number;
  is_active: boolean | null;
  updated_at: Date;
  _count?: {
    saldo_masuk: number;
    transaksi_digital: number;
  };
};

type BiayaAdmin = {
  id: number;
  nominal_biaya: number;
  is_active: boolean | null;
  created_at: Date;
  _count?: {
    transaksi_digital: number;
  };
};

type Msg = { type: "success" | "error"; text: string };
type Tab = "saldo" | "biaya_admin";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const inputCls =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white";

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
        <div
          className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}
          aria-hidden="true"
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
              d={iconPath}
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <button
        onClick={onClose}
        aria-label="Tutup modal"
        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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

function SaldoFormFields({
  defaultValues,
}: {
  defaultValues?: Saldo | null;
}) {
  const [saldoStr, setSaldoStr] = useState<string>(
    defaultValues?.total_saldo ? String(defaultValues.total_saldo) : "0"
  );

  const format = (v: string | number) => {
    const n = Number(String(v).replace(/[^0-9-]/g, "")) || 0;
    return n.toLocaleString("id-ID");
  };
  const parse = (s: string) =>
    Number(String(s).replace(/[^0-9-]/g, "")) || 0;

  return (
    <>
      <Field label="Nama Akun Saldo">
        <input
          name="nama_akun"
          required
          defaultValue={defaultValues?.nama_akun}
          placeholder="contoh: Saldo Dana, Saldo OVO, Rekening BCA"
          className={inputCls}
        />
      </Field>

      <Field label="Total Saldo (Rp)">
        <div>
          <label htmlFor="total_saldo_display" className="sr-only">
            Total Saldo
          </label>
          <input
            id="total_saldo_display"
            type="text"
            value={format(saldoStr)}
            onChange={(e) => setSaldoStr(String(parse(e.target.value)))}
            placeholder="0"
            className={inputCls}
          />
          <input
            type="hidden"
            name="total_saldo"
            value={parse(saldoStr)}
          />
        </div>
      </Field>

      <Field label="Status">
        <label htmlFor="is_active_saldo" className="sr-only">
          Status Aktif
        </label>
        <select
          id="is_active_saldo"
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

function BiayaAdminFormFields({
  defaultValues,
}: {
  defaultValues?: BiayaAdmin | null;
}) {
  const [nominalStr, setNominalStr] = useState<string>(
    defaultValues?.nominal_biaya
      ? String(defaultValues.nominal_biaya)
      : "0"
  );

  const format = (v: string | number) => {
    const n = Number(String(v).replace(/[^0-9-]/g, "")) || 0;
    return n.toLocaleString("id-ID");
  };
  const parse = (s: string) =>
    Number(String(s).replace(/[^0-9-]/g, "")) || 0;

  return (
    <>
      <Field label="Nominal Biaya Admin (Rp)">
        <div>
          <label htmlFor="nominal_biaya_display" className="sr-only">
            Nominal Biaya Admin
          </label>
          <input
            id="nominal_biaya_display"
            type="text"
            value={format(nominalStr)}
            onChange={(e) => setNominalStr(String(parse(e.target.value)))}
            placeholder="0"
            className={inputCls}
          />
          <input
            type="hidden"
            name="nominal_biaya"
            value={parse(nominalStr)}
          />
        </div>
      </Field>

      <Field label="Status">
        <label htmlFor="is_active_biaya" className="sr-only">
          Status Aktif
        </label>
        <select
          id="is_active_biaya"
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

// Icon paths - sama dengan icon di tab
const iconSaldo = "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z";
const iconBiayaAdmin = "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z";
const iconEdit = "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z";

export default function SaldoBiayaAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("saldo");

  const [saldoList, setSaldoList] = useState<Saldo[]>([]);
  const [saldoPage, setSaldoPage] = useState<number>(1);
  const [saldoPageSize] = useState<number>(10);
  const [saldoTotal, setSaldoTotal] = useState<number>(0);
  const [searchSaldo, setSearchSaldo] = useState("");

  const [biayaAdminList, setBiayaAdminList] = useState<BiayaAdmin[]>([]);
  const [biayaAdminPage, setBiayaAdminPage] = useState<number>(1);
  const [biayaAdminPageSize] = useState<number>(10);
  const [biayaAdminTotal, setBiayaAdminTotal] = useState<number>(0);
  const [searchBiayaAdmin, setSearchBiayaAdmin] = useState("");

  const [loading, setLoading] = useState(true);
  const [formMsg, setFormMsg] = useState<Msg | null>(null);

  const [showAddSaldo, setShowAddSaldo] = useState(false);
  const [showEditSaldo, setShowEditSaldo] = useState(false);
  const [selectedSaldo, setSelectedSaldo] = useState<Saldo | null>(null);
  const [showDeleteSaldo, setShowDeleteSaldo] = useState(false);
  const [deleteSaldoTarget, setDeleteSaldoTarget] = useState<Saldo | null>(
    null
  );

  const [showAddBiayaAdmin, setShowAddBiayaAdmin] = useState(false);
  const [showEditBiayaAdmin, setShowEditBiayaAdmin] = useState(false);
  const [selectedBiayaAdmin, setSelectedBiayaAdmin] =
    useState<BiayaAdmin | null>(null);
  const [showDeleteBiayaAdmin, setShowDeleteBiayaAdmin] = useState(false);
  const [deleteBiayaAdminTarget, setDeleteBiayaAdminTarget] =
    useState<BiayaAdmin | null>(null);

  const [isPending, startTransition] = useTransition();

  const loadSaldo = async () => {
    setLoading(true);
    try {
      const res = await getSaldo({
        page: saldoPage,
        pageSize: saldoPageSize,
      });
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          setSaldoList(res.data as Saldo[]);
          setSaldoTotal((res.data as Saldo[]).length);
        } else {
          setSaldoList((res.data as any).rows as Saldo[]);
          setSaldoTotal((res.data as any).total ?? 0);
        }
      } else {
        setSaldoList([]);
        setSaldoTotal(0);
      }
    } catch (err) {
      console.error("Error loading saldo:", err);
      setSaldoList([]);
      setSaldoTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadBiayaAdmin = async () => {
    setLoading(true);
    try {
      const res = await getBiayaAdmin({
        page: biayaAdminPage,
        pageSize: biayaAdminPageSize,
      });
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          setBiayaAdminList(res.data as BiayaAdmin[]);
          setBiayaAdminTotal((res.data as BiayaAdmin[]).length);
        } else {
          setBiayaAdminList((res.data as any).rows as BiayaAdmin[]);
          setBiayaAdminTotal((res.data as any).total ?? 0);
        }
      } else {
        setBiayaAdminList([]);
        setBiayaAdminTotal(0);
      }
    } catch (err) {
      console.error("Error loading biaya admin:", err);
      setBiayaAdminList([]);
      setBiayaAdminTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "saldo") {
      loadSaldo();
    } else {
      loadBiayaAdmin();
    }
  }, [activeTab, saldoPage, biayaAdminPage]);

  const openAddSaldo = () => {
    setFormMsg(null);
    setShowAddSaldo(true);
  };
  const openEditSaldo = (s: Saldo) => {
    setSelectedSaldo(s);
    setFormMsg(null);
    setShowEditSaldo(true);
  };
  const openAddBiayaAdmin = () => {
    setFormMsg(null);
    setShowAddBiayaAdmin(true);
  };
  const openEditBiayaAdmin = (b: BiayaAdmin) => {
    setSelectedBiayaAdmin(b);
    setFormMsg(null);
    setShowEditBiayaAdmin(true);
  };

  const handleAddSaldo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addSaldoAction(null, fd);
      if (res.success) {
        setShowAddSaldo(false);
        toast.success(res.message || "Akun saldo berhasil ditambahkan!", {
          position: "top-center",
        });
        await loadSaldo();
        (e.target as HTMLFormElement).reset();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleEditSaldo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await editSaldoAction(null, fd);
      if (res.success) {
        setShowEditSaldo(false);
        setSelectedSaldo(null);
        toast.success(res.message || "Perubahan berhasil disimpan!", {
          position: "top-center",
        });
        await loadSaldo();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleDeleteSaldo = (s: Saldo) => {
    setDeleteSaldoTarget(s);
    setShowDeleteSaldo(true);
  };

  const executeDeleteSaldo = () => {
    if (!deleteSaldoTarget) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", String(deleteSaldoTarget.id));
      const res = await deleteSaldoAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Akun saldo berhasil dihapus!", {
          position: "top-center",
        });
        setShowDeleteSaldo(false);
        setDeleteSaldoTarget(null);
        await loadSaldo();
      } else {
        toast.error(res.error || "Gagal menghapus akun saldo.", {
          position: "top-center",
        });
        setShowDeleteSaldo(false);
        setDeleteSaldoTarget(null);
      }
    });
  };

  const handleAddBiayaAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addBiayaAdminAction(null, fd);
      if (res.success) {
        setShowAddBiayaAdmin(false);
        toast.success(res.message || "Biaya admin berhasil ditambahkan!", {
          position: "top-center",
        });
        await loadBiayaAdmin();
        (e.target as HTMLFormElement).reset();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleEditBiayaAdmin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await editBiayaAdminAction(null, fd);
      if (res.success) {
        setShowEditBiayaAdmin(false);
        setSelectedBiayaAdmin(null);
        toast.success(res.message || "Perubahan berhasil disimpan!", {
          position: "top-center",
        });
        await loadBiayaAdmin();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const handleDeleteBiayaAdmin = (b: BiayaAdmin) => {
    setDeleteBiayaAdminTarget(b);
    setShowDeleteBiayaAdmin(true);
  };

  const executeDeleteBiayaAdmin = () => {
    if (!deleteBiayaAdminTarget) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", String(deleteBiayaAdminTarget.id));
      const res = await deleteBiayaAdminAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Biaya admin berhasil dihapus!", {
          position: "top-center",
        });
        setShowDeleteBiayaAdmin(false);
        setDeleteBiayaAdminTarget(null);
        await loadBiayaAdmin();
      } else {
        toast.error(res.error || "Gagal menghapus biaya admin.", {
          position: "top-center",
        });
        setShowDeleteBiayaAdmin(false);
        setDeleteBiayaAdminTarget(null);
      }
    });
  };

  const filteredSaldo = saldoList.filter((s) =>
    s.nama_akun.toLowerCase().includes(searchSaldo.toLowerCase())
  );

  const filteredBiayaAdmin = biayaAdminList.filter(() => true);

  const totalPagesSaldo = Math.ceil(saldoTotal / saldoPageSize);
  const totalPagesBiayaAdmin = Math.ceil(biayaAdminTotal / biayaAdminPageSize);

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
      className={`text-sm p-3 rounded-lg ${
        msg.type === "error"
          ? "bg-red-50 text-red-600"
          : "bg-emerald-50 text-emerald-600"
      }`}
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
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        )}
        {submitLabel}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Manajemen Saldo & Biaya Admin
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola akun saldo dan biaya admin untuk transaksi digital.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1 flex gap-1 inline-flex">
        <button
          onClick={() => setActiveTab("saldo")}
          aria-label="Tab Saldo"
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "saldo"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <svg
            className="w-4 h-4 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={iconSaldo}
            />
          </svg>
          Saldo
        </button>
        <button
          onClick={() => setActiveTab("biaya_admin")}
          aria-label="Tab Biaya Admin"
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "biaya_admin"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <svg
            className="w-4 h-4 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={iconBiayaAdmin}
            />
          </svg>
          Biaya Admin
        </button>
      </div>

      {activeTab === "saldo" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Daftar Akun Saldo
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Kelola semua akun saldo untuk transaksi digital
              </p>
            </div>
            <button
              onClick={openAddSaldo}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Saldo
            </button>
          </div>

          <div className="relative">
            <label htmlFor="search_saldo" className="sr-only">
              Cari akun saldo
            </label>
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="search_saldo"
              value={searchSaldo}
              onChange={(e) => setSearchSaldo(e.target.value)}
              placeholder="Cari akun saldo..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                Memuat data...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="py-4 px-4 font-semibold">No</th>
                      <th className="py-4 px-4 font-semibold">Nama Akun</th>
                      <th className="py-4 px-4 font-semibold">Total Saldo</th>
                      <th className="py-4 px-4 font-semibold">Transaksi</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 font-semibold text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredSaldo.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-4 px-4 text-slate-500 text-sm align-middle">
                          {s.id}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={iconSaldo}
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">
                                {s.nama_akun}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(s.updated_at).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 text-sm">
                            {idr(s.total_saldo)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                              {s._count?.transaksi_digital ?? 0} transaksi
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit">
                              {s._count?.saldo_masuk ?? 0} saldo masuk
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              s.is_active
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {s.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditSaldo(s)}
                              aria-label={`Edit saldo ${s.nama_akun}`}
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={iconEdit}
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSaldo(s)}
                              disabled={isPending}
                              aria-label={`Hapus saldo ${s.nama_akun}`}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
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
                    {filteredSaldo.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <svg
                              className="w-10 h-10 text-slate-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d={iconSaldo}
                              />
                            </svg>
                            <p className="text-sm font-medium">
                              {searchSaldo
                                ? "Akun saldo tidak ditemukan"
                                : "Belum ada akun saldo"}
                            </p>
                            <p className="text-xs text-slate-300">
                              {searchSaldo
                                ? "Coba kata kunci lain"
                                : 'Klik "Tambah Saldo" untuk mulai'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && totalPagesSaldo > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-slate-400">
                  Total{" "}
                  <span className="font-semibold text-slate-600">
                    {saldoTotal}
                  </span>{" "}
                  akun saldo
                </p>
                <nav
                  className="flex items-center gap-1"
                  aria-label="Navigasi halaman saldo"
                >
                  <button
                    type="button"
                    disabled={saldoPage === 1}
                    onClick={() =>
                      setSaldoPage((p) => Math.max(1, p - 1))
                    }
                    aria-label="Halaman sebelumnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {getPaginationNumbers(saldoPage, totalPagesSaldo).map(
                    (page, idx) =>
                      typeof page === "string" ? (
                        <span
                          key={`dot-s-${idx}`}
                          className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
                          aria-hidden="true"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setSaldoPage(page)}
                          aria-label={`Halaman ${page}`}
                          aria-current={
                            page === saldoPage ? "page" : undefined
                          }
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === saldoPage
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
                    disabled={saldoPage === totalPagesSaldo}
                    onClick={() =>
                      setSaldoPage((p) =>
                        Math.min(p + 1, totalPagesSaldo)
                      )
                    }
                    aria-label="Halaman berikutnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
            {!loading &&
              totalPagesSaldo <= 1 &&
              filteredSaldo.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-xs text-slate-400">
                    Total{" "}
                    <span className="font-semibold text-slate-600">
                      {saldoTotal}
                    </span>{" "}
                    akun saldo
                  </p>
                </div>
              )}
          </div>
        </>
      )}

      {activeTab === "biaya_admin" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Daftar Biaya Admin
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Kelola biaya admin untuk transaksi digital
              </p>
            </div>
            <button
              onClick={openAddBiayaAdmin}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Biaya Admin
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                Memuat data...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="py-4 px-4 font-semibold">No</th>
                      <th className="py-4 px-4 font-semibold">
                        Nominal Biaya
                      </th>
                      <th className="py-4 px-4 font-semibold">
                        Digunakan
                      </th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 font-semibold">Dibuat</th>
                      <th className="py-4 px-4 font-semibold text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBiayaAdmin.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-4 px-4 text-slate-500 text-sm align-middle">
                          {b.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={iconBiayaAdmin}
                                />
                              </svg>
                            </div>
                            <span className="font-bold text-slate-800 text-sm">
                              {idr(b.nominal_biaya)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {b._count?.transaksi_digital ?? 0} transaksi
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              b.is_active
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {b.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {new Date(b.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditBiayaAdmin(b)}
                              aria-label="Edit biaya admin"
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={iconEdit}
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteBiayaAdmin(b)}
                              disabled={isPending}
                              aria-label="Hapus biaya admin"
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
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
                    {filteredBiayaAdmin.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <svg
                              className="w-10 h-10 text-slate-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d={iconBiayaAdmin}
                              />
                            </svg>
                            <p className="text-sm font-medium">
                              Belum ada biaya admin
                            </p>
                            <p className="text-xs text-slate-300">
                              Klik &quot;Tambah Biaya Admin&quot; untuk mulai
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && totalPagesBiayaAdmin > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-slate-400">
                  Total{" "}
                  <span className="font-semibold text-slate-600">
                    {biayaAdminTotal}
                  </span>{" "}
                  biaya admin
                </p>
                <nav
                  className="flex items-center gap-1"
                  aria-label="Navigasi halaman biaya admin"
                >
                  <button
                    type="button"
                    disabled={biayaAdminPage === 1}
                    onClick={() =>
                      setBiayaAdminPage((p) => Math.max(1, p - 1))
                    }
                    aria-label="Halaman sebelumnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {getPaginationNumbers(
                    biayaAdminPage,
                    totalPagesBiayaAdmin
                  ).map((page, idx) =>
                    typeof page === "string" ? (
                      <span
                        key={`dot-b-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setBiayaAdminPage(page)}
                        aria-label={`Halaman ${page}`}
                        aria-current={
                          page === biayaAdminPage ? "page" : undefined
                        }
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === biayaAdminPage
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
                    disabled={biayaAdminPage === totalPagesBiayaAdmin}
                    onClick={() =>
                      setBiayaAdminPage((p) =>
                        Math.min(p + 1, totalPagesBiayaAdmin)
                      )
                    }
                    aria-label="Halaman berikutnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
            {!loading &&
              totalPagesBiayaAdmin <= 1 &&
              filteredBiayaAdmin.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-xs text-slate-400">
                    Total{" "}
                    <span className="font-semibold text-slate-600">
                      {biayaAdminTotal}
                    </span>{" "}
                    biaya admin
                  </p>
                </div>
              )}
          </div>
        </>
      )}

      {showAddSaldo && (
        <Modal onClose={() => setShowAddSaldo(false)}>
          <ModalHeader
            title="Tambah Akun Saldo"
            color="bg-indigo-100 text-indigo-600"
            iconPath={iconSaldo}
            onClose={() => setShowAddSaldo(false)}
          />
          <form onSubmit={handleAddSaldo} className="p-6 space-y-4">
            {formMsg && <Alert msg={formMsg} />}
            <SaldoFormFields />
            <FormFooter
              onCancel={() => setShowAddSaldo(false)}
              submitLabel="Simpan Saldo"
            />
          </form>
        </Modal>
      )}

      {showEditSaldo && selectedSaldo && (
        <Modal onClose={() => setShowEditSaldo(false)}>
          <ModalHeader
            title="Edit Akun Saldo"
            color="bg-amber-100 text-amber-600"
            iconPath={iconSaldo}
            onClose={() => setShowEditSaldo(false)}
          />
          <form key={selectedSaldo.id} onSubmit={handleEditSaldo} className="p-6 space-y-4">
            <input type="hidden" name="id" value={selectedSaldo.id} />
            {formMsg && <Alert msg={formMsg} />}
            <SaldoFormFields defaultValues={selectedSaldo} />
            <FormFooter
              onCancel={() => setShowEditSaldo(false)}
              submitLabel="Simpan Perubahan"
            />
          </form>
        </Modal>
      )}

      {showDeleteSaldo && deleteSaldoTarget && (
        <Modal
          onClose={() => {
            setShowDeleteSaldo(false);
            setDeleteSaldoTarget(null);
          }}
        >
          <div className="p-6 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto"
              aria-hidden="true"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Hapus Akun Saldo
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Yakin ingin menghapus akun saldo{" "}
                <span className="font-semibold text-slate-700">
                  &quot;{deleteSaldoTarget.nama_akun}&quot;
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteSaldo(false);
                  setDeleteSaldoTarget(null);
                }}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteSaldo}
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                )}
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAddBiayaAdmin && (
        <Modal onClose={() => setShowAddBiayaAdmin(false)}>
          <ModalHeader
            title="Tambah Biaya Admin"
            color="bg-emerald-100 text-emerald-600"
            iconPath={iconBiayaAdmin}
            onClose={() => setShowAddBiayaAdmin(false)}
          />
          <form onSubmit={handleAddBiayaAdmin} className="p-6 space-y-4">
            {formMsg && <Alert msg={formMsg} />}
            <BiayaAdminFormFields />
            <FormFooter
              onCancel={() => setShowAddBiayaAdmin(false)}
              submitLabel="Simpan Biaya Admin"
            />
          </form>
        </Modal>
      )}

      {showEditBiayaAdmin && selectedBiayaAdmin && (
        <Modal onClose={() => setShowEditBiayaAdmin(false)}>
          <ModalHeader
            title="Edit Biaya Admin"
            color="bg-amber-100 text-amber-600"
            iconPath={iconBiayaAdmin}
            onClose={() => setShowEditBiayaAdmin(false)}
          />
          <form key={selectedBiayaAdmin.id} onSubmit={handleEditBiayaAdmin} className="p-6 space-y-4">
            <input
              type="hidden"
              name="id"
              value={selectedBiayaAdmin.id}
            />
            {formMsg && <Alert msg={formMsg} />}
            <BiayaAdminFormFields defaultValues={selectedBiayaAdmin} />
            <FormFooter
              onCancel={() => setShowEditBiayaAdmin(false)}
              submitLabel="Simpan Perubahan"
            />
          </form>
        </Modal>
      )}

      {showDeleteBiayaAdmin && deleteBiayaAdminTarget && (
        <Modal
          onClose={() => {
            setShowDeleteBiayaAdmin(false);
            setDeleteBiayaAdminTarget(null);
          }}
        >
          <div className="p-6 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto"
              aria-hidden="true"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Hapus Biaya Admin
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Yakin ingin menghapus biaya admin{" "}
                <span className="font-semibold text-slate-700">
                  {idr(deleteBiayaAdminTarget.nominal_biaya)}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteBiayaAdmin(false);
                  setDeleteBiayaAdminTarget(null);
                }}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteBiayaAdmin}
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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