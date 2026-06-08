"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  shopTagline: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#4b5563",
    marginBottom: 6,
  },
  shopContact: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  reportMeta: {
    alignItems: "flex-end",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  filterInfo: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 2,
  },
  transactionBlock: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  transactionHeader: {
    backgroundColor: "#f3f4f6",
    padding: 8,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  thCol1: { width: "40%" },
  thCol2: { width: "20%" },
  thCol3: { width: "20%" },
  thCol4: { width: "20%", textAlign: "right" },
  thText: {
    fontSize: 9,
    color: "#374151",
    fontWeight: "bold",
  },
  thValue: {
    fontSize: 9,
    color: "#111827",
    marginTop: 2,
  },
  itemTable: {
    width: "100%",
  },
  itemHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  itemRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  colItemName4: { width: "35%", fontSize: 9, color: "#4b5563" },
  colItemName5: { width: "30%", fontSize: 9, color: "#4b5563" },
  colQty4: { width: "15%", fontSize: 9, color: "#4b5563", textAlign: "center" },
  colQty5: { width: "10%", fontSize: 9, color: "#4b5563", textAlign: "center" },
  colPrice4: { width: "25%", fontSize: 9, color: "#4b5563", textAlign: "right" },
  colSubtotal4: { width: "25%", fontSize: 9, color: "#4b5563", textAlign: "right" },
  colModal5: { width: "18%", fontSize: 9, color: "#4b5563", textAlign: "right" },
  colJual5: { width: "18%", fontSize: 9, color: "#4b5563", textAlign: "right" },
  colSubtotal5: { width: "24%", fontSize: 9, color: "#4b5563", textAlign: "right" },
  itemHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  transactionFooter: {
    flexDirection: "column",
    alignItems: "flex-end",
    padding: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerRow: {
    flexDirection: "row",
    width: "50%",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  footerRowLast: {
    flexDirection: "row",
    width: "50%",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  footerRowCredit: {
    flexDirection: "row",
    width: "50%",
    justifyContent: "space-between",
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#fca5a5",
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
  },
  footerLabelBiaya: {
    fontSize: 9,
    color: "#92400e",
  },
  footerValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  footerValueBiaya: {
    fontSize: 9,
    color: "#92400e",
    textAlign: "right",
  },
  footerValueGrand: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  footerValueTotal: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  footerLabelCredit: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#991b1b",
  },
  footerValueCredit: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#991b1b",
    textAlign: "right",
  },
  footerLabelBayar: {
    fontSize: 9,
    color: "#166534",
  },
  footerValueBayar: {
    fontSize: 9,
    color: "#166534",
    textAlign: "right",
  },
  footerLabelLunas: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#166534",
  },
  footerValueLunas: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#166534",
    textAlign: "right",
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    alignSelf: "flex-end",
    width: 250,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#475569",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 9,
    color: "#0f172a",
    fontWeight: "bold",
  },
  labaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  summaryCreditContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 6,
    alignSelf: "flex-end",
    width: 250,
  },
  summaryCreditTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#991b1b",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#fca5a5",
    paddingBottom: 5,
  },
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  pageFooterText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

interface RekapPdfDocumentProps {
  data: any[];
  pengaturan: any;
  filters: {
    type?: string;
    kategori?: string;
    startDate?: string;
    endDate?: string;
    metode?: string;
  };
}

