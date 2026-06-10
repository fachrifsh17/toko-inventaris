"use client";

import { useState, useEffect, useTransition } from "react";
import PortalModal from "@/components/PortalModal";
import { toast } from "react-hot-toast";
import { getRekapData, updateRekap, getRekapDetail } from "@/actions/rekap";
import { getRekapPdfData } from "@/actions/rekappdf";
import { pdf } from "@react-pdf/renderer";
import RekapPdfDocument from "@/components/pdf/RekapPdfDocument";

type DetailTransaksiItem = {
  id: number;
  jumlah: number;
  harga_modal_real: number;
  harga_jual_real: number;
  produk?: {
    nama_produk: string;
    kategori?: {
      nama_kategori: string;
    } | null;
  } | null;
};

type TransaksiItem = {
  id: number;
  jenis_stok: string;
  metode_pembayaran: string;
  keterangan: string | null;
  tanggal: string | Date;
  total_harga_modal: number;
  total_harga_jual: number;
  total_item: number;
  biaya_lain_lain: number;
  grand_total: number;
  nama_pelanggan?: string | null;
  total_bayar?: number | null;
  kembalian?: number | null;
  users?: {
    username: string;
    nama_lengkap?: string;
  } | null;
  detail_transaksi?: DetailTransaksiItem[];
};

type Msg = { type: "success" | "error"; text: string };

const formatNumberInput = (val: string) => {
  const num = val.replace(/\D/g, "");
  return num ? parseInt(num, 10).toLocaleString("id-ID") : "";
};

const parseNumberInput = (val: string) => {
  return parseInt(val.replace(/\./g, "").replace(/\D/g, ""), 10) || 0;
};

