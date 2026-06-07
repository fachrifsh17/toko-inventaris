"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getRiwayatKeluar,
  addRiwayatKeluarAction,
} from "@/actions/riwayatkeluar";
import { getProduk } from "@/actions/produk";
import { getPengaturan } from "@/actions/pengaturan";
import SearchSelect from "@/components/SearchSelect";
import PortalModal from "@/components/PortalModal";
import { toast } from "react-hot-toast";
import { Printer } from "lucide-react";
import { StrukPreview, handleCetakStruk } from "@/components/Struk";

interface CartItem {
  produk_id: number;
  nama_produk: string;
  jumlah: number;
  harga_modal_real: number;
  harga_jual_real: number;
}

export default function RiwayatKeluarPage() {
  const [list, setList] = useState<any[]>([]);
  const [produkList, setProdukList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [pengaturan, setPengaturan] = useState<any>(null);

  const [isPending, startTransition] = useTransition();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [inputJumlah, setInputJumlah] = useState<number>(1);
  const [hargaJual, setHargaJual] = useState<number>(0);
  const [hargaJualStr, setHargaJualStr] = useState<string>("0");

  const [activeDetail, setActiveDetail] = useState<any | null>(null);
  const [strukPopup, setStrukPopup] = useState<any | null>(null);

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
    const [r, p, set] = await Promise.all([
      getRiwayatKeluar({
        page,
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
      getProduk(),
      getPengaturan(),
    ]);
    if (r.success && r.data) {
      setList(r.data.rows as any[]);
      setTotal(r.data.total ?? 0);
    }
    if (p.success && p.data) {
      setProdukList((p.data as any[]).filter((item) => item.is_active));
    }
    if (set.success && set.data) {
      setPengaturan(set.data);
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

  const totalItemDiForm = cart.reduce((sum, item) => sum + item.jumlah, 0);
  const totalHargaDiForm = cart.reduce((sum, item) => sum + (item.harga_jual_real * item.jumlah), 0);

  const handleAddToBag = () => {
    if (!selectedProduct) {
      toast.error("Pilih produk terlebih dahulu.", { position: "top-center" });
      return;
    }
    if (inputJumlah <= 0) {
      toast.error("Jumlah produk harus lebih dari 0.", { position: "top-center" });
      return;
    }

    const existingIndex = cart.findIndex((item) => item.produk_id === selectedProduct.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].jumlah += inputJumlah;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          produk_id: selectedProduct.id,
          nama_produk: selectedProduct.nama_produk,
          jumlah: inputJumlah,
          harga_modal_real: selectedProduct.harga_modal || 0,
          harga_jual_real: hargaJual,
        },
      ]);
    }

    setInputJumlah(1);
  };

  const handleRemoveFromBag = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Gagal: Keranjang belanja masih kosong!", { position: "top-center" });
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.append("items", JSON.stringify(cart));

    startTransition(async () => {
      const res = await addRiwayatKeluarAction(null, fd);
      if (res.success) {
        toast.success(res.message || "Transaksi berhasil disimpan!", { position: "top-center" });
        form.reset();
        setCart([]);
        setSelectedProduct(null);
        setHargaJual(0);
        setHargaJualStr("0");
        await load();
        const resData = (res as any).data;
        if (resData) {
          setStrukPopup(resData);
        } else {
          const r = await getRiwayatKeluar({ page: 1, pageSize: 1 });
          if (r.success && r.data && r.data.rows.length > 0) {
            setStrukPopup(r.data.rows[0]);
          }
        }
      } else {
        toast.error(res.error || "Gagal menyimpan transaksi.", { position: "top-center" });
      }
    });
  };

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
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(tempStart);
                      setEndDate(tempEnd);
                      setPage(1);
                    }}
                    className="ml-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
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
                    className="ml-2 px-3 py-1.5 border rounded-md text-sm bg-white text-slate-700 hover:bg-slate-50 transition-colors"
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="text-left text-slate-500 border-b">
                        <th className="py-2">Tanggal</th>
                        <th className="py-2">Produk (Items)</th>
                        <th className="py-2 text-center">Total Barang</th>
                        <th className="py-2">Total Harga</th>
                        <th className="py-2">Metode</th>
                        <th className="py-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-slate-400">Belum ada riwayat transaksi.</td>
                        </tr>
                      ) : (
                        list.map((transaksi) => {
                          const totalItem = transaksi.detail_transaksi?.reduce((sum: number, d: any) => sum + d.jumlah, 0) ?? 0;
                          const totalHarga = transaksi.detail_transaksi?.reduce((sum: number, d: any) => sum + (d.jumlah * d.harga_jual_real), 0) ?? 0;

                          return (
                            <tr key={transaksi.id} className="border-t hover:bg-slate-50/80 transition-colors">
                              <td className="py-3">
                                {transaksi.tanggal ? new Date(transaksi.tanggal).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "-"}
                              </td>
                              <td className="py-3 max-w-[220px] truncate">
                                {transaksi.detail_transaksi && transaksi.detail_transaksi.length > 0 ? (
                                  <span className="font-medium text-slate-800">
                                    {transaksi.detail_transaksi[0].produk?.nama_produk}
                                    {transaksi.detail_transaksi.length > 1 && ` (+${transaksi.detail_transaksi.length - 1} barang lainnya)`}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="py-3 text-center font-semibold text-slate-700">{totalItem} Pcs</td>
                              <td className="py-3 font-semibold text-emerald-600">{idr(totalHarga)}</td>
                              <td className="py-3">{renderMethodBadge(transaksi.metode_pembayaran)}</td>
                              <td className="py-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCetakStruk(transaksi, pengaturan)}
                                    aria-label={`Cetak struk ${transaksi.id}`}
                                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-md transition font-medium border border-emerald-100 flex items-center gap-1.5"
                                  >
                                    <Printer size={12} />
                                    Struk
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveDetail(transaksi)}
                                    className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2.5 py-1.5 rounded-md transition font-medium border"
                                  >
                                    Detail
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3 rounded-b-2xl">
                    <p className="text-xs text-slate-400">
                      Halaman {page} • Total <span className="font-semibold text-slate-600">{total}</span> Transaksi
                    </p>
                    <nav className="flex items-center gap-1" aria-label="Navigasi halaman riwayat">
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
                    <p className="text-xs text-slate-400">Total <span className="font-semibold text-slate-600">{total}</span> Transaksi</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="bg-white rounded-xl shadow p-4 sticky top-4">
            <h2 className="font-semibold mb-3">Tambah Riwayat Keluar</h2>

            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Pilih Item Barang</span>
              <div>
                <label htmlFor="produk_id_select" className="block text-xs text-slate-500 mb-1">Produk</label>
                <div id="produk_id_select">
                  <SearchSelect
                    products={produkList}
                    name="temp_produk_id"
                    placeholder="Cari nama barang..."
                    onSelect={(p) => {
                      setSelectedProduct(p);
                      if (p) {
                        setHargaJual(p.harga_jual || 0);
                        setHargaJualStr(String(p.harga_jual || 0));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="inputJumlah" className="block text-xs text-slate-500 mb-1">Jumlah</label>
                  <input
                    id="inputJumlah"
                    type="number"
                    min={1}
                    value={inputJumlah}
                    onChange={(e) => setInputJumlah(Math.max(1, Number(e.target.value)))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="inputHargaJual" className="block text-xs text-slate-500 mb-1">Harga Satuan</label>
                  <input
                    id="inputHargaJual"
                    type="text"
                    value={Number(hargaJualStr).toLocaleString("id-ID")}
                    onChange={(e) => {
                      const cleaned = String(e.target.value).replace(/[^0-9-]/g, "");
                      setHargaJualStr(cleaned);
                      setHargaJual(Number(cleaned) || 0);
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToBag}
                className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition"
              >
                + Masukkan Daftar Belanja
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              {cart.length > 0 && (
                <div className="border border-dashed border-slate-200 rounded-xl p-3 bg-white max-h-[180px] overflow-y-auto space-y-2">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">List Barang Dipilih:</span>
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border">
                      <div className="pr-2">
                        <p className="font-medium text-slate-800 line-clamp-1">{item.nama_produk}</p>
                        <p className="text-slate-500">{item.jumlah} pcs x {idr(item.harga_jual_real)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromBag(index)}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded-md font-bold text-sm"
                        aria-label={`Hapus ${item.nama_produk}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Total Item Pilihan:</span>
                    <span className="font-bold">{totalItemDiForm} Pcs</span>
                  </div>
                  <div className="flex justify-between text-sm text-rose-700 font-bold border-t pt-1.5 border-rose-100">
                    <span>Total Transaksi:</span>
                    <span>{idr(totalHargaDiForm)}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="selectMetode" className="block text-sm text-slate-600 mb-1">Metode Pembayaran</label>
                <select
                  id="selectMetode"
                  name="metode_pembayaran"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="CASH">CASH</option>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>

              <div>
                <label htmlFor="inputKeterangan" className="block text-sm text-slate-600 mb-1">Keterangan / Catatan</label>
                <textarea
                  id="inputKeterangan"
                  name="keterangan"
                  rows={2}
                  placeholder="Contoh: Pembelian Grosir Toko A"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending || cart.length === 0}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm w-full font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPending ? "Memproses Transaksi..." : `Simpan ${cart.length > 0 ? `(${cart.length})` : ""} Transaksi`}
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
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detail Transaksi</h2>
                <p className="text-xs text-slate-400">Rincian item keluar dari mutasi stok.</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipe</span>
                <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border bg-rose-50 text-rose-700 border-rose-200">Keluar</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Metode</span>
                <div className="mt-1">{renderMethodBadge(activeDetail.metode_pembayaran)}</div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</span>
                <span className="block text-sm font-medium text-slate-700 mt-1">
                  {new Date(activeDetail.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 tracking-wider">Petugas</span>
                <span className="block text-sm font-medium text-slate-700 mt-1">{activeDetail.users?.nama_lengkap || "Sistem"}</span>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                      <th className="py-2.5 px-3">Nama Produk</th>
                      <th className="py-2.5 px-3 text-center">Jumlah</th>
                      <th className="py-2.5 px-3 text-right">Harga Jual</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {activeDetail.detail_transaksi?.map((dt: any) => (
                      <tr key={dt.id} className="text-slate-700">
                        <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">{dt.produk?.nama_produk ?? "Produk Terhapus"}</td>
                        <td className="py-2.5 px-3 text-center font-semibold">{dt.jumlah}</td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">{idr(dt.harga_jual_real)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap">{idr(dt.jumlah * dt.harga_jual_real)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between w-full sm:w-64">
                <span className="text-slate-500 font-medium">Total Barang Keluar:</span>
                <span className="font-bold text-slate-800">{activeDetail.detail_transaksi?.reduce((sum: number, d: any) => sum + d.jumlah, 0) ?? 0} Pcs</span>
              </div>
              <div className="flex justify-between w-full sm:w-64 border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Total Akumulasi Harga:</span>
                <span className="font-bold text-slate-800">{idr(activeDetail.detail_transaksi?.reduce((sum: number, d: any) => sum + (d.jumlah * d.harga_jual_real), 0) ?? 0)}</span>
              </div>
              <div className="flex justify-between w-full sm:w-64 pt-1">
                <span className="text-slate-700 font-bold">Total Nilai Transaksi:</span>
                <span className="text-lg font-black text-indigo-600">
                  {idr(activeDetail.detail_transaksi?.reduce((sum: number, d: any) => sum + (d.jumlah * d.harga_jual_real), 0) ?? 0)}
                </span>
              </div>
            </div>

            {activeDetail.keterangan && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Catatan Keterangan</span>
                <p className="text-sm text-slate-600 italic">"{activeDetail.keterangan}"</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCetakStruk(activeDetail, pengaturan)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <Printer size={16} />
                Cetak Struk
              </button>
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

      {strukPopup && (
        <PortalModal onClose={() => setStrukPopup(null)}>
          <div className="w-[260px] mx-auto overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-800">Transaksi Berhasil</h2>
              </div>
              <button
                onClick={() => setStrukPopup(null)}
                aria-label="Tutup struk"
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-3 flex flex-col items-center">
              <div className="overflow-hidden w-full flex justify-center">
                <StrukPreview data={strukPopup} settings={pengaturan} />
              </div>

              <div className="flex gap-2 mt-3 w-full">
                <button
                  type="button"
                  onClick={() => handleCetakStruk(strukPopup, pengaturan)}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} />
                  Cetak
                </button>
                <button
                  type="button"
                  onClick={() => setStrukPopup(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </PortalModal>
      )}
    </div>
  );
}