import { getDashboardSummary, getProdukPalingLaris, getStokByKategori } from "@/actions/dashboard";
import { getPengaturan } from "@/actions/pengaturan";

export default async function DashboardPage() {
  const [summaryResult, produkLarisResult, stokKategoriResult, pengaturanResult] = await Promise.all([
    getDashboardSummary(),
    getProdukPalingLaris(5),
    getStokByKategori(),
    getPengaturan(),
  ]);

  const summary = summaryResult.success ? summaryResult.data : null;
  const produkLaris = (produkLarisResult.success && produkLarisResult.data) ? produkLarisResult.data : [];
  const stokKategori = (stokKategoriResult.success && stokKategoriResult.data) ? stokKategoriResult.data : [];
  const namaToko = pengaturanResult.success && pengaturanResult.data?.nama_toko
    ? pengaturanResult.data.nama_toko
    : "GlowAura";

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Hitung max stock untuk skala visual progress bar
  const maxStok = Math.max(...stokKategori.map((k) => k.totalStok), 1);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard Utama
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Ringkasan operasional dan persediaan produk {namaToko} hari ini.
        </p>
      </div>

      {/* KARTU RINGKASAN */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1 - Total Produk */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-center justify-between hover:-translate-y-1 transition-all duration-300 hover:shadow-md group">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Produk
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                {summary.kartuRingkasan.totalProduk}
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 mt-1">
                {summary.kartuRingkasan.produkAktif} Aktif
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8-4m0 0l8 4m0 0v10l-8 4m0-10L4 17m16 0l-8 4m0 0l-8-4m0 0v-10" />
              </svg>
            </div>
          </div>

          {/* Card 2 - Total Stok */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-center justify-between hover:-translate-y-1 transition-all duration-300 hover:shadow-md group">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Stok
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                {summary.kartuRingkasan.totalStok}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                Unit tersedia di gudang
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>

          {/* Card 3 - Nilai Stok */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-center justify-between hover:-translate-y-1 transition-all duration-300 hover:shadow-md group">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Nilai Aset Stok
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 block leading-tight py-1">
                {formatRupiah(summary.kartuRingkasan.nilaiStok)}
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 mt-1">
                Harga Modal Toko
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Card 4 - Total Kategori */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-center justify-between hover:-translate-y-1 transition-all duration-300 hover:shadow-md group">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Kategori
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                {summary.kartuRingkasan.totalKategori}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                Kategori produk terdaftar
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
          </div>

        </div>
      )}

      {/* AKTIVITAS HARI INI */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Stok Masuk */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Stok Masuk Hari Ini
              </h3>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Terverifikasi
              </span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 divide-x divide-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Total Unit Masuk
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 block">
                  {summary.aktivitasHariIni.stokMasuk}
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Jumlah Transaksi
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-1 block">
                  {summary.aktivitasHariIni.jumlahTransaksiMasuk}
                </span>
              </div>
            </div>
          </div>

          {/* Stok Keluar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Stok Keluar Hari Ini
              </h3>
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                Terverifikasi
              </span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 divide-x divide-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Total Unit Keluar
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 block">
                  {summary.aktivitasHariIni.stokKeluar}
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Jumlah Transaksi
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-1 block">
                  {summary.aktivitasHariIni.jumlahTransaksiKeluar}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* RIWAYAT TERBARU & PRODUK PALING LARIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Riwayat Terbaru */}
        {summary && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Riwayat Aktivitas Terbaru
              </h3>
            </div>
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 px-1">
              {summary.riwayatTerbaru.length > 0 ? (
                summary.riwayatTerbaru.map((riwayat) => (
                  <div key={riwayat.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors rounded-xl">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px] sm:max-w-sm">
                        {riwayat.produk}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Oleh: {riwayat.dicatatOleh || "Sistem"} &bull; {new Date(riwayat.tanggal).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          riwayat.jenis === "MASUK"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {riwayat.jenis}
                      </span>
                      <span className="text-xs font-extrabold text-slate-700 block">
                        {riwayat.jenis === "MASUK" ? "+" : "-"}{riwayat.jumlah} unit
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  Belum ada riwayat perputaran stok.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Produk Paling Laris */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Produk Paling Populer
            </h3>
          </div>
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 px-1">
            {produkLaris.length > 0 ? (
              produkLaris.map((produk, idx) => (
                <div key={produk.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors rounded-xl">
                  <div className="flex items-center gap-3 pr-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block truncate max-w-[150px] sm:max-w-sm">
                        {produk.nama_produk}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Kategori: {produk.kategori?.nama_kategori || "Umum"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-indigo-650 block">
                      {formatRupiah(produk.harga_jual)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      Tersedia: {produk.stok_sekarang ?? 0} unit
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                Belum ada data produk terlaris.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* STOK PER KATEGORI */}
      {stokKategori.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Rasio Ketersediaan Stok per Kategori
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {stokKategori.map((kat) => {
                // Rasio ketersediaan stok
                const rasio = Math.round((kat.totalStok / maxStok) * 100);
                return (
                  <div key={kat.kategori} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{kat.kategori}</span>
                      <span className="text-slate-400">
                        {kat.jumlahProduk} produk &bull;{" "}
                        <span className="text-indigo-600 font-bold">
                          {kat.totalStok} unit
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(rasio, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}