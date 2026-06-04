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
  colItemName: { width: "40%", fontSize: 9, color: "#4b5563" },
  colQty: { width: "15%", fontSize: 9, color: "#4b5563", textAlign: "center" },
  colPrice: { width: "22.5%", fontSize: 9, color: "#4b5563", textAlign: "right" },
  colSubtotal: { width: "22.5%", fontSize: 9, color: "#4b5563", textAlign: "right" },
  itemHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    marginRight: 10,
  },
  footerValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    width: "22.5%",
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

  const totalModal = data.reduce(
    (sum, t) => sum + (t.total_harga_modal || 0),
    0,
  );
  const totalJual = data.reduce((sum, t) => sum + (t.total_harga_jual || 0), 0);
  const totalLaba = totalJual - totalModal;

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
          const totalTransaksi = isMasuk ? transaksi.total_harga_modal : transaksi.total_harga_jual;

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
                  <Text style={styles.thValue}>{transaksi.metode_pembayaran || "CASH"}</Text>
                </View>
                <View style={styles.thCol4}>
                  <Text style={styles.thText}>Petugas</Text>
                  <Text style={styles.thValue}>{transaksi.users?.nama_lengkap || "Sistem"}</Text>
                </View>
              </View>

              <View style={styles.itemTable}>
                <View style={styles.itemHeaderRow}>
                  <Text style={[styles.colItemName, styles.itemHeaderText]}>Nama Produk</Text>
                  <Text style={[styles.colQty, styles.itemHeaderText]}>Qty</Text>
                  <Text style={[styles.colPrice, styles.itemHeaderText]}>
                    {isMasuk ? "Harga Beli" : "Harga Jual"}
                  </Text>
                  <Text style={[styles.colSubtotal, styles.itemHeaderText]}>Subtotal</Text>
                </View>

                {transaksi.detail_transaksi?.map((item: any, iIndex: number) => {
                  const hargaSatuan = isMasuk ? item.harga_modal_real : item.harga_jual_real;
                  const subtotal = (hargaSatuan || 0) * (item.jumlah || 0);

                  return (
                    <View key={iIndex} style={styles.itemRow}>
                      <Text style={styles.colItemName}>{item.produk?.nama_produk || "Produk Tidak Diketahui"}</Text>
                      <Text style={styles.colQty}>{item.jumlah}x</Text>
                      <Text style={styles.colPrice}>{formatCurrency(hargaSatuan || 0)}</Text>
                      <Text style={styles.colSubtotal}>{formatCurrency(subtotal)}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.transactionFooter}>
                <Text style={styles.footerLabel}>Total Transaksi:</Text>
                <Text style={styles.footerValue}>{formatCurrency(totalTransaksi)}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.summaryContainer} wrap={false}>
          <Text style={styles.summaryTitle}>Ringkasan Keseluruhan</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Nilai Masuk (Modal):</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalModal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Nilai Keluar (Jual):</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalJual)}</Text>
          </View>
          <View style={styles.labaRow}>
            <Text style={[styles.summaryLabel, { color: totalLaba >= 0 ? "#166534" : "#991b1b" }]}>
              {totalLaba >= 0 ? "Potensi Laba Kotor:" : "Potensi Rugi Kotor:"}
            </Text>
            <Text style={[styles.summaryValue, { color: totalLaba >= 0 ? "#166534" : "#991b1b" }]}>
              {formatCurrency(Math.abs(totalLaba))}
            </Text>
          </View>
        </View>

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