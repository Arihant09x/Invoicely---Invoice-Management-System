import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { money, shortDate } from "@/lib/format";
import type { Invoice } from "@/types/invoice";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: "#0f172a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  invoiceNumber: { fontSize: 14, color: "#64748b" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metaBlock: { gap: 2 },
  metaLabel: { fontSize: 9, color: "#64748b", textTransform: "uppercase" },
  metaValue: { fontSize: 12, marginBottom: 4 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
  },
  cell: { flex: 1 },
  desc: { flex: 3 },
  num: { flex: 1, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  totalLabel: { fontSize: 13, fontWeight: "bold" },
  totalValue: { fontSize: 15, fontWeight: "bold", marginLeft: 24 },
  notes: { marginTop: 24, fontSize: 10, color: "#64748b" },
});

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <Document title={`${invoice.invoiceNumber} · Invoicely`} author="Invoicely">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Billed to</Text>
            <Text style={styles.metaValue}>{invoice.clientName}</Text>
            {invoice.clientEmail ? (
              <Text style={styles.metaValue}>{invoice.clientEmail}</Text>
            ) : null}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Issue date</Text>
            <Text style={styles.metaValue}>{shortDate(invoice.issueDate)}</Text>
            <Text style={styles.metaLabel}>Due date</Text>
            <Text style={styles.metaValue}>{shortDate(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.desc]}>Description</Text>
          <Text style={[styles.cell, styles.num]}>Qty</Text>
          <Text style={[styles.cell, styles.num]}>Unit price</Text>
          <Text style={[styles.cell, styles.num]}>Amount</Text>
        </View>

        {invoice.items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.cell, styles.desc]}>{item.description}</Text>
            <Text style={[styles.cell, styles.num]}>{item.quantity}</Text>
            <Text style={[styles.cell, styles.num]}>
              {money(item.unitPrice)}
            </Text>
            <Text style={[styles.cell, styles.num]}>{money(item.amount)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{money(invoice.amount)}</Text>
        </View>

        {invoice.notes ? (
          <Text style={styles.notes}>Notes: {invoice.notes}</Text>
        ) : null}
      </Page>
    </Document>
  );
}

export function InvoicePdf({
  invoice,
  children,
}: {
  invoice: Invoice;
  children?: ReactNode;
}) {
  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoice} />}
      fileName={`${invoice.invoiceNumber}.pdf`}
    >
      {children ?? "Download PDF"}
    </PDFDownloadLink>
  );
}