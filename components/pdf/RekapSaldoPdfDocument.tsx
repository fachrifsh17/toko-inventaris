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
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  thLeft: {
    flex: 2.6,
    fontSize: 7,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  thRight: {
    flex: 1,
    fontSize: 7,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "right",
  },
  rowWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowContainer: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  rowLeft: {
    flex: 2.6,
  },
  rowLeftGrid: {
    flexDirection: "row",
  },
  rowSubCol: {
    flex: 1,
    marginRight: 5,
  },
  rowRight: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
    paddingLeft: 15,
    justifyContent: "flex-end",
  },
  rowIdLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  rowIdText: {
    fontSize: 7,
    color: "#6b7280",
    fontWeight: "bold",
  },
  rowInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1.5,
  },
  rowInfoLabel: {
    fontSize: 8,
    color: "#6b7280",
    width: 52,
  },
  rowInfoItem: {
    fontSize: 8,
    color: "#374151",
  },
  rincianRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  rincianLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  rincianValue: {
    fontSize: 8,
    color: "#374151",
  },
  rincianValueRed: {
    fontSize: 8,
    color: "#dc2626",
  },
  rincianValueBold: {
    fontSize: 9,
    color: "#111827",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#059669",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
  },
  badgeLunas: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgeBelumLunas: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgeTopUp: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#2563eb",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgeTransfer: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#7c3aed",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgeTarikTunai: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#d97706",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgePpob: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#9333ea",
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    alignSelf: "flex-end",
    width: "100%",
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
  summaryValueGreen: {
    fontSize: 9,
    color: "#059669",
    fontWeight: "bold",
  },
  summaryValueRed: {
    fontSize: 9,
    color: "#dc2626",
    fontWeight: "bold",
  },
  summaryHighlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  summaryGrid: {
    flexDirection: "row",
  },
  summaryCol: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 15,
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
  keteranganContainer: {
    paddingHorizontal: 8,
    paddingBottom: 7,
  },
  keteranganText: {
    fontSize: 7,
    color: "#6b7280",
    fontStyle: "italic",
  },
});

interface RekapSaldoPdfDocumentProps {
  data: any[];
  pengaturan: any;
  filters: {
    jenis?: string;
    provider?: string;
    saldoId?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  };
}

