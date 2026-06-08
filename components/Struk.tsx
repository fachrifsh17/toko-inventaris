interface StrukData {
  id: number;
  tanggal: string;
  metode_pembayaran?: string;
  keterangan?: string;
  nama_pelanggan?: string | null;
  total_bayar: number;
  kembalian: number;
  biaya_lain_lain?: number;
  users?: {
    nama_lengkap?: string;
  };
  detail_transaksi?: Array<{
    id: number;
    jumlah: number;
    harga_jual_real: number;
    produk?: {
      nama_produk?: string;
    };
  }>;
}

interface PengaturanData {
  nama_toko?: string;
  alamat?: string;
  no_wa_toko?: string;
  email?: string;
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export function StrukPreview({ data, settings }: { data: StrukData; settings: PengaturanData | null }) {
  const tItem = data.detail_transaksi?.reduce((s: number, d: any) => s + d.jumlah, 0) ?? 0;
  const tHarga = data.detail_transaksi?.reduce((s: number, d: any) => s + (d.jumlah * d.harga_jual_real), 0) ?? 0;
  const biayaLain = data.biaya_lain_lain ?? 0;
  const grandTotal = tHarga + biayaLain;
  const hasContact = settings?.no_wa_toko || settings?.email;
  const isKurangBayar = data.kembalian < 0;
  const sisaKurang = Math.abs(data.kembalian);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mx-auto font-mono text-[7.5pt] w-[190px] py-[8px] px-[6px] leading-[1.25] text-black">
      <div className="text-center border-b border-dashed border-black pb-[5px] mb-[6px]">
        <div className="text-[9pt] font-bold tracking-[1px] uppercase">
          {settings?.nama_toko || "Struk Penjualan"}
        </div>
        {settings?.alamat && <div className="text-[6.5pt] text-[#555] mt-[1px]">{settings.alamat}</div>}
        {hasContact && (
          <div className="flex justify-between text-[6.5pt] text-[#555] mt-[1px]">
            <span>{settings?.no_wa_toko ? `No: ${settings.no_wa_toko}` : ""}</span>
            <span>{settings?.email || ""}</span>
          </div>
        )}
        <div className="text-[6.5pt] text-[#666] mt-[1px]">Struk Transaksi</div>
      </div>
      <div className="mb-[5px]">
        {[
          ["No. Transaksi", `#${data.id}`],
          ["Tanggal", new Date(data.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
          ["Waktu", new Date(data.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })],
          ["Pelanggan", data.nama_pelanggan || "Umum"],
          ["Metode", (data.metode_pembayaran || "-").toUpperCase()],
          ["Kasir", data.users?.nama_lengkap || "Sistem"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between mb-[1px] text-[7pt]">
            <span className="text-[#555]">{l}</span>
            <span className="font-bold">{v}</span>
          </div>
        ))}
      </div>
      <hr className="border-none border-t border-dashed border-black my-[4px]" />
      <div>
        {data.detail_transaksi?.map((dt: any, i: number) => (
          <div key={i} className="mb-[4px]">
            <div className="text-[7pt] font-bold break-all">{dt.produk?.nama_produk ?? "-"}</div>
            <div className="text-[6.5pt] text-[#333] flex justify-between">
              <span>{dt.jumlah} x {idr(dt.harga_jual_real)}</span>
            </div>
            <div className="text-[7pt] font-bold text-right">{idr(dt.jumlah * dt.harga_jual_real)}</div>
          </div>
        ))}
      </div>
      <hr className="border-none border-t border-dashed border-black my-[4px]" />
      <div>
        <div className="flex justify-between mb-[1px] text-[7.5pt]">
          <span>Subtotal</span><span>{idr(tHarga)}</span>
        </div>
        {biayaLain > 0 && (
          <div className="flex justify-between mb-[1px] text-[7.5pt]">
            <span>Biaya Lain-lain</span><span>{idr(biayaLain)}</span>
          </div>
        )}
        <div className="flex justify-between mb-[1px] text-[7.5pt]">
          <span>Total Item</span><span>{tItem} Pcs</span>
        </div>
        <hr className="border-none border-t border-dashed border-black my-[3px]" />
        <div className="flex justify-between text-[10pt] font-bold mb-[1px]">
          <span>TOTAL</span><span>{idr(grandTotal)}</span>
        </div>
        <div className="flex justify-between text-[7.5pt]">
          <span>Bayar</span><span>{idr(data.total_bayar)}</span>
        </div>
        {isKurangBayar ? (
          <div className="flex justify-between text-[7.5pt] text-rose-600 font-bold">
            <span>Sisa Kredit</span><span>{idr(sisaKurang)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-[7.5pt]">
            <span>Kembali</span><span>{idr(data.kembalian)}</span>
          </div>
        )}
      </div>
      {data.keterangan && (
        <div className="mt-[5px] text-[6pt] text-[#666] italic border-t border-dashed border-[#ccc] pt-[3px] break-all">
          Catatan: {data.keterangan}
        </div>
      )}
      <div className="mt-[6px] text-center border-t border-dashed border-[#ccc] pt-[3px] text-[6pt] text-[#888]">
        <p>Terima kasih atas kunjungan Anda</p>
        <p>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
    </div>
  );
}

export function handleCetakStruk(data: StrukData, pengaturan: PengaturanData | null) {
  const totalItem = data.detail_transaksi?.reduce((sum: number, d: any) => sum + d.jumlah, 0) ?? 0;
  const totalHarga = data.detail_transaksi?.reduce((sum: number, d: any) => sum + (d.jumlah * d.harga_jual_real), 0) ?? 0;
  const biayaLain = data.biaya_lain_lain ?? 0;
  const grandTotal = totalHarga + biayaLain;
  const hasContact = pengaturan?.no_wa_toko || pengaturan?.email;
  const isKurangBayar = data.kembalian < 0;
  const sisaKurang = Math.abs(data.kembalian);

  const kembalianRow = isKurangBayar
    ? `<div class="tr" style="color:#dc2626;font-weight:700"><span>Sisa Kredit</span><span>${idr(sisaKurang)}</span></div>`
    : `<div class="tr"><span>Kembali</span><span>${idr(data.kembalian)}</span></div>`;

  const biayaLainRow = biayaLain > 0
    ? `<div class="tr"><span>Biaya Lain-lain</span><span>${idr(biayaLain)}</span></div>`
    : "";

  const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Struk</title>
<style>
@page { size: 58mm auto; margin: 0mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 58mm; max-width: 58mm; margin: 0 auto; padding: 2mm 3mm; font-family: 'Courier New', Courier, monospace; font-size: 8.5pt; line-height: 1.3; color: #000; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.hd { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 6px; }
.hd h1 { font-size: 10pt; letter-spacing: 1.5px; text-transform: uppercase; }
.hd p { font-size: 7pt; color: #555; margin-top: 1px; }
.ci { display: flex; justify-content: space-between; font-size: 7pt; color: #555; margin-top: 1px; }
.ir { display: flex; justify-content: space-between; font-size: 8pt; margin-bottom: 1px; }
.il { color: #555; }
.iv { font-weight: 700; }
.dv { border: none; border-top: 1px dashed #000; margin: 5px 0; }
.it { margin-bottom: 4px; }
.in { font-size: 8pt; font-weight: 700; word-break: break-all; }
.idt { font-size: 7.5pt; color: #333; display: flex; justify-content: space-between; }
.is { font-size: 8pt; font-weight: 700; text-align: right; }
.ts { border-top: 1px dashed #000; padding-top: 5px; margin-top: 3px; }
.tr { display: flex; justify-content: space-between; font-size: 8.5pt; margin-bottom: 1px; }
.gt { font-size: 11pt; font-weight: 700; }
.ct { margin-top: 6px; font-size: 7pt; color: #555; font-style: italic; border-top: 1px dashed #ccc; padding-top: 3px; word-break: break-all; }
.ft { margin-top: 8px; text-align: center; border-top: 1px dashed #ccc; padding-top: 4px; font-size: 6.5pt; color: #888; }
</style></head><body>
<div class="hd"><h1>${pengaturan?.nama_toko || "Struk Penjualan"}</h1>${pengaturan?.alamat ? `<p>${pengaturan.alamat}</p>` : ""}${hasContact ? `<div class="ci"><span>${pengaturan?.no_wa_toko ? `Tlp:${pengaturan.no_wa_toko}` : ""} ${pengaturan?.email || ""}</span></div>` : ""}<p>Struk Transaksi</p></div>
<div>
<div class="ir"><span class="il">No. Transaksi</span><span class="iv">#${data.id}</span></div>
<div class="ir"><span class="il">Tanggal</span><span class="iv">${new Date(data.tanggal).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</span></div>
<div class="ir"><span class="il">Waktu</span><span class="iv">${new Date(data.tanggal).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</span></div>
<div class="ir"><span class="il">Pelanggan</span><span class="iv">${data.nama_pelanggan || "Umum"}</span></div>
<div class="ir"><span class="il">Metode</span><span class="iv">${(data.metode_pembayaran||"-").toUpperCase()}</span></div>
<div class="ir"><span class="il">Kasir</span><span class="iv">${data.users?.nama_lengkap||"Sistem"}</span></div>
</div>
<hr class="dv">
<div>${data.detail_transaksi?.map((dt:any)=>`<div class="it"><div class="in">${dt.produk?.nama_produk??"-"}</div><div class="idt"><span>${dt.jumlah} x ${idr(dt.harga_jual_real)}</span></div><div class="is">${idr(dt.jumlah*dt.harga_jual_real)}</div></div>`).join("")}</div>
<div class="ts">
<div class="tr"><span>Subtotal</span><span>${idr(totalHarga)}</span></div>
 ${biayaLainRow}
<div class="tr"><span>Total Item</span><span>${totalItem} Pcs</span></div>
<hr class="dv">
<div class="tr gt"><span>TOTAL</span><span>${idr(grandTotal)}</span></div>
<div class="tr"><span>Bayar</span><span>${idr(data.total_bayar)}</span></div>
 ${kembalianRow}
</div>
 ${data.keterangan?`<div class="ct">Catatan: ${data.keterangan}</div>`:""}
<div class="ft"><p>Terima kasih atas pembelian Anda</p><p>${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p></div>
</body></html>`;

  const oldIframe = document.getElementById("print-iframe") as HTMLIFrameElement | null;
  if (oldIframe) oldIframe.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => { iframe.remove(); }, 1000);
      }, 300);
    };
  }
}