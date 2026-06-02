"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import {
  getRiwayatKeluar,
  addRiwayatKeluarAction,
} from "@/actions/riwayatkeluar";
import { getProduk } from "@/actions/produk";
import SearchSelect from "@/components/SearchSelect";

export default function RiwayatKeluarPage() {
  const [list, setList] = useState<any[]>([]);
  const [produkList, setProdukList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: string; text: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [hargaJual, setHargaJual] = useState<number>(0);
  const [hargaJualStr, setHargaJualStr] = useState<string>("0");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [tempStart, setTempStart] = useState<string>("");
  const [tempEnd, setTempEnd] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const idr = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const load = async () => {
    setLoading(true);
    const [r, p] = await Promise.all([
      getRiwayatKeluar({
        page,
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
      getProduk(),
    ]);
    if (r.success && r.data) {
      setList(r.data.rows as any[]);
      setTotal(r.data.total ?? 0);
    }
    // Filter produk agar hanya menampilkan yang is_active == true
    if (p.success && p.data) {
      setProdukList((p.data as any[]).filter((item) => item.is_active));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, startDate, endDate]);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await addRiwayatKeluarAction(null, fd);
      if (res.success) {
        setFormMsg({ type: "success", text: res.message! });
        form.reset();
        await load();
      } else {
        setFormMsg({ type: "error", text: res.error! });
      }
    });
  };

  useEffect(() => {
    if (!formMsg) return;
    const t = setTimeout(() => setFormMsg(null), 3500);
    return () => clearTimeout(t);
  }, [formMsg]);

  const renderMethodBadge = (m?: string) => {
    const method = (m || "").toUpperCase();
    if (method === "CASH")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          CASH
        </span>
      );
    if (method === "TRANSFER")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          TRANSFER
        </span>
      );
    if (method === "CREDIT")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
          CREDIT
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        {m ?? "-"}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Riwayat Stok - Keluar</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 order-2 md:order-1">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">Daftar Riwayat Keluar</h2>
            <div className="mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 items-end">
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
                  <></>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(tempStart);
                      setEndDate(tempEnd);
                      setPage(1);
                    }}
                    className="ml-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
                  >
                    Terapkan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempStart("");
                      setTempEnd("");
                      setStartDate("");
                      setEndDate("");
                      setPage(1);
                    }}
                    className="ml-2 px-3 py-1.5 border rounded-md text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="py-2">Tanggal</th>
                        <th className="py-2">Produk</th>
                        <th className="py-2">Jumlah</th>
                        <th className="py-2">Harga Jual</th>
                        <th className="py-2">Metode</th>
                        <th className="py-2">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="py-2">
                            {new Date(r.tanggal).toLocaleString()}
                          </td>
                          <td className="py-2">
                            {r.produk?.nama_produk ?? "-"}
                          </td>
                          <td className="py-2">{r.jumlah}</td>
                          <td className="py-2">
                            {r.harga_jual_real ? idr(r.harga_jual_real) : "-"}
                          </td>
                          <td className="py-2">
                            {renderMethodBadge(r.metode_pembayaran)}
                          </td>
                          <td className="py-2">{r.keterangan ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-3 mt-3">
                  <div className="text-sm text-slate-600 mr-auto">
                    Halaman {page} • Total {total}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border rounded-md text-sm"
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 border rounded-md text-sm"
                    disabled={page * pageSize >= total}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">Tambah Riwayat Keluar</h2>
            {formMsg && (
              <div
                className={`mb-3 p-2 rounded ${formMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {formMsg.text}
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label htmlFor="produk_id_select" className="block text-sm text-slate-600 mb-1">
                  Produk
                </label>
                <div id="produk_id_select">
                  <SearchSelect
                    products={produkList.map((p) => ({
                      ...p,
                      harga_jual: p.harga_jual,
                    }))}
                    name="produk_id"
                    placeholder="Cari produk (nama atau ID)"
                    onSelect={(p) => {
                      const v = p?.harga_jual ?? 0;
                      setHargaJual(v);
                      setHargaJualStr(String(v));
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inputJumlah" className="block text-sm text-slate-600 mb-1">
                  Jumlah
                </label>
                <input
                  id="inputJumlah"
                  name="jumlah"
                  required
                  type="number"
                  min={1}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                />
              </div>

              <div>
                <label htmlFor="inputHargaJual" className="block text-sm text-slate-600 mb-1">
                  Harga Jual
                </label>
                <div>
                  <input
                    id="inputHargaJual"
                    type="text"
                    value={Number(String(hargaJualStr)).toLocaleString("id-ID")}
                    onChange={(e) => {
                      const cleaned = String(e.target.value).replace(
                        /[^0-9-]/g,
                        "",
                      );
                      setHargaJualStr(cleaned);
                      setHargaJual(Number(cleaned) || 0);
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                  />
                  <input
                    type="hidden"
                    name="harga_jual_real"
                    value={hargaJual || 0}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="selectMetode" className="block text-sm text-slate-600 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  id="selectMetode"
                  name="metode_pembayaran"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                >
                  <option value="CASH">CASH</option>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>

              <div>
                <label htmlFor="inputKeterangan" className="block text-sm text-slate-600 mb-1">
                  Keterangan
                </label>
                <textarea
                  id="inputKeterangan"
                  name="keterangan"
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                />
              </div>

              <div>
                <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm w-full md:w-auto font-semibold transition-colors"
               >
                Tambah
              </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}