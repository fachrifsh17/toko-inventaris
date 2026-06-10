"use client";

import { useState, useEffect, useTransition } from "react";
import PortalModal from "@/components/PortalModal";
import { toast } from "react-hot-toast";
import { getRekapData, updateRekap, getRekapDetail } from "@/actions/rekapsaldo";
import { getRekapPdfData } from "@/actions/rekapsaldopdf";
import { getSaldoActive } from "@/actions/saldo";
import { pdf } from "@react-pdf/renderer";
import RekapPdfDocument from "@/components/pdf/RekapSaldoPdfDocument";

const enumToStatus = (v: any) => {
  if (v === "LUNAS" || v === "Lunas") return "Lunas";
  if (v === "BELUM_LUNAS" || v === "Belum Lunas" || v === "Belum_Lunas") return "Belum Lunas";
  return String(v);
};

type TransaksiItem = {
  id: number;
  jenis: string;
  provider_bank: string;
  nomor_target: string;
  nominal: number;
  biaya_lain_lain: number;
  status: string;
  tanggal: string | Date;
  nama_pelanggan: string | null;
  keterangan: string | null;
  total_biaya_admin: number;
  total_semua: number;
  created_at?: string | Date;
  users?: { id: number; nama_lengkap: string } | null;
  biaya_admin?: { id: number; nominal_biaya: number } | null;
  saldo?: { id: number; nama_akun: string } | null;
};

type SaldoItem = {
  id: number;
  nama_akun: string;
  total_saldo: number;
};

type Msg = { type: "success" | "error"; text: string };