const RekapPdfDocument = ({
  data,
  pengaturan,
  filters,
}: RekapPdfDocumentProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const keluarData = data.filter((t) => t.jenis_stok === "KELUAR");
  const hasKeluar = keluarData.length > 0;

  const totalModal = data.reduce(
    (sum, t) => sum + (t.total_harga_modal || 0),
    0,
  );
  const totalJual = data.reduce((sum, t) => sum + (t.total_harga_jual || 0), 0);
  const totalBiayaLain = data.reduce((sum, t) => sum + (t.biaya_lain_lain || 0), 0);
  const totalGrandKeluar = keluarData.reduce((sum, t) => sum + (t.grand_total || 0), 0);
  const totalLaba = totalJual - keluarData.reduce((sum, t) => sum + (t.total_harga_modal || 0), 0);

  const kreditList = data.filter((t) => t.isCredit && (t.sisa_kredit || 0) > 0);
  const kreditLunasList = data.filter((t) => t.isCredit && t.isLunas);
  const totalTagihanKredit = kreditList.reduce((sum, t) => sum + (t.grand_total || 0), 0);
  const totalDibayarKredit = kreditList.reduce((sum, t) => sum + (t.total_bayar || 0), 0);
  const totalSisaKredit = kreditList.reduce((sum, t) => sum + (t.sisa_kredit || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>
              {pengaturan?.nama_toko || "ROFA ID STORE"}
            </Text>
            {pengaturan?.tagline && (
              <Text style={styles.shopTagline}>{pengaturan.tagline}</Text>
            )}
            <Text style={styles.shopContact}>
              {pengaturan?.alamat || "Alamat tidak tersedia"}
            </Text>
            <Text style={styles.shopContact}>
              WhatsApp: {pengaturan?.no_wa_toko || "-"}
            </Text>
          </View>
          <View style={styles.reportMeta}>
            <Text style={styles.reportTitle}>Laporan Mutasi Stok</Text>
            <Text style={styles.filterInfo}>
              Periode: {filters.startDate ? formatDate(filters.startDate) : "Awal"} - {filters.endDate ? formatDate(filters.endDate) : "Sekarang"}
            </Text>
            {filters.type && (
              <Text style={styles.filterInfo}>
                Jenis Transaksi: {filters.type.toUpperCase()}
              </Text>
            )}
            {filters.metode && (
              <Text style={styles.filterInfo}>
                Metode: {filters.metode.toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        {data.map((transaksi, tIndex) => {
          const isMasuk = transaksi.jenis_stok === "MASUK";
          const isKeluar = transaksi.jenis_stok === "KELUAR";
          const biayaLain = transaksi.biaya_lain_lain || 0;
          const grandTotal = transaksi.grand_total || 0;
          const isCredit = transaksi.isCredit;
          const sisaKredit = transaksi.sisa_kredit || 0;
          const isLunas = transaksi.isLunas;

          return (
            <View key={transaksi.id || tIndex} style={styles.transactionBlock} wrap={false}>
              <View style={styles.transactionHeader}>
                <View style={styles.thCol1}>
                  <Text style={styles.thText}>ID Transaksi / Waktu</Text>
                  <Text style={styles.thValue}>#{transaksi.id} - {formatDateTime(transaksi.tanggal)}</Text>
                </View>
                <View style={styles.thCol2}>
                  <Text style={styles.thText}>Jenis</Text>
                  <Text style={[styles.thValue, { color: isMasuk ? "#059669" : "#dc2626" }]}>
                    {transaksi.jenis_stok}
                  </Text>
                </View>
                <View style={styles.thCol3}>
                  <Text style={styles.thText}>Metode</Text>
                  <Text style={[styles.thValue, { color: isCredit ? "#c2410c" : "#111827" }]}>
                    {transaksi.metode_pembayaran || "CASH"}
                  </Text>
                </View>
                <View style={styles.thCol4}>
                  <Text style={styles.thText}>Petugas</Text>
                  <Text style={styles.thValue}>{transaksi.users?.nama_lengkap || "Sistem"}</Text>
                </View>
              </View>

              <View style={styles.itemTable}>
                {isMasuk ? (
                  <View style={styles.itemHeaderRow}>
                    <Text style={[styles.colItemName4, styles.itemHeaderText]}>Nama Produk</Text>
                    <Text style={[styles.colQty4, styles.itemHeaderText]}>Qty</Text>
                    <Text style={[styles.colPrice4, styles.itemHeaderText]}>Harga Modal</Text>
                    <Text style={[styles.colSubtotal4, styles.itemHeaderText]}>Subtotal</Text>
                  </View>
                ) : (
                  <View style={styles.itemHeaderRow}>
                    <Text style={[styles.colItemName5, styles.itemHeaderText]}>Nama Produk</Text>
                    <Text style={[styles.colQty5, styles.itemHeaderText]}>Qty</Text>
                    <Text style={[styles.colModal5, styles.itemHeaderText]}>H. Modal</Text>
                    <Text style={[styles.colJual5, styles.itemHeaderText]}>H. Jual</Text>
                    <Text style={[styles.colSubtotal5, styles.itemHeaderText]}>Subtotal Jual</Text>
                  </View>
                )}

                {transaksi.detail_transaksi?.map((item: any, iIndex: number) => {
                  if (isMasuk) {
                    const hargaModal = item.harga_modal_real || 0;
                    const subtotal = hargaModal * (item.jumlah || 0);
                    return (
                      <View key={iIndex} style={styles.itemRow}>
                        <Text style={styles.colItemName4}>{item.produk?.nama_produk || "Produk Tidak Diketahui"}</Text>
                        <Text style={styles.colQty4}>{item.jumlah}x</Text>
                        <Text style={styles.colPrice4}>{formatCurrency(hargaModal)}</Text>
                        <Text style={styles.colSubtotal4}>{formatCurrency(subtotal)}</Text>
                      </View>
                    );
                  }

                  const hargaModal = item.harga_modal_real || 0;
                  const hargaJual = item.harga_jual_real || 0;
                  const subtotalJual = hargaJual * (item.jumlah || 0);
                  return (
                    <View key={iIndex} style={styles.itemRow}>
                      <Text style={styles.colItemName5}>{item.produk?.nama_produk || "Produk Tidak Diketahui"}</Text>
                      <Text style={styles.colQty5}>{item.jumlah}x</Text>
                      <Text style={styles.colModal5}>{formatCurrency(hargaModal)}</Text>
                      <Text style={styles.colJual5}>{formatCurrency(hargaJual)}</Text>
                      <Text style={styles.colSubtotal5}>{formatCurrency(subtotalJual)}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.transactionFooter}>
                {isKeluar && (
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Subtotal Jual:</Text>
                    <Text style={styles.footerValue}>{formatCurrency(transaksi.total_harga_jual)}</Text>
                  </View>
                )}
                {isKeluar && biayaLain > 0 && (
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabelBiaya}>Biaya Lain-lain:</Text>
                    <Text style={styles.footerValueBiaya}>{formatCurrency(biayaLain)}</Text>
                  </View>
                )}
                {isKeluar ? (
                  <View style={styles.footerRowLast}>
                    <Text style={styles.footerLabel}>Grand Total:</Text>
                    <Text style={styles.footerValueGrand}>{formatCurrency(grandTotal)}</Text>
                  </View>
                ) : (
                  <View style={styles.footerRowLast}>
                    <Text style={styles.footerLabel}>Total Modal:</Text>
                    <Text style={styles.footerValueTotal}>{formatCurrency(transaksi.total_harga_modal)}</Text>
                  </View>
                )}
                {isCredit && (
                  <View style={styles.footerRowCredit}>
                    <Text style={styles.footerLabelBayar}>Dibayar:</Text>
                    <Text style={styles.footerValueBayar}>{formatCurrency(transaksi.total_bayar || 0)}</Text>
                  </View>
                )}
                {isCredit && sisaKredit > 0 && (
                  <View style={styles.footerRowCredit}>
                    <Text style={styles.footerLabelCredit}>Sisa Kredit:</Text>
                    <Text style={styles.footerValueCredit}>{formatCurrency(sisaKredit)}</Text>
                  </View>
                )}
                {isLunas && (
                  <View style={styles.footerRowCredit}>
                    <Text style={styles.footerLabelLunas}>Status:</Text>
                    <Text style={styles.footerValueLunas}>LUNAS</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.summaryContainer} wrap={false}>
          <Text style={styles.summaryTitle}>Ringkasan Keseluruhan</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Modal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalModal)}</Text>
          </View>
          {hasKeluar && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Jual:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalJual)}</Text>
            </View>
          )}
          {hasKeluar && totalBiayaLain > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: "#92400e" }]}>Total Biaya Lain-lain:</Text>
              <Text style={[styles.summaryValue, { color: "#92400e" }]}>{formatCurrency(totalBiayaLain)}</Text>
            </View>
          )}
          {hasKeluar && totalBiayaLain > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Grand Total Keluar:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalGrandKeluar)}</Text>
            </View>
          )}
          {hasKeluar && (
            <View style={styles.labaRow}>
              <Text style={[styles.summaryLabel, { color: totalLaba >= 0 ? "#166534" : "#991b1b" }]}>
                {totalLaba >= 0 ? "Laba Kotor:" : "Rugi Kotor:"}
              </Text>
              <Text style={[styles.summaryValue, { color: totalLaba >= 0 ? "#166534" : "#991b1b" }]}>
                {formatCurrency(Math.abs(totalLaba))}
              </Text>
            </View>
          )}
        </View>

        {kreditList.length > 0 && (
          <View style={styles.summaryCreditContainer} wrap={false}>
            <Text style={styles.summaryCreditTitle}>Ringkasan Kredit Belum Lunas ({kreditList.length} Transaksi)</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tagihan Kredit:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalTagihanKredit)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: "#166534" }]}>Total Sudah Dibayar:</Text>
              <Text style={[styles.summaryValue, { color: "#166534" }]}>{formatCurrency(totalDibayarKredit)}</Text>
            </View>
            <View style={styles.labaRow}>
              <Text style={[styles.summaryLabel, { color: "#991b1b" }]}>Total Sisa Kredit:</Text>
              <Text style={[styles.summaryValue, { color: "#991b1b", fontSize: 11 }]}>{formatCurrency(totalSisaKredit)}</Text>
            </View>
          </View>
        )}

        {kreditLunasList.length > 0 && (
          <View style={[styles.summaryCreditContainer, { backgroundColor: "#f0fdf4", borderColor: "#86efac" }]} wrap={false}>
            <Text style={[styles.summaryCreditTitle, { color: "#166534", borderBottomColor: "#86efac" }]}>Kredit Sudah Lunas ({kreditLunasList.length} Transaksi)</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tagihan:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(kreditLunasList.reduce((s, t) => s + (t.grand_total || 0), 0))}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: "#166534" }]}>Total Dibayar:</Text>
              <Text style={[styles.summaryValue, { color: "#166534" }]}>{formatCurrency(kreditLunasList.reduce((s, t) => s + (t.total_bayar || 0), 0))}</Text>
            </View>
          </View>
        )}

        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterText}>Dicetak pada: {new Date().toLocaleString("id-ID")}</Text>
          <Text style={styles.pageFooterText} render={({ pageNumber, totalPages }) => (
            `Halaman ${pageNumber} dari ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};

export default RekapPdfDocument;