const RekapSaldoPdfDocument = ({
  data,
  pengaturan,
  filters,
}: RekapSaldoPdfDocumentProps) => {
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

  const getJenisLabel = (j: string) => {
    const map: Record<string, string> = {
      top_up: "Top Up",
      transfer: "Transfer",
      tarik_tunai: "Tarik Tunai",
      ppob: "PPOB",
    };
    return map[j] || j;
  };

  const getJenisBadgeStyle = (j: string) => {
    const map: Record<string, any> = {
      top_up: styles.badgeTopUp,
      transfer: styles.badgeTransfer,
      tarik_tunai: styles.badgeTarikTunai,
      ppob: styles.badgePpob,
    };
    return map[j] || styles.badgeTopUp;
  };

  const getStatusBadgeStyle = (s: string) => {
    return s === "Lunas" ? styles.badgeLunas : styles.badgeBelumLunas;
  };

  const totalNominal = data.reduce((sum, t) => sum + (t.nominal || 0), 0);
  const totalBiayaAdmin = data.reduce((sum, t) => sum + (t.total_biaya_admin || 0), 0);
  const totalBiayaLain = data.reduce((sum, t) => sum + (t.biaya_lain_lain || 0), 0);
  const totalKeseluruhan = data.reduce((sum, t) => sum + (t.total_semua || 0), 0);
  const totalLunas = data.filter((t) => t.status === "Lunas").length;
  const totalBelumLunas = data.filter((t) => t.status === "Belum Lunas").length;

  const renderRow = (transaksi: any) => {
    return (
      <View key={transaksi.id} style={styles.rowWrapper}>
        <View style={styles.rowContainer}>
          <View style={styles.rowLeft}>
            <View style={styles.rowIdLine}>
              <Text style={styles.rowIdText}>#{transaksi.id} - {formatDateTime(transaksi.tanggal)}</Text>
              <Text style={getStatusBadgeStyle(transaksi.status)}>
                {transaksi.status === "Lunas" ? "LUNAS" : "BELUM LUNAS"}
              </Text>
            </View>

            <View style={styles.rowLeftGrid}>
              <View style={styles.rowSubCol}>
                <View style={styles.rowInfoRow}>
                  <Text style={styles.rowInfoLabel}>Jenis</Text>
                  <Text style={getJenisBadgeStyle(transaksi.jenis)}>
                    {getJenisLabel(transaksi.jenis).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.rowInfoRow}>
                  <Text style={styles.rowInfoLabel}>Provider</Text>
                  <Text style={styles.rowInfoItem}>{transaksi.provider_bank}</Text>
                </View>
              </View>

              <View style={styles.rowSubCol}>
                <View style={styles.rowInfoRow}>
                  <Text style={styles.rowInfoLabel}>No. Target</Text>
                  <Text style={styles.rowInfoItem}>{transaksi.nomor_target}</Text>
                </View>
                <View style={styles.rowInfoRow}>
                  <Text style={styles.rowInfoLabel}>Pelanggan</Text>
                  <Text style={styles.rowInfoItem}>{transaksi.nama_pelanggan || "-"}</Text>
                </View>
              </View>

              <View style={styles.rowSubCol}>
                <View style={styles.rowInfoRow}>
                  <Text style={styles.rowInfoLabel}>Akun Saldo</Text>
                  <Text style={styles.rowInfoItem}>{transaksi.nama_saldo || "-"}</Text>
                </View>
                <View style={styles.rowInfoRow}>
                  <Text style={styles.rowInfoLabel}>Petugas</Text>
                  <Text style={styles.rowInfoItem}>{transaksi.dicatat_oleh || "Sistem"}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.rowRight}>
            <View style={styles.rincianRow}>
              <Text style={styles.rincianLabel}>Nominal</Text>
              <Text style={styles.rincianValueBold}>{formatCurrency(transaksi.nominal)}</Text>
            </View>
            <View style={styles.rincianRow}>
              <Text style={styles.rincianLabel}>Biaya Admin</Text>
              <Text style={styles.rincianValue}>{formatCurrency(transaksi.total_biaya_admin || 0)}</Text>
            </View>
            <View style={styles.rincianRow}>
              <Text style={styles.rincianLabel}>Biaya Lain-lain</Text>
              <Text style={styles.rincianValueRed}>- {formatCurrency(transaksi.biaya_lain_lain || 0)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Bayar</Text>
              <Text style={styles.totalValue}>{formatCurrency(transaksi.total_semua || transaksi.total_bayar)}</Text>
            </View>
          </View>
        </View>

        {transaksi.keterangan && (
          <View style={styles.keteranganContainer}>
            <Text style={styles.keteranganText}>"{transaksi.keterangan}"</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>
              {pengaturan?.nama_toko || "GLOWAURA SKINLAB"}
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
            <Text style={styles.reportTitle}>Laporan Transaksi Digital</Text>
            <Text style={styles.filterInfo}>
              Periode: {filters.startDate ? formatDate(filters.startDate) : "Awal"} - {filters.endDate ? formatDate(filters.endDate) : "Sekarang"}
            </Text>
            {filters.jenis && (
              <Text style={styles.filterInfo}>
                Jenis: {getJenisLabel(filters.jenis)}
              </Text>
            )}
            {filters.provider && (
              <Text style={styles.filterInfo}>
                Provider: {filters.provider}
              </Text>
            )}
            {filters.status && (
              <Text style={styles.filterInfo}>
                Status: {filters.status === "Lunas" ? "Lunas" : "Belum Lunas"}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.thLeft}>Detail Transaksi</Text>
          <Text style={styles.thRight}>Rincian Biaya</Text>
        </View>

        {data.map((transaksi: any) => renderRow(transaksi))}

        <View style={styles.summaryContainer} wrap={false}>
          <Text style={styles.summaryTitle}>Ringkasan Keseluruhan</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCol}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Transaksi:</Text>
                <Text style={styles.summaryValue}>{data.length} transaksi</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Lunas:</Text>
                <Text style={styles.summaryValue}>{totalLunas} transaksi</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Belum Lunas:</Text>
                <Text style={styles.summaryValue}>{totalBelumLunas} transaksi</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Nominal:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalNominal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Biaya Admin:</Text>
                <Text style={styles.summaryValueGreen}>{formatCurrency(totalBiayaAdmin)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Biaya Lain:</Text>
                <Text style={styles.summaryValueRed}>- {formatCurrency(totalBiayaLain)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryHighlightRow}>
            <Text style={[styles.summaryLabel, { color: "#059669" }]}>Total Keseluruhan:</Text>
            <Text style={[styles.summaryValue, { color: "#059669", fontSize: 11 }]}>
              {formatCurrency(totalKeseluruhan)}
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

export default RekapSaldoPdfDocument;