export default function RekapPage() {
  const [data, setData] = useState<TransaksiItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<"masuk" | "keluar" | "">("");
  const [filterKategori, setFilterKategori] = useState<string>("");
  const [filterMetode, setFilterMetode] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<TransaksiItem | null>(null);
  const [detailData, setDetailData] = useState<TransaksiItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formMsg, setFormMsg] = useState<Msg | null>(null);

  const [editJenisStok, setEditJenisStok] = useState<string>("masuk");
  const [editBiayaLain, setEditBiayaLain] = useState<string>("0");
  const [editTotalBayar, setEditTotalBayar] = useState<string>("0");
  const [editMetode, setEditMetode] = useState<string>("CASH");

  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const isKeluar = editJenisStok.toLowerCase() === "keluar";

  const kembalianHitung = (() => {
    if (!selected || !isKeluar) return 0;
    const biaya = parseNumberInput(editBiayaLain);
    const bayar = parseNumberInput(editTotalBayar);
    const grand = (selected.total_harga_jual || 0) + biaya;
    return bayar - grand;
  })();

  const applyKategoriFilter = (item: TransaksiItem): TransaksiItem | null => {
    if (!filterKategori) return item;

    const filteredDetails = item.detail_transaksi?.filter(
      (d) => d.produk?.kategori?.nama_kategori === filterKategori
    ) || [];

    if (filteredDetails.length === 0) return null;

    const isKeluarItem = item.jenis_stok?.toUpperCase() === "KELUAR";

    const total_harga_modal = isKeluarItem
      ? 0
      : filteredDetails.reduce((sum, d) => sum + (d.harga_modal_real || 0) * (d.jumlah || 0), 0);

    const total_harga_jual = !isKeluarItem
      ? 0
      : filteredDetails.reduce((sum, d) => sum + (d.harga_jual_real || 0) * (d.jumlah || 0), 0);

    const total_item = filteredDetails.reduce((sum, d) => sum + (d.jumlah || 0), 0);

    const biaya_lain_lain = isKeluarItem ? (item.biaya_lain_lain || 0) : 0;

    const grand_total = isKeluarItem
      ? total_harga_jual + biaya_lain_lain
      : total_harga_modal;

    return {
      ...item,
      detail_transaksi: filteredDetails,
      total_harga_modal,
      total_harga_jual,
      total_item,
      biaya_lain_lain,
      grand_total,
    };
  };

  const loadRekap = async () => {
    setLoading(true);
    const sDate = startDate ? new Date(startDate) : undefined;
    const eDate = endDate ? new Date(endDate) : undefined;
    const typeParam = filterType || undefined;
    const katParam = filterKategori || undefined;
    const metodeParam = filterMetode || undefined;

    const res = await getRekapData(typeParam, katParam, sDate, eDate, page, limit, metodeParam);
    if (res) {
      setData(res.data as unknown as TransaksiItem[]);
      setTotal(res.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRekap();
  }, [page, filterType, filterKategori, filterMetode, startDate, endDate]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getRekapData(undefined, undefined, undefined, undefined, 1, 1000, undefined);
      if (res && res.data) {
        const extracted: string[] = [];
        (res.data as unknown as TransaksiItem[]).forEach((t) => {
          t.detail_transaksi?.forEach((d) => {
            if (d.produk?.kategori?.nama_kategori) {
              extracted.push(d.produk.kategori.nama_kategori);
            }
          });
        });
        setCategories(Array.from(new Set(extracted)));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!showEdit && !showDetail) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showEdit, showDetail]);

  const displayData = data
    .map((item) => applyKategoriFilter(item))
    .filter((item): item is TransaksiItem => item !== null)
    .filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchTransaksi =
        item.keterangan?.toLowerCase().includes(q) ||
        item.nama_pelanggan?.toLowerCase().includes(q) ||
        item.users?.nama_lengkap?.toLowerCase().includes(q) ||
        item.users?.username?.toLowerCase().includes(q) ||
        item.metode_pembayaran?.toLowerCase().includes(q) ||
        item.jenis_stok?.toLowerCase().includes(q);

      const matchDetail = item.detail_transaksi?.some(
        (d) =>
          d.produk?.nama_produk?.toLowerCase().includes(q) ||
          d.produk?.kategori?.nama_kategori?.toLowerCase().includes(q)
      );

      return matchTransaksi || matchDetail;
    });

  const isFilterActive = filterType || filterKategori || filterMetode || startDate || endDate;

  const refreshFilters = () => {
    setFilterType("");
    setFilterKategori("");
    setFilterMetode("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setPage(1);
  };

  const openDetailModal = async (id: number) => {
    setLoadingDetail(true);
    setShowDetail(true);
    const res = await getRekapDetail(id);
    if (res) {
      const raw = res as unknown as TransaksiItem;
      const filtered = applyKategoriFilter(raw);
      setDetailData(filtered || raw);
    }
    setLoadingDetail(false);
  };

  const openEdit = (item: TransaksiItem) => {
    setSelected(item);
    setFormMsg(null);
    const jenis = item.jenis_stok?.toLowerCase() || "masuk";
    setEditJenisStok(jenis);
    setEditBiayaLain(String(item.biaya_lain_lain || 0));
    setEditTotalBayar(String(item.total_bayar || 0));
    setEditMetode(item.metode_pembayaran || "CASH");
    setShowEdit(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;

    const formData = new FormData(e.currentTarget);
    formData.set("biaya_lain_lain", String(isKeluar ? parseNumberInput(editBiayaLain) : 0));
    formData.set("total_bayar", String(isKeluar ? parseNumberInput(editTotalBayar) : 0));
    formData.set("kembalian", String(isKeluar ? kembalianHitung : 0));

    startTransition(async () => {
      const res = await updateRekap(selected.id, formData);
      if (res.success) {
        setShowEdit(false);
        setSelected(null);
        toast.success("Data rekap transaksi berhasil diperbarui", { position: "top-center" });
        await loadRekap();
      } else {
        setFormMsg({ type: "error", text: res.error || "Gagal memperbarui data" });
      }
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const sDate = startDate ? new Date(startDate) : undefined;
    const eDate = endDate ? new Date(endDate) : undefined;
    const typeParam = filterType || undefined;
    const katParam = filterKategori || undefined;
    const metodeParam = filterMetode || undefined;

    try {
      const res = await getRekapPdfData(typeParam, katParam, sDate, eDate, metodeParam);
      if (!res.success || !res.data) {
        toast.error((res as any).error || "Gagal mengambil data PDF", { position: "top-center" });
      } else {
        const filteredPdfData = res.data
          .map((item: any) => {
            if (!filterKategori) return item;
            const filteredDetails = item.detail_transaksi?.filter(
              (d: any) => d.produk?.kategori?.nama_kategori === filterKategori
            ) || [];
            if (filteredDetails.length === 0) return null;
            const isKeluarItem = item.jenis_stok === "KELUAR";
            const total_harga_modal = isKeluarItem
              ? 0
              : filteredDetails.reduce((sum: number, d: any) => sum + (d.harga_modal_real || 0) * (d.jumlah || 0), 0);
            const total_harga_jual = !isKeluarItem
              ? 0
              : filteredDetails.reduce((sum: number, d: any) => sum + (d.harga_jual_real || 0) * (d.jumlah || 0), 0);
            const total_item = filteredDetails.reduce((sum: number, d: any) => sum + (d.jumlah || 0), 0);
            const biaya_lain_lain = isKeluarItem ? (item.biaya_lain_lain || 0) : 0;
            const grand_total = isKeluarItem
              ? total_harga_jual + biaya_lain_lain
              : total_harga_modal;
            return { ...item, detail_transaksi: filteredDetails, total_harga_modal, total_harga_jual, total_item, biaya_lain_lain, grand_total };
          })
          .filter((item: any) => item !== null);

        const blob = await pdf(
          <RekapPdfDocument
            data={filteredPdfData}
            pengaturan={res.pengaturan}
            filters={{
              type: typeParam,
              kategori: katParam,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              metode: metodeParam,
            }}
          />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "rekap-transaksi.pdf";
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

  const formatRupiah = (num: number) => {
    if (num === 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalPages = Math.ceil(total / limit);

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

  const renderKembalianOrSisa = (metode: string | undefined, kembalianVal: number) => {
    const isCreditMethod = (metode || "").toUpperCase() === "CREDIT";
    const hasSisaKredit = isCreditMethod && kembalianVal < 0;
    const hasKembalian = kembalianVal > 0;

    if (hasSisaKredit) {
      return (
        <div className="flex justify-between w-full sm:w-64">
          <span className="text-rose-600 font-bold">Sisa Kredit:</span>
          <span className="text-lg font-black text-rose-600">{formatRupiah(Math.abs(kembalianVal))}</span>
        </div>
      );
    }
    if (hasKembalian) {
      return (
        <div className="flex justify-between w-full sm:w-64">
          <span className="text-slate-700 font-bold">Kembalian:</span>
          <span className="text-lg font-black text-pink-600">{formatRupiah(kembalianVal)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Rekap Mutasi Stok</h1>
        <p className="text-slate-500 text-sm mt-1">
          Pantau dan kelola riwayat keluar masuk barang logistik sistem berdasarkan transaksi.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label htmlFor="filter-jenis-stok" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis Stok</label>
            <select
              id="filter-jenis-stok"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value as any); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            >
              <option value="">Semua Jenis</option>
              <option value="masuk">Masuk</option>
              <option value="keluar">Keluar</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-kategori" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
            <select
              id="filter-kategori"
              value={filterKategori}
              onChange={(e) => { setFilterKategori(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-metode" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Metode</label>
            <select
              id="filter-metode"
              value={filterMetode}
              onChange={(e) => { setFilterMetode(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            >
              <option value="">Semua Metode</option>
              <option value="CASH">CASH</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="CREDIT">CREDIT</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-start-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Mulai</label>
            <input
              id="filter-start-date"
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>
          <div>
            <label htmlFor="filter-end-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Selesai</label>
            <input
              id="filter-end-date"
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
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
          placeholder="Cari transaksi, pelanggan, keterangan, petugas..."
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
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 font-semibold">No</th>
                    <th className="py-4 px-4 font-semibold">Tanggal</th>
                    <th className="py-4 px-4 font-semibold text-center">Tipe</th>
                    <th className="py-4 px-4 font-semibold">Pelanggan</th>
                    <th className="py-4 px-4 font-semibold text-center">Metode</th>
                    <th className="py-4 px-4 font-semibold text-center">Total Item</th>
                    <th className="py-4 px-4 font-semibold text-right">Total Modal</th>
                    <th className="py-4 px-4 font-semibold text-right">Total Jual</th>
                    <th className="py-4 px-4 font-semibold text-right">Biaya Lain</th>
                    <th className="py-4 px-4 font-semibold text-right">Grand Total</th>
                    <th className="py-4 px-4 font-semibold text-right">Total Bayar</th>
                    <th className="py-4 px-4 font-semibold">Keterangan</th>
                    <th className="py-4 px-4 font-semibold">Petugas</th>
                    <th className="py-4 px-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayData.map((item, i) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-4 text-slate-500 text-sm">
                        {(page - 1) * limit + i + 1}
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          item.jenis_stok?.toLowerCase() === "masuk"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {item.jenis_stok}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-sm max-w-[140px] truncate">
                        {item.nama_pelanggan || "-"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          item.metode_pembayaran === "CASH"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.metode_pembayaran === "TRANSFER"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}>
                          {item.metode_pembayaran}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-800 text-sm font-bold text-center">
                        {item.total_item}
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-sm text-right font-medium">
                        {formatRupiah(item.total_harga_modal)}
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-sm text-right font-medium">
                        {formatRupiah(item.total_harga_jual)}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-medium whitespace-nowrap">
                        {item.biaya_lain_lain > 0 ? (
                          <span className="text-orange-600 font-semibold">{formatRupiah(item.biaya_lain_lain)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-bold whitespace-nowrap">
                        {item.grand_total > 0 ? (
                          <span className="text-black">{formatRupiah(item.grand_total)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-medium whitespace-nowrap">
                        {item.total_bayar != null && item.total_bayar > 0 ? (
                          <span className="text-emerald-600 font-semibold">{formatRupiah(item.total_bayar)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-sm max-w-xs truncate">
                        {item.keterangan || "-"}
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-sm font-medium">
                        {item.users?.nama_lengkap || item.users?.username || "Sistem"}
                      </td>
                      <td className="py-4 px-4">
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
                      <td colSpan={14} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          <p className="text-sm font-medium">
                            {searchQuery ? "Data tidak ditemukan" : "Tidak ada riwayat transaksi ditemukan"}
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
                <h2 className="text-lg font-bold text-slate-800">Detail Transaksi</h2>
                <p className="text-xs text-slate-400">Rincian item masuk/keluar dari mutasi stok.</p>
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
                Memuat rincian item...
              </div>
            ) : detailData ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipe</span>
                    <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                      detailData.jenis_stok?.toLowerCase() === "masuk" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>{detailData.jenis_stok}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Metode</span>
                    <div className="mt-1">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        detailData.metode_pembayaran === "CASH"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : detailData.metode_pembayaran === "TRANSFER"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {detailData.metode_pembayaran}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</span>
                    <span className="block text-sm font-medium text-slate-700 mt-1">
                      {new Date(detailData.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Petugas</span>
                    <span className="block text-sm font-medium text-slate-700 mt-1">{detailData.users?.nama_lengkap || detailData.users?.username || "Sistem"}</span>
                  </div>
                </div>

                {detailData.nama_pelanggan && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nama Pelanggan</span>
                    <p className="text-sm font-medium text-slate-800">{detailData.nama_pelanggan}</p>
                  </div>
                )}

                <div className="border border-slate-100 rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                          <th className="py-2.5 px-3">Nama Produk</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3 text-center">Jumlah</th>
                          <th className="py-2.5 px-3 text-right">
                            {detailData.jenis_stok.toLowerCase() === "masuk" ? "Harga Modal" : "Harga Jual"}
                          </th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {detailData.detail_transaksi?.map((item) => {
                          const subtotal = detailData.jenis_stok.toLowerCase() === "masuk"
                            ? (item.harga_modal_real || 0) * item.jumlah
                            : (item.harga_jual_real || 0) * item.jumlah;

                          return (
                            <tr key={item.id} className="text-slate-700">
                              <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">{item.produk?.nama_produk}</td>
                              <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.produk?.kategori?.nama_kategori || "-"}</td>
                              <td className="py-2.5 px-3 text-center font-semibold">{item.jumlah}</td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatRupiah(detailData.jenis_stok.toLowerCase() === "masuk" ? item.harga_modal_real : item.harga_jual_real)}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap">{formatRupiah(subtotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 border-t border-slate-100 pt-4 text-sm">
                  {detailData.jenis_stok.toLowerCase() === "masuk" && (
                    <div className="flex justify-between w-full sm:w-64">
                      <span className="text-slate-500 font-medium">Total Akumulasi Modal:</span>
                      <span className="font-bold text-slate-800">{formatRupiah(detailData.total_harga_modal)}</span>
                    </div>
                  )}
                  {detailData.jenis_stok.toLowerCase() === "keluar" && (
                    <div className="flex justify-between w-full sm:w-64 border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Subtotal Barang:</span>
                      <span className="font-bold text-slate-800">{formatRupiah(detailData.total_harga_jual)}</span>
                    </div>
                  )}
                  {detailData.jenis_stok.toLowerCase() === "keluar" && detailData.biaya_lain_lain > 0 && (
                    <div className="flex justify-between w-full sm:w-64 border-b border-slate-100 pb-2">
                      <span className="text-orange-600 font-medium">Biaya Lain-lain:</span>
                      <span className="font-bold text-orange-600">{formatRupiah(detailData.biaya_lain_lain)}</span>
                    </div>
                  )}
                  {detailData.jenis_stok.toLowerCase() === "keluar" && (
                    <div className="flex justify-between w-full sm:w-64 pt-1">
                      <span className="text-slate-700 font-bold">Grand Total:</span>
                      <span className="text-lg font-black text-black">{formatRupiah(detailData.grand_total)}</span>
                    </div>
                  )}
                  {detailData.total_bayar != null && detailData.total_bayar > 0 && (
                    <div className="flex justify-between w-full sm:w-64 pt-1 border-t border-slate-100">
                      <span className="text-emerald-600 font-medium">Total Dibayar:</span>
                      <span className="font-bold text-emerald-600">{formatRupiah(detailData.total_bayar)}</span>
                    </div>
                  )}
                  {detailData.kembalian != null && detailData.kembalian !== 0 && (
                    renderKembalianOrSisa(detailData.metode_pembayaran, detailData.kembalian)
                  )}
                  {detailData.jenis_stok.toLowerCase() === "masuk" && (!detailData.total_bayar || detailData.total_bayar <= 0) && (detailData.kembalian == null || detailData.kembalian === 0) && (
                    <div className="flex justify-between w-full sm:w-64 pt-1">
                      <span className="text-slate-700 font-bold">Total Nilai Aliran:</span>
                      <span className="text-lg font-black text-emerald-600">
                        {formatRupiah(detailData.total_harga_modal)}
                      </span>
                    </div>
                  )}
                </div>

                {detailData.keterangan && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Catatan Keterangan</span>
                    <p className="text-sm text-slate-600 italic">&ldquo;{detailData.keterangan}&rdquo;</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-red-500 font-medium">Gagal memuat rincian item transaksi.</div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 14h2.5v4H6v-4z M11 10h2.5v8H11v-8z M16 6h2.5v12H16V6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Edit Transaksi Mutasi</h2>
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
                <label htmlFor="edit-jenis-stok" className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Aliran Stok</label>
                <select
                  id="edit-jenis-stok"
                  name="jenis_stok"
                  required
                  value={editJenisStok}
                  onChange={(e) => setEditJenisStok(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                >
                  <option value="masuk">Masuk</option>
                  <option value="keluar">Keluar</option>
                </select>
              </div>
              {isKeluar && (
                <div>
                  <label htmlFor="edit-metode-pembayaran" className="block text-sm font-medium text-slate-700 mb-1.5">Metode Pembayaran</label>
                  <select
                    id="edit-metode-pembayaran"
                    name="metode_pembayaran"
                    required
                    value={editMetode}
                    onChange={(e) => setEditMetode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                  >
                    <option value="CASH">CASH</option>
                    <option value="TRANSFER">TRANSFER</option>
                    <option value="CREDIT">CREDIT</option>
                  </select>
                </div>
              )}
            </div>

            {isKeluar && (
              <div>
                <label htmlFor="edit-nama-pelanggan" className="block text-sm font-medium text-slate-700 mb-1.5">Nama Pelanggan</label>
                <input
                  id="edit-nama-pelanggan"
                  type="text"
                  name="nama_pelanggan"
                  defaultValue={selected.nama_pelanggan || ""}
                  placeholder="Umum / walk-in"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                />
              </div>
            )}

            <div className={isKeluar ? "grid grid-cols-3 gap-4" : ""}>
              <div>
                <label htmlFor="edit-tanggal" className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Perubahan</label>
                <input
                  id="edit-tanggal"
                  type="date"
                  name="tanggal"
                  required
                  defaultValue={new Date(selected.tanggal).toISOString().split("T")[0]}
                  className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${!isKeluar ? "max-w-xs" : ""}`}
                />
              </div>
              {isKeluar && (
                <>
                  <div>
                    <label htmlFor="edit-biaya-lain-lain" className="block text-sm font-medium text-slate-700 mb-1.5">Biaya Lain-lain</label>
                    <input
                      id="edit-biaya-lain-lain"
                      type="text"
                      inputMode="numeric"
                      value={editBiayaLain}
                      onChange={(e) => setEditBiayaLain(formatNumberInput(e.target.value))}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-total-bayar" className="block text-sm font-medium text-slate-700 mb-1.5">Total Bayar</label>
                    <input
                      id="edit-total-bayar"
                      type="text"
                      inputMode="numeric"
                      value={editTotalBayar}
                      onChange={(e) => setEditTotalBayar(formatNumberInput(e.target.value))}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                    />
                  </div>
                </>
              )}
            </div>

            {isKeluar && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {kembalianHitung < 0 ? "Sisa Kredit" : kembalianHitung === 0 ? "Kembalian" : "Kembalian"} (otomatis)
                </label>
                <div className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold text-right ${
                  kembalianHitung < 0
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}>
                  {kembalianHitung < 0 ? "- " : ""}{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.abs(kembalianHitung))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="edit-keterangan" className="block text-sm font-medium text-slate-700 mb-1.5">Keterangan / Alasan</label>
              <textarea
                id="edit-keterangan"
                name="keterangan"
                rows={3}
                defaultValue={selected.keterangan || ""}
                placeholder="Tambahkan catatan penyesuaian operasional transaksi..."
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