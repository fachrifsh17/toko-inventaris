export default function RekapPage() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xs max-w-2xl animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Rekap Penjualan
      </h2>
      <p className="text-slate-500 mt-2 text-sm leading-relaxed">
        Halaman rekapitulasi data penjualan toko sedang dalam pengembangan. Fitur ini akan menampilkan visualisasi data dalam bentuk chart interaktif dan log laporan keuangan.
      </p>
    </div>
  );
}
