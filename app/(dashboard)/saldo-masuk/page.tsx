"use client";

import { useEffect, useState, useTransition } from "react";
import { getSaldoMasuk, addSaldoMasukAction, deleteSaldoMasukAction } from "@/actions/saldomasuk";
import { getSaldoActive } from "@/actions/saldo";
import PortalModal from "@/components/PortalModal";
import { toast } from "react-hot-toast";

export default function SaldoMasukPage() {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [saldoList, setSaldoList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [selectedSaldoId, setSelectedSaldoId] = useState<number>(0);
  const [nominalStr, setNominalStr] = useState<string>("0");
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split("T")[0]);
  const [keterangan, setKeterangan] = useState<string>("");

  const [activeDetail, setActiveDetail] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [tempStart, setTempStart] = useState<string>("");
  const [tempEnd, setTempEnd] = useState<string>("");
  const [filterSaldoId, setFilterSaldoId] = useState<string>("");
  const [tempFilterSaldoId, setTempFilterSaldoId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const idr = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const formatNominal = (v: string) => {
    const n = Number(String(v).replace(/[^0-9-]/g, "")) || 0;
    return n.toLocaleString("id-ID");
  };

  const parseNominal = (s: string) =>
    Number(String(s).replace(/[^0-9-]/g, "")) || 0;

  const load = async () => {
    setLoading(true);
    const [r, s] = await Promise.all([
      getSaldoMasuk({
        page,
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        saldo_id: filterSaldoId ? Number(filterSaldoId) : undefined,
      }),
      getSaldoActive(),
    ]);
    if (r.success && r.data) {
      setList(r.data.rows as any[]);
      setTotal(r.data.total ?? 0);
    }
    if (s.success && s.data) {
      setSaldoList(s.data as any[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, startDate, endDate, filterSaldoId]);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setTempFilterSaldoId(filterSaldoId);
  }, [startDate, endDate, filterSaldoId]);

  const totalNominalList = list.reduce((sum, item) => sum + item.nominal, 0);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nominal = parseNominal(nominalStr);
    if (selectedSaldoId <= 0) {
      toast.error("Pilih akun saldo terlebih dahulu.", { position: "top-center" });
      return;
    }
    if (nominal <= 0) {
      toast.error("Nominal harus lebih dari 0.", { position: "top-center" });
      return;
    }

    const fd = new FormData();
    fd.append("saldo_id", String(selectedSaldoId));
    fd.append("nominal", String(nominal));
    fd.append("tanggal", tanggal);
    if (keterangan.trim()) fd.append("keterangan", keterangan.trim());

    startTransition(async () => {
      const res = await addSaldoMasukAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Saldo masuk berhasil dicatat!", { position: "top-center" });
        setNominalStr("0");
        setKeterangan("");
        setTanggal(new Date().toISOString().split("T")[0]);
        setSelectedSaldoId(0);
        await load();
      } else {
        toast.error(res.error || "Gagal menyimpan saldo masuk.", { position: "top-center" });
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", String(deleteTarget.id));
      const res = await deleteSaldoMasukAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Saldo masuk berhasil dihapus!", { position: "top-center" });
        setDeleteTarget(null);
        await load();
      } else {
        toast.error(res.error || "Gagal menghapus saldo masuk.", { position: "top-center" });
        setDeleteTarget(null);
      }
    });
  };

  const totalPages = Math.ceil(total / pageSize);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Riwayat Saldo Masuk</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 order-2 md:order-1">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">Daftar Saldo Masuk</h2>
            <div className="mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end">
                <div>
                  <label htmlFor="filterSaldo" className="text-sm text-slate-600 block">Akun Saldo</label>
                  <select
                    id="filterSaldo"
                    value={tempFilterSaldoId}
                    onChange={(e) => setTempFilterSaldoId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Semua Saldo</option>
                    {saldoList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama_akun}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filterDari" className="text-sm text-slate-600 block">Dari</label>
                  <input
                    id="filterDari"
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="filterSampai" className="text-sm text-slate-600 block">Sampai</label>
                  <input
                    id="filterSampai"
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSaldoId(tempFilterSaldoId);
                      setStartDate(tempStart);
                      setEndDate(tempEnd);
                      setPage(1);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Terapkan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempFilterSaldoId("");
                      setFilterSaldoId("");
                      setTempStart("");
                      setTempEnd("");
                      setStartDate("");
                      setEndDate("");
                      setPage(1);
                    }}
                    className="px-3 py-1.5 border rounded-md text-sm bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400 gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Memuat data...
              </div>
            ) : (
              <div>
                {list.length > 0 && (
                  <div className="mb-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-xs font-semibold text-emerald-700">Total Nominal (halaman ini)</span>
                    <span className="text-sm font-black text-emerald-700">{idr(totalNominalList)}</span>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-left text-slate-500 border-b">
                        <th className="py-2">Tanggal</th>
                        <th className="py-2">Akun Saldo</th>
                        <th className="py-2 text-right">Nominal</th>
                        <th className="py-2">Keterangan</th>
                        <th className="py-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-slate-400">Belum ada riwayat saldo masuk.</td>
                        </tr>
                      ) : (
                        list.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-slate-50/80 transition-colors">
                            <td className="py-3">
                              {item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {item.saldo?.nama_akun ?? "-"}
                              </span>
                            </td>
                            <td className="py-3 text-right font-bold text-emerald-600">{idr(item.nominal)}</td>
                            <td className="py-3 max-w-[200px] truncate text-slate-500 text-xs">
                              {item.keterangan || "-"}
                            </td>
                            <td className="py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveDetail(item)}
                                  className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2.5 py-1 rounded-md transition font-medium border"
                                >
                                  Detail
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(item)}
                                  className="text-xs bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-2.5 py-1 rounded-md transition font-medium border"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3 rounded-b-2xl">
                    <p className="text-xs text-slate-400">
                      Halaman {page} • Total <span className="font-semibold text-slate-600">{total}</span> Data
                    </p>
                    <nav className="flex items-center gap-1" aria-label="Navigasi halaman saldo masuk">
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
                                ? "bg-indigo-600 text-white shadow-sm"
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
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 mt-3 rounded-b-2xl">
                    <p className="text-xs text-slate-400">Total <span className="font-semibold text-slate-600">{total}</span> Data</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="bg-white rounded-xl shadow p-4 sticky top-4">
            <h2 className="font-semibold mb-3">Tambah Saldo Masuk</h2>

            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Input Saldo Masuk</span>

                <div>
                  <label htmlFor="saldo_id" className="block text-xs text-slate-500 mb-1">Akun Saldo</label>
                  <select
                    id="saldo_id"
                    value={selectedSaldoId}
                    onChange={(e) => setSelectedSaldoId(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={0}>-- Pilih Akun Saldo --</option>
                    {saldoList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama_akun} (Saldo: {idr(s.total_saldo)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="nominal" className="block text-xs text-slate-500 mb-1">Nominal (Rp)</label>
                  <input
                    id="nominal"
                    type="text"
                    value={formatNominal(nominalStr)}
                    onChange={(e) => setNominalStr(String(parseNominal(e.target.value)))}
                    placeholder="0"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="tanggal_input" className="block text-xs text-slate-500 mb-1">Tanggal</label>
                  <input
                    id="tanggal_input"
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="keterangan_input" className="block text-xs text-slate-500 mb-1">Keterangan</label>
                  <textarea
                    id="keterangan_input"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Transfer dari BCA"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                  />
                </div>
              </div>

              {parseNominal(nominalStr) > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-slate-700 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium">Nominal yang akan ditambahkan:</span>
                    <span className="font-black text-emerald-700 text-sm">{idr(parseNominal(nominalStr))}</span>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isPending || selectedSaldoId <= 0 || parseNominal(nominalStr) <= 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm w-full font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPending ? "Memproses..." : "Simpan Saldo Masuk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {activeDetail && (
        <PortalModal onClose={() => setActiveDetail(null)}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detail Saldo Masuk</h2>
                <p className="text-xs text-slate-400">Rincian saldo masuk yang dicatat.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveDetail(null)}
              aria-label="Tutup detail"
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Akun Saldo</span>
                <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
                  {activeDetail.saldo?.nama_akun ?? "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</span>
                <span className="block text-sm font-medium text-slate-700 mt-1">
                  {activeDetail.tanggal ? new Date(activeDetail.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <span className="block text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Nominal Masuk</span>
              <span className="text-2xl font-black text-emerald-700">{idr(activeDetail.nominal)}</span>
            </div>

            {activeDetail.keterangan && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Keterangan</span>
                <p className="text-sm text-slate-600 italic">"{activeDetail.keterangan}"</p>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Dicatat Pada</span>
              <p className="text-sm text-slate-600">
                {activeDetail.created_at ? new Date(activeDetail.created_at).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveDetail(null)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </PortalModal>
      )}

      {deleteTarget && (
        <PortalModal onClose={() => setDeleteTarget(null)}>
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto" aria-hidden="true">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Saldo Masuk</h3>
              <p className="text-slate-500 text-sm mt-2">
                Yakin ingin menghapus saldo masuk <span className="font-semibold text-slate-700">{idr(deleteTarget.nominal)}</span> dari akun <span className="font-semibold text-slate-700">&quot;{deleteTarget.saldo?.nama_akun}&quot;</span>?
              </p>
              <p className="text-red-500 text-xs mt-2">Saldo akun akan dikurangi secara otomatis.</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
        </PortalModal>
      )}
    </div>
  );
}