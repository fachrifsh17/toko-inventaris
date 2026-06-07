"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import {
  getTransaksiDigital,
  addTransaksiDigitalAction,
  editTransaksiDigitalAction,
  updateStatusTransaksiDigitalAction,
} from "@/actions/transaksidigital";
import { getSaldoActive } from "@/actions/saldo";
import { getBiayaAdminActive } from "@/actions/byadmin";
import PortalModal from "@/components/PortalModal";
import { toast } from "react-hot-toast";

const enumToStatus = (v: any) => {
  if (v === "LUNAS" || v === "Lunas") return "Lunas";
  if (v === "BELUM_LUNAS" || v === "Belum_Lunas" || v === "Belum Lunas") return "Belum Lunas";
  return String(v);
};

function useAnimatedNumber(target: number, duration: number = 400) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = target;
    if (start === end) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

const calcItemTotal = (item: any) => {
  return (item.nominal || 0) + (item.biaya_admin?.nominal_biaya || 0) - (item.biaya_lain_lain || 0);
};

export default function TransaksiDigitalPage() {
  const [list, setList] = useState<any[]>([]);
  const [saldoList, setSaldoList] = useState<any[]>([]);
  const [biayaAdminList, setBiayaAdminList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [activeDetail, setActiveDetail] = useState<any | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [saldoId, setSaldoId] = useState<number>(0);
  const [biayaAdminId, setBiayaAdminId] = useState<number>(0);
  const [jenis, setJenis] = useState<string>("top_up");
  const [providerBank, setProviderBank] = useState<string>("");
  const [nomorTarget, setNomorTarget] = useState<string>("");
  const [nominalStr, setNominalStr] = useState<string>("0");
  const [biayaLainStr, setBiayaLainStr] = useState<string>("0");
  const [namaPelanggan, setNamaPelanggan] = useState<string>("");
  const [status, setStatus] = useState<string>("Lunas");
  const [keterangan, setKeterangan] = useState<string>("");
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split("T")[0]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [tempStart, setTempStart] = useState<string>("");
  const [tempEnd, setTempEnd] = useState<string>("");
  const [filterJenis, setFilterJenis] = useState<string>("");
  const [tempFilterJenis, setTempFilterJenis] = useState<string>("");
  const [filterSaldoId, setFilterSaldoId] = useState<string>("");
  const [tempFilterSaldoId, setTempFilterSaldoId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [tempFilterStatus, setTempFilterStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [totalPulse, setTotalPulse] = useState(false);

  const idr = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const formatNum = (v: string) => {
    const n = Number(String(v).replace(/[^0-9-]/g, "")) || 0;
    return n.toLocaleString("id-ID");
  };

  const parseNum = (s: string) =>
    Number(String(s).replace(/[^0-9-]/g, "")) || 0;

  const handleNominalInput = useCallback((setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setter(raw || "0");
  }, []);

  const getSelectedBiayaAdmin = () => biayaAdminList.find((b) => b.id === biayaAdminId);
  const currentBiayaAdmin = getSelectedBiayaAdmin();
  const calcNominal = parseNum(nominalStr);
  const calcBiayaAdmin = currentBiayaAdmin?.nominal_biaya || 0;
  const calcBiayaLain = parseNum(biayaLainStr);
  const calcTotal = calcNominal + calcBiayaAdmin - calcBiayaLain;

  const animatedTotal = useAnimatedNumber(calcTotal);
  const animatedBiayaLain = useAnimatedNumber(calcBiayaLain);
  const animatedBiayaAdmin = useAnimatedNumber(calcBiayaAdmin);
  const animatedNominal = useAnimatedNumber(calcNominal);

  const detailNominal = activeDetail?.nominal || 0;
  const detailBiayaAdmin = activeDetail?.biaya_admin?.nominal_biaya || 0;
  const detailBiayaLain = activeDetail?.biaya_lain_lain || 0;
  const detailTotalCalc = detailNominal + detailBiayaAdmin - detailBiayaLain;

  const animDetailNominal = useAnimatedNumber(detailNominal);
  const animDetailBiayaAdmin = useAnimatedNumber(detailBiayaAdmin);
  const animDetailBiayaLain = useAnimatedNumber(detailBiayaLain);
  const animDetailTotal = useAnimatedNumber(detailTotalCalc);

  const deleteTotalCalc = deleteTarget ? calcItemTotal(deleteTarget) : 0;
  const animDeleteTotal = useAnimatedNumber(deleteTotalCalc);

  useEffect(() => {
    setTotalPulse(true);
    const timer = setTimeout(() => setTotalPulse(false), 500);
    return () => clearTimeout(timer);
  }, [calcTotal]);

  const load = async () => {
    setLoading(true);
    const [r, s, b] = await Promise.all([
      getTransaksiDigital({
        page,
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        jenis: filterJenis || undefined,
        saldo_id: filterSaldoId ? Number(filterSaldoId) : undefined,
        status: filterStatus || undefined,
      }),
      getSaldoActive(),
      getBiayaAdminActive(),
    ]);
    if (r.success && r.data) {
      setList((r.data.rows as any[]).map((item: any) => ({ ...item, status: enumToStatus(item.status) })));
      setTotal(r.data.total ?? 0);
    }
    if (s.success && s.data) {
      setSaldoList(s.data as any[]);
    }
    if (b.success && b.data) {
      setBiayaAdminList(b.data as any[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, startDate, endDate, filterJenis, filterSaldoId, filterStatus]);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setTempFilterJenis(filterJenis);
    setTempFilterSaldoId(filterSaldoId);
    setTempFilterStatus(filterStatus);
  }, [startDate, endDate, filterJenis, filterSaldoId, filterStatus]);

  const resetForm = () => {
    setSaldoId(0);
    setBiayaAdminId(0);
    setJenis("top_up");
    setProviderBank("");
    setNomorTarget("");
    setNominalStr("0");
    setBiayaLainStr("0");
    setNamaPelanggan("");
    setStatus("Lunas");
    setKeterangan("");
    setTanggal(new Date().toISOString().split("T")[0]);
    setFormMsg(null);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saldoId <= 0) {
      toast.error("Pilih akun saldo.", { position: "top-center" });
      return;
    }
    if (biayaAdminId <= 0) {
      toast.error("Pilih biaya admin.", { position: "top-center" });
      return;
    }
    if (!providerBank.trim()) {
      toast.error("Provider/bank wajib diisi.", { position: "top-center" });
      return;
    }
    if (!nomorTarget.trim()) {
      toast.error("Nomor target wajib diisi.", { position: "top-center" });
      return;
    }
    if (parseNum(nominalStr) <= 0) {
      toast.error("Nominal harus lebih dari 0.", { position: "top-center" });
      return;
    }

    const fd = new FormData();
    fd.append("saldo_id", String(saldoId));
    fd.append("biaya_admin_id", String(biayaAdminId));
    fd.append("jenis", jenis);
    fd.append("provider_bank", providerBank.trim());
    fd.append("nomor_target", nomorTarget.trim());
    fd.append("nominal", String(parseNum(nominalStr)));
    fd.append("biaya_lain_lain", String(parseNum(biayaLainStr)));
    fd.append("status", status === "Lunas" ? "Lunas" : "Belum_Lunas");
    fd.append("tanggal", tanggal);
    if (namaPelanggan.trim()) fd.append("nama_pelanggan", namaPelanggan.trim());
    if (keterangan.trim()) fd.append("keterangan", keterangan.trim());

    startTransition(async () => {
      const res = await addTransaksiDigitalAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Transaksi berhasil disimpan!", { position: "top-center" });
        resetForm();
        await load();
      } else {
        toast.error(res.error || "Gagal menyimpan transaksi.", { position: "top-center" });
      }
    });
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editData) return;

    const fd = new FormData();
    fd.append("id", String(editData.id));
    fd.append("saldo_id", String(saldoId));
    fd.append("biaya_admin_id", String(biayaAdminId));
    fd.append("jenis", jenis);
    fd.append("provider_bank", providerBank.trim());
    fd.append("nomor_target", nomorTarget.trim());
    fd.append("nominal", String(parseNum(nominalStr)));
    fd.append("biaya_lain_lain", String(parseNum(biayaLainStr)));
    fd.append("status", status === "Lunas" ? "Lunas" : "Belum_Lunas");
    if (namaPelanggan.trim()) fd.append("nama_pelanggan", namaPelanggan.trim());
    if (keterangan.trim()) fd.append("keterangan", keterangan.trim());

    startTransition(async () => {
      const res = await editTransaksiDigitalAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Transaksi berhasil diperbarui!", { position: "top-center" });
        setShowEdit(false);
        setEditData(null);
        resetForm();
        await load();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  const openEdit = (item: any) => {
    setEditData(item);
    setSaldoId(item.saldo_id);
    setBiayaAdminId(item.biaya_admin_id);
    setJenis(item.jenis);
    setProviderBank(item.provider_bank);
    setNomorTarget(item.nomor_target);
    setNominalStr(String(item.nominal));
    setBiayaLainStr(String(item.biaya_lain_lain || 0));
    setNamaPelanggan(item.nama_pelanggan || "");
    setStatus(enumToStatus(item.status));
    setKeterangan(item.keterangan || "");
    setFormMsg(null);
    setShowEdit(true);
  };

  const handleUpdateStatus = (item: any, newStatus: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", String(item.id));
      fd.append("status", newStatus === "Lunas" ? "Lunas" : "Belum_Lunas");
      const res = await updateStatusTransaksiDigitalAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Status berhasil diperbarui!", { position: "top-center" });
        await load();
      } else {
        toast.error(res.error || "Gagal memperbarui status.", { position: "top-center" });
      }
    });
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

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white";
  const labelCls = "block text-xs text-slate-500 mb-1";

  const renderFormFields = () => (
    <>
      <div>
        <label htmlFor="form_saldo_id" className={labelCls}>Akun Saldo</label>
        <select id="form_saldo_id" value={saldoId} onChange={(e) => setSaldoId(Number(e.target.value))} className={inputCls} aria-label="Pilih akun saldo">
          <option value={0}>-- Pilih --</option>
          {saldoList.map((s) => (
            <option key={s.id} value={s.id}>{s.nama_akun} ({idr(s.total_saldo)})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="form_jenis" className={labelCls}>Jenis Transaksi</label>
        <select id="form_jenis" value={jenis} onChange={(e) => setJenis(e.target.value)} className={inputCls} aria-label="Pilih jenis transaksi">
          <option value="top_up">Top Up</option>
          <option value="transfer">Transfer</option>
          <option value="tarik_tunai">Tarik Tunai</option>
          <option value="ppob">PPOB</option>
        </select>
      </div>

      <div>
        <label htmlFor="form_provider" className={labelCls}>Provider / Bank</label>
        <input id="form_provider" type="text" value={providerBank} onChange={(e) => setProviderBank(e.target.value)} placeholder="Dana, OVO, BCA, Telkomsel..." className={inputCls} aria-label="Masukkan provider atau bank" />
      </div>

      <div>
        <label htmlFor="form_nomor" className={labelCls}>Nomor Target</label>
        <input id="form_nomor" type="text" value={nomorTarget} onChange={(e) => setNomorTarget(e.target.value)} placeholder="08xxx atau nomor rekening" className={inputCls} aria-label="Masukkan nomor target" />
      </div>

      <div>
        <label htmlFor="form_pelanggan" className={labelCls}>Nama Pelanggan (Opsional)</label>
        <input id="form_pelanggan" type="text" value={namaPelanggan} onChange={(e) => setNamaPelanggan(e.target.value)} placeholder="Nama pelanggan" className={inputCls} aria-label="Masukkan nama pelanggan" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="form_nominal" className={labelCls}>Nominal (Rp)</label>
          <input id="form_nominal" type="text" inputMode="numeric" value={formatNum(nominalStr)} onChange={handleNominalInput(setNominalStr)} placeholder="0" className={inputCls} aria-label="Masukkan nominal" />
        </div>
        <div>
          <label htmlFor="form_biaya_admin" className={labelCls}>Biaya Admin</label>
          <select id="form_biaya_admin" value={biayaAdminId} onChange={(e) => setBiayaAdminId(Number(e.target.value))} className={inputCls} aria-label="Pilih biaya admin">
            <option value={0}>-- Pilih --</option>
            {biayaAdminList.map((b) => (
              <option key={b.id} value={b.id}>{idr(b.nominal_biaya)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="form_status" className={labelCls}>Status</label>
        <select id="form_status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} aria-label="Pilih status pembayaran">
          <option value="Lunas">Lunas</option>
          <option value="Belum Lunas">Belum Lunas</option>
        </select>
      </div>

      <div>
        <label htmlFor="form_biaya_lain" className={labelCls}>Biaya Lain-lain / Potongan (Rp)</label>
        <input id="form_biaya_lain" type="text" inputMode="numeric" value={formatNum(biayaLainStr)} onChange={handleNominalInput(setBiayaLainStr)} placeholder="0" className={inputCls} aria-label="Masukkan biaya lain-lain" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="form_tanggal" className={labelCls}>Tanggal</label>
          <input id="form_tanggal" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputCls} aria-label="Pilih tanggal" />
        </div>
        <div>
          <label htmlFor="form_keterangan" className={labelCls}>Keterangan</label>
          <textarea id="form_keterangan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows={2} placeholder="Catatan tambahan..." className={inputCls + " resize-none"} aria-label="Masukkan keterangan" />
        </div>
      </div>
    </>
  );

  const AnimatedRow = ({ label, value, isNegative = false, isTotal = false }: { label: string; value: number; isNegative?: boolean; isTotal?: boolean }) => (
    <div className={`flex justify-between items-center transition-all duration-300 ${isTotal ? "text-sm font-black text-emerald-700 border-t border-emerald-200 pt-1.5 mt-1.5" : "text-slate-600"}`}>
      <span className={isTotal ? "font-bold" : ""}>{label}</span>
      <span className={`font-medium tabular-nums transition-all duration-300 ${isTotal ? "font-black text-base" : ""} ${isNegative ? "text-red-500" : ""} ${totalPulse && isTotal ? "scale-105" : "scale-100"}`}>
        {isNegative && value > 0 ? "- " : ""}{idr(value)}
      </span>
    </div>
  );

  const DetailAnimatedRow = ({ label, value, isNegative = false, isTotal = false }: { label: string; value: number; isNegative?: boolean; isTotal?: boolean }) => (
    <div className={`flex justify-between items-center transition-all duration-300 ${isTotal ? "text-lg font-black text-emerald-700 border-t border-emerald-200 pt-2.5 mt-2.5" : "text-sm text-slate-600"}`}>
      <span className={isTotal ? "font-bold" : ""}>{label}</span>
      <span className={`font-medium tabular-nums transition-all duration-300 ${isTotal ? "font-black text-xl" : ""} ${isNegative ? "text-red-500" : ""}`}>
        {isNegative && value > 0 ? "- " : ""}{idr(value)}
      </span>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Transaksi Digital</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 order-2 md:order-1">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">Daftar Transaksi Digital</h2>
            <div className="mb-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 items-end">
                <div>
                  <label htmlFor="filter_jenis" className="text-xs text-slate-600 block">Jenis</label>
                  <select id="filter_jenis" value={tempFilterJenis} onChange={(e) => setTempFilterJenis(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" aria-label="Filter jenis transaksi">
                    <option value="">Semua</option>
                    <option value="top_up">Top Up</option>
                    <option value="transfer">Transfer</option>
                    <option value="tarik_tunai">Tarik Tunai</option>
                    <option value="ppob">PPOB</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter_saldo" className="text-xs text-slate-600 block">Saldo</label>
                  <select id="filter_saldo" value={tempFilterSaldoId} onChange={(e) => setTempFilterSaldoId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" aria-label="Filter akun saldo">
                    <option value="">Semua</option>
                    {saldoList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama_akun}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="filter_status" className="text-xs text-slate-600 block">Status</label>
                  <select id="filter_status" value={tempFilterStatus} onChange={(e) => setTempFilterStatus(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" aria-label="Filter status">
                    <option value="">Semua</option>
                    <option value="Lunas">Lunas</option>
                    <option value="Belum Lunas">Belum Lunas</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter_dari" className="text-xs text-slate-600 block">Dari</label>
                  <input id="filter_dari" type="date" value={tempStart} onChange={(e) => setTempStart(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" aria-label="Filter tanggal dari" />
                </div>
                <div>
                  <label htmlFor="filter_sampai" className="text-xs text-slate-600 block">Sampai</label>
                  <input id="filter_sampai" type="date" value={tempEnd} onChange={(e) => setTempEnd(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" aria-label="Filter tanggal sampai" />
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => { setFilterJenis(tempFilterJenis); setFilterSaldoId(tempFilterSaldoId); setFilterStatus(tempFilterStatus); setStartDate(tempStart); setEndDate(tempEnd); setPage(1); }} className="px-2 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors" aria-label="Terapkan filter">
                    Terapkan
                  </button>
                  <button type="button" onClick={() => { setTempFilterJenis(""); setFilterJenis(""); setTempFilterSaldoId(""); setFilterSaldoId(""); setTempFilterStatus(""); setFilterStatus(""); setTempStart(""); setTempEnd(""); setStartDate(""); setEndDate(""); setPage(1); }} className="px-2 py-1.5 border rounded-md text-xs bg-white text-slate-700 hover:bg-slate-50 transition-colors" aria-label="Reset filter">
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="text-left text-slate-500 border-b">
                        <th className="py-2">Tanggal</th>
                        <th className="py-2">Jenis</th>
                        <th className="py-2">Provider</th>
                        <th className="py-2">No. Target</th>
                        <th className="py-2">Biaya Lain</th>
                        <th className="py-2 text-right">Total Bayar</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-4 text-slate-400">Belum ada transaksi digital.</td>
                        </tr>
                      ) : (
                        list.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 text-xs">
                              {item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </td>
                            <td className="py-3">{renderJenisBadge(item.jenis)}</td>
                            <td className="py-3 text-xs font-medium text-slate-700">{item.provider_bank}</td>
                            <td className="py-3 text-xs text-slate-600 font-mono">{item.nomor_target}</td>
                            <td className="py-3 text-right text-xs text-red-500">- {idr(item.biaya_lain_lain || 0)}</td>
                            <td className="py-3 text-right font-bold text-emerald-700">{idr(calcItemTotal(item))}</td>
                            <td className="py-3">{renderStatusBadge(item.status)}</td>
                            <td className="py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button type="button" onClick={() => setActiveDetail(item)} className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2 py-1 rounded-md transition font-medium border" aria-label={`Detail transaksi ${item.id}`}>
                                  Detail
                                </button>
                                <button type="button" onClick={() => openEdit(item)} className="text-xs bg-slate-100 hover:bg-amber-50 hover:text-amber-600 text-slate-600 px-2 py-1 rounded-md transition font-medium border" aria-label={`Edit transaksi ${item.id}`}>
                                  Edit
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
                      Halaman {page} • Total <span className="font-semibold text-slate-600">{total}</span> Transaksi
                    </p>
                    <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
                      <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Halaman sebelumnya" className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      {getPaginationNumbers(page, totalPages).map((pg, idx) =>
                        typeof pg === "string" ? (
                          <span key={`dot-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm" aria-hidden="true">...</span>
                        ) : (
                          <button key={pg} type="button" onClick={() => setPage(pg)} aria-label={`Halaman ${pg}`} aria-current={pg === page ? "page" : undefined} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${pg === page ? "bg-indigo-600 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
                            {pg}
                          </button>
                        )
                      )}
                      <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages))} aria-label="Halaman berikutnya" className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}

                {!loading && totalPages <= 1 && total > 0 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 mt-3 rounded-b-2xl">
                    <p className="text-xs text-slate-400">Total <span className="font-semibold text-slate-600">{total}</span> Transaksi</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="bg-white rounded-xl shadow p-4 sticky top-4">
            <h2 className="font-semibold mb-3">Tambah Transaksi Digital</h2>

            <div className="space-y-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Form Transaksi</span>
              {renderFormFields()}
            </div>

            {parseNum(nominalStr) > 0 && (
              <div className={`bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1.5 mb-3 transition-all duration-300 ${totalPulse ? "border-emerald-200 bg-emerald-50/30" : ""}`}>
                <AnimatedRow label="Nominal:" value={animatedNominal} />
                <AnimatedRow label="Biaya Admin:" value={animatedBiayaAdmin} />
                <AnimatedRow label="Biaya Lain-lain:" value={animatedBiayaLain} isNegative={animatedBiayaLain > 0} />
                <AnimatedRow label="Total Bayar:" value={animatedTotal} isTotal />
              </div>
            )}

            <form onSubmit={handleAdd}>
              <button type="submit" disabled={isPending || saldoId <= 0 || biayaAdminId <= 0 || parseNum(nominalStr) <= 0} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm w-full font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Simpan transaksi digital">
                {isPending ? "Memproses..." : "Simpan Transaksi"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {activeDetail && (
        <PortalModal onClose={() => setActiveDetail(null)}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div  className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detail Transaksi Digital</h2>
                <p className="text-xs text-slate-400">Rincian transaksi digital yang dicatat.</p>
              </div>
            </div>
            <button onClick={() => setActiveDetail(null)} aria-label="Tutup detail" className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Jenis</span>
                <div className="mt-1">{renderJenisBadge(activeDetail.jenis)}</div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                <div className="mt-1 flex items-center gap-2">
                  {renderStatusBadge(activeDetail.status)}
                  {activeDetail.status === "Belum Lunas" && (
                    <button type="button" onClick={() => { handleUpdateStatus(activeDetail, "Lunas"); setActiveDetail(null); }} className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold underline" aria-label="Tandai sebagai lunas">Tandai Lunas</button>
                  )}
                  {activeDetail.status === "Lunas" && (
                    <button type="button" onClick={() => { handleUpdateStatus(activeDetail, "Belum Lunas"); setActiveDetail(null); }} className="text-xs text-red-500 hover:text-red-700 font-semibold underline" aria-label="Batalkan status lunas">Batalkan</button>
                  )}
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</span>
                <span className="block text-sm font-medium text-slate-700 mt-1">
                  {activeDetail.tanggal ? new Date(activeDetail.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Akun Saldo</span>
                <span className="block text-sm font-medium text-slate-700 mt-1">{activeDetail.saldo?.nama_akun ?? "-"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Petugas</span>
                <span className="block text-sm font-medium text-slate-700 mt-1">{activeDetail.users?.nama_lengkap || "Sistem"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Provider / Bank</span>
                <span className="block text-sm font-medium text-slate-700 mt-1">{activeDetail.provider_bank}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nomor Target</span>
                <span className="block text-sm font-medium text-slate-700 mt-1 font-mono">{activeDetail.nomor_target}</span>
              </div>
              {activeDetail.nama_pelanggan && (
                <div className="col-span-2">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Pelanggan</span>
                  <span className="block text-sm font-medium text-slate-700 mt-1">{activeDetail.nama_pelanggan}</span>
                </div>
              )}
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="space-y-2">
                <DetailAnimatedRow label="Nominal:" value={animDetailNominal} />
                <DetailAnimatedRow label="Biaya Admin:" value={animDetailBiayaAdmin} />
                <DetailAnimatedRow label="Biaya Lain-lain (Potongan):" value={animDetailBiayaLain} isNegative={animDetailBiayaLain > 0} />
                <DetailAnimatedRow label="Total Bayar:" value={animDetailTotal} isTotal />
              </div>
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
              <button type="button" onClick={() => setActiveDetail(null)} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" aria-label="Tutup detail">
                Tutup Detail
              </button>
            </div>
          </div>
        </PortalModal>
      )}

      {showEdit && editData && (
        <PortalModal onClose={() => { setShowEdit(false); setEditData(null); resetForm(); }}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="#f97316" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
               </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Edit Transaksi Digital</h2>
            </div>
            <button onClick={() => { setShowEdit(false); setEditData(null); resetForm(); }} aria-label="Tutup edit" className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form key={editData.id} onSubmit={handleEdit} className="p-6 space-y-4">
            {formMsg && (
              <div role="alert" className={`text-sm p-3 rounded-lg ${formMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                {formMsg.text}
              </div>
            )}
            <div className="space-y-2.5">
              {renderFormFields()}
            </div>

            <div className={`bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1.5 transition-all duration-300 ${totalPulse ? "border-emerald-200 bg-emerald-50/30" : ""}`}>
              <AnimatedRow label="Nominal:" value={animatedNominal} />
              <AnimatedRow label="Biaya Admin:" value={animatedBiayaAdmin} />
              <AnimatedRow label="Biaya Lain-lain:" value={animatedBiayaLain} isNegative={animatedBiayaLain > 0} />
              <AnimatedRow label="Total Bayar:" value={animatedTotal} isTotal />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => { setShowEdit(false); setEditData(null); resetForm(); }} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" aria-label="Batal edit">
                Batal
              </button>
              <button type="submit" disabled={isPending} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2" aria-label="Simpan perubahan">
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