export default function RekapPage() {
  const [data, setData] = useState<TransaksiItem[]>([]);
  const [saldoList, setSaldoList] = useState<SaldoItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterJenis, setFilterJenis] = useState<string>("");
  const [filterProvider, setFilterProvider] = useState<string>("");
  const [filterSaldoId, setFilterSaldoId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<TransaksiItem | null>(null);
  const [detailData, setDetailData] = useState<TransaksiItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formMsg, setFormMsg] = useState<Msg | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const idr = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const loadRekap = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getRekapData(
        filterJenis || undefined,
        filterProvider || undefined,
        filterSaldoId ? Number(filterSaldoId) : undefined,
        startDate || undefined,
        endDate || undefined,
        filterStatus || undefined,
        page,
        10
      );

      if (res && res.error) {
        setError(res.error);
        setData([]);
        setTotal(0);
      } else if (res && Array.isArray(res.data)) {
        const mappedData = res.data.map((item: any) => ({
          id: item.id,
          jenis: item.jenis || "",
          provider_bank: item.provider_bank || "",
          nomor_target: item.nomor_target || "",
          nominal: Number(item.nominal) || 0,
          biaya_lain_lain: Number(item.biaya_lain_lain) || 0,
          status: enumToStatus(item.status),
          tanggal: item.tanggal,
          nama_pelanggan: item.nama_pelanggan,
          keterangan: item.keterangan,
          total_biaya_admin: Number(item.total_biaya_admin) || 0,
          total_semua: Number(item.total_semua) || 0,
          created_at: item.created_at,
          users: item.users,
          biaya_admin: item.biaya_admin,
          saldo: item.saldo,
        }));
        setData(mappedData);
        setTotal(Number(res.total) || 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data");
      setData([]);
      setTotal(0);
    }

    setLoading(false);
  };

  const loadSaldo = async () => {
    try {
      const res = await getSaldoActive();
      if (res.success && res.data) {
        setSaldoList(res.data as SaldoItem[]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRekap();
  }, [page, filterJenis, filterProvider, filterSaldoId, filterStatus, startDate, endDate]);

  useEffect(() => {
    loadSaldo();
  }, []);

  useEffect(() => {
    if (!showEdit && !showDetail) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showEdit, showDetail]);

  const displayData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.keterangan && item.keterangan.toLowerCase().includes(q)) ||
      (item.users?.nama_lengkap && item.users.nama_lengkap.toLowerCase().includes(q)) ||
      (item.provider_bank && item.provider_bank.toLowerCase().includes(q)) ||
      (item.nomor_target && item.nomor_target.toLowerCase().includes(q)) ||
      (item.nama_pelanggan && item.nama_pelanggan.toLowerCase().includes(q)) ||
      (item.jenis && item.jenis.toLowerCase().includes(q)) ||
      (item.saldo?.nama_akun && item.saldo.nama_akun.toLowerCase().includes(q))
    );
  });

  const isFilterActive = filterJenis || filterProvider || filterSaldoId || filterStatus || startDate || endDate;

  const refreshFilters = () => {
    setFilterJenis("");
    setFilterProvider("");
    setFilterSaldoId("");
    setFilterStatus("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setPage(1);
  };

  const openDetailModal = async (id: number) => {
    setLoadingDetail(true);
    setShowDetail(true);
    setDetailData(null);

    try {
      const res = await getRekapDetail(id);
      if (res) {
        setDetailData({
          id: res.id,
          jenis: res.jenis || "",
          provider_bank: res.provider_bank || "",
          nomor_target: res.nomor_target || "",
          nominal: Number(res.nominal) || 0,
          biaya_lain_lain: Number(res.biaya_lain_lain) || 0,
          status: enumToStatus(res.status),
          tanggal: res.tanggal,
          nama_pelanggan: res.nama_pelanggan,
          keterangan: res.keterangan,
          total_biaya_admin: Number(res.total_biaya_admin) || 0,
          total_semua: Number(res.total_semua) || 0,
          created_at: res.created_at,
          users: res.users,
          biaya_admin: res.biaya_admin,
          saldo: res.saldo,
        });
      }
    } catch (err) {
      console.error(err);
    }

    setLoadingDetail(false);
  };

  const openEdit = (item: TransaksiItem) => {
    setSelected(item);
    setFormMsg(null);
    setShowEdit(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateRekap(selected.id, formData);
      if (res.success) {
        setShowEdit(false);
        setSelected(null);
        toast.success("Data rekap berhasil diperbarui", { position: "top-center" });
        await loadRekap();
      } else {
        setFormMsg({ type: "error", text: res.error || "Gagal memperbarui data" });
      }
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const selectedSaldo = filterSaldoId
        ? saldoList.find((s) => s.id === Number(filterSaldoId))
        : null;

      const res = await getRekapPdfData(
        filterJenis || undefined,
        filterProvider || undefined,
        filterSaldoId ? Number(filterSaldoId) : undefined,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        filterStatus || undefined
      );
      if (!res.success || !res.data) {
        toast.error((res as any).error || "Gagal mengambil data PDF", { position: "top-center" });
      } else {
        const blob = await pdf(
          <RekapPdfDocument
            data={res.data}
            pengaturan={res.pengaturan}
            filters={{
              jenis: filterJenis || undefined,
              provider: filterProvider || undefined,
              saldoId: filterSaldoId ? Number(filterSaldoId) : undefined,
              saldoNama: selectedSaldo?.nama_akun || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              status: filterStatus || undefined,
            }}
          />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "rekap-transaksi-digital.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("PDF berhasil diunduh", { position: "top-center" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengekspor PDF", { position: "top-center" });
    }
    setIsExporting(false);
  };

  const renderJenisBadge = (j: string) => {
    const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
      top_up: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", label: "Top Up" },
      transfer: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", label: "Transfer" },
      tarik_tunai: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", label: "Tarik Tunai" },
      ppob: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", label: "PPOB" },
    };
    const s = map[j] || { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", label: j };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text} ${s.border} border`}>
        {s.label}
      </span>
    );
  };

  const renderStatusBadge = (s: string) => {
    if (s === "Lunas")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          Lunas
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
        Belum Lunas
      </span>
    );
  };

  const totalPages = Math.ceil(total / 10);

  const getPaginationNumbers = (currentPage: number, totalPagesCount: number) => {
    const pages: (number | string)[] = [];
    if (totalPagesCount <= 5) {
      for (let i = 1; i <= totalPagesCount; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPagesCount - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPagesCount - 2) pages.push("...");
      pages.push(totalPagesCount);
    }
    return pages;
  };

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return "-";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (dateInput: string | Date) => {
    if (!dateInput) return "-";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLong = (dateInput: string | Date) => {
    if (!dateInput) return "-";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const getDateInputValue = (dateInput: string | Date) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Rekap Transaksi Digital</h1>
        <p className="text-slate-500 text-sm mt-1">
          Pantau dan kelola riwayat transaksi digital sistem.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div>
            <label htmlFor="filter-jenis" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis</label>
            <select
              id="filter-jenis"
              value={filterJenis}
              onChange={(e) => { setFilterJenis(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            >
              <option value="">Semua</option>
              <option value="top_up">Top Up</option>
              <option value="transfer">Transfer</option>
              <option value="tarik_tunai">Tarik Tunai</option>
              <option value="ppob">PPOB</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-saldo" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Akun Saldo</label>
            <select
              id="filter-saldo"
              value={filterSaldoId}
              onChange={(e) => { setFilterSaldoId(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            >
              <option value="">Semua</option>
              {saldoList.map((s) => (
                <option key={s.id} value={s.id}>{s.nama_akun}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-status" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            >
              <option value="">Semua</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-start" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dari</label>
            <input
              id="filter-start"
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>
          <div>
            <label htmlFor="filter-end" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sampai</label>
            <input
              id="filter-end"
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>
          <div>
            <label htmlFor="filter-provider" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Provider/Bank</label>
            <input
              id="filter-provider"
              type="text"
              value={filterProvider}
              onChange={(e) => { setFilterProvider(e.target.value); setPage(1); }}
              placeholder="Cari provider..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            {isFilterActive || searchQuery ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-100 text-xs font-medium text-pink-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter aktif
                </span>
                <button
                  type="button"
                  onClick={refreshFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-400">Tidak ada filter aktif</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-emerald-100"
          >
            {isExporting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Export PDF
          </button>
        </div>
      </div>

      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi, provider, petugas, nomor target, pelanggan..."
          aria-label="Cari transaksi"
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Sinkronisasi data rekap...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500 gap-2">
            <svg className="w-10 h-10 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
            <button
              type="button"
              onClick={loadRekap}
              className="mt-2 px-4 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 font-semibold">No</th>
                    <th className="py-4 px-4 font-semibold">Tanggal</th>
                    <th className="py-4 px-4 font-semibold text-center">Jenis</th>
                    <th className="py-4 px-4 font-semibold">Provider</th>
                    <th className="py-4 px-4 font-semibold">No. Target</th>
                    <th className="py-4 px-4 font-semibold">Pelanggan</th>
                    <th className="py-4 px-4 font-semibold text-right">Nominal</th>
                    <th className="py-4 px-4 font-semibold text-right">Biaya Lain</th>
                    <th className="py-4 px-4 font-semibold text-right">Total Bayar</th>
                    <th className="py-4 px-4 font-semibold text-center">Status</th>
                    <th className="py-4 px-4 font-semibold">Petugas</th>
                    <th className="py-4 px-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayData.map((item, i) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3 px-4 text-slate-500 text-sm">
                        {(page - 1) * 10 + i + 1}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm whitespace-nowrap">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderJenisBadge(item.jenis)}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                        {item.provider_bank || "-"}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-mono whitespace-nowrap">
                        {item.nomor_target || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap">
                        {item.nama_pelanggan || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm text-right font-medium">
                        {idr(item.nominal)}
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-red-500">
                        - {idr(item.biaya_lain_lain || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {idr(item.total_semua)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm font-medium">
                        {item.users?.nama_lengkap || "Sistem"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailModal(item.id)}
                            aria-label="Detail Transaksi"
                            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            aria-label="Edit Transaksi"
                            className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayData.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          <p className="text-sm font-medium">
                            {searchQuery ? "Data tidak ditemukan" : "Tidak ada riwayat transaksi"}
                          </p>
                          <p className="text-xs text-slate-300">
                            {searchQuery ? "Coba kata kunci lain" : "Belum ada data yang tersedia"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-slate-600">
                  Halaman {page} • Total {total}
                </p>
                <nav className="flex items-center gap-1" aria-label="Navigasi halaman rekap">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Halaman sebelumnya"
                    className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {getPaginationNumbers(page, totalPages).map((pg, idx) =>
                    typeof pg === "string" ? (
                      <span key={`dot-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm" aria-hidden="true">...</span>
                    ) : (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setPage(pg)}
                        aria-label={`Halaman ${pg}`}
                        aria-current={pg === page ? "page" : undefined}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          pg === page
                            ? "bg-pink-600 text-white shadow-sm"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pg}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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

            {!loading && totalPages <= 1 && total > 0 && (
              <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50">
                <p className="text-sm text-slate-600">
                  Halaman {page} • Total {total}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showDetail && (
        <PortalModal onClose={() => setShowDetail(false)}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detail Transaksi Digital</h2>
                <p className="text-xs text-slate-400">Rincian transaksi digital yang dicatat.</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetail(false)}
              aria-label="Tutup detail"
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {loadingDetail ? (
              <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Memuat rincian...
              </div>
            ) : detailData ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Jenis</span>
                    <div className="mt-1">{renderJenisBadge(detailData.jenis)}</div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                    <div className="mt-1">{renderStatusBadge(detailData.status)}</div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</span>
                    <span className="block text-sm font-medium text-slate-700 mt-1">
                      {formatDateLong(detailData.tanggal)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Akun Saldo</span>
                    <span className="block text-sm font-medium text-slate-700 mt-1">{detailData.saldo?.nama_akun ?? "-"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Petugas</span>
                    <span className="block text-sm font-medium text-slate-700 mt-1">{detailData.users?.nama_lengkap || "Sistem"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Provider / Bank</span>
                    <span className="block text-sm font-medium text-slate-700 mt-1">{detailData.provider_bank || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nomor Target</span>
                    <span className="block text-sm font-medium text-slate-700 mt-1 font-mono">{detailData.nomor_target || "-"}</span>
                  </div>
                  {detailData.nama_pelanggan && (
                    <div className="col-span-2">
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Pelanggan</span>
                      <span className="block text-sm font-medium text-slate-700 mt-1">{detailData.nama_pelanggan}</span>
                    </div>
                  )}
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Nominal:</span>
                      <span className="font-medium">{idr(detailData.nominal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Admin:</span>
                      <span className="font-medium">{idr(detailData.total_biaya_admin)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Biaya Lain-lain (Potongan):</span>
                      <span className="font-medium">- {idr(detailData.biaya_lain_lain || 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-emerald-700 border-t border-emerald-200 pt-2 mt-2">
                      <span>Total Bayar:</span>
                      <span>{idr(detailData.total_semua)}</span>
                    </div>
                  </div>
                </div>

                {detailData.keterangan && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Keterangan</span>
                    <p className="text-sm text-slate-600 italic">&ldquo;{detailData.keterangan}&rdquo;</p>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Dicatat Pada</span>
                  <p className="text-sm text-slate-600">
                    {formatDateTime(detailData.created_at as string)}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-red-500 font-medium">Gagal memuat rincian transaksi.</div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </PortalModal>
      )}

      {showEdit && selected && (
        <PortalModal onClose={() => setShowEdit(false)}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Edit Transaksi Digital</h2>
                <p className="text-xs text-slate-400">ID Transaksi: #{selected.id}</p>
              </div>
            </div>
            <button
              onClick={() => setShowEdit(false)}
              aria-label="Tutup edit"
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form key={selected.id} onSubmit={handleEditSubmit} className="p-6 space-y-4">
            {formMsg && (
              <div role="alert" className={`text-sm p-3 rounded-lg ${formMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                {formMsg.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select
                  id="edit-status"
                  name="status"
                  required
                  defaultValue={selected.status === "Lunas" ? "Lunas" : "Belum_Lunas"}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                >
                  <option value="Lunas">Lunas</option>
                  <option value="Belum_Lunas">Belum Lunas</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-tanggal" className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
                <input
                  id="edit-tanggal"
                  type="date"
                  name="tanggal"
                  required
                  defaultValue={getDateInputValue(selected.tanggal)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-pelanggan" className="block text-sm font-medium text-slate-700 mb-1.5">Nama Pelanggan</label>
              <input
                id="edit-pelanggan"
                type="text"
                name="nama_pelanggan"
                defaultValue={selected.nama_pelanggan || ""}
                placeholder="Nama pelanggan (opsional)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              />
            </div>

            <div>
              <label htmlFor="edit-keterangan" className="block text-sm font-medium text-slate-700 mb-1.5">Keterangan</label>
              <textarea
                id="edit-keterangan"
                name="keterangan"
                rows={3}
                defaultValue={selected.keterangan || ""}
                placeholder="Catatan tambahan..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </PortalModal>
      )}
    </div>
  );
}