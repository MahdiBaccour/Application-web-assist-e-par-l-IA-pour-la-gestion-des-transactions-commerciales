// ReportDocument.jsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

/* ─────────── Helpers ─────────── */
const fmtDate = (d) => (d ? String(d).split('T')[0] : 'N/A');           // yyyy-mm-dd sans millisecondes
const fmtNum  = (n) => Number(n || 0).toFixed(2);                       // 2 décimales

/* ─────────── Styles ─────────── */
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { fontSize: 22, marginBottom: 20, textAlign: 'center', color: '#1366d6' },
  label:  { fontSize: 12, marginVertical: 8, fontWeight: 'bold' },

  table: {
    display: 'table', width: 'auto', marginBottom: 20,
    borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0,
  },
  tableRow: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#dbeafe' },

  th: {
    padding: 5, fontSize: 10, fontWeight: 700,
    borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0,
    backgroundColor: '#dbeafe',
  },
  td: {
    padding: 5, fontSize: 10,
    borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0,
  },
  rowEven: { backgroundColor: '#f8fafc' },
});

/* ─────────── Component ─────────── */
const ReportDocument = ({
  startDate,
  endDate,
  totalAmount,
  reportType,
  view,
  transactionsData = [],
  paymentsData = [],
}) => {
  // --- filtrage
  const filteredTransactions = transactionsData.filter((t) => {
    const d = new Date(t.date);
    const s = startDate ? new Date(startDate) : null;
    const e = endDate   ? new Date(endDate)   : null;
    if (s && e) return d >= s && d <= e;
    if (s)      return d >= s;
    if (e)      return d <= e;
    return true;
  });

  const totalTransactionAmount = fmtNum(
    filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
  );

  /* ----- render rows helper ----- */
  const cell = (txt, w) => (
    <Text style={[styles.td, { width: w }]}>{txt}</Text>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Rapport financier</Text>
        <Text style={styles.label}>
          Période : {startDate || 'N/A'} – {endDate || 'N/A'}
        </Text>

        {(reportType === 'stats' || reportType === 'credit') && view === 'tables' && (
          <>
            <Text style={styles.label}>
              Total des Transactions : {totalAmount || totalTransactionAmount} TND
            </Text>

            {/* ───────── Transactions ───────── */}
            <Text style={styles.label}>Transactions</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                {['Référence', 'Date', 'Description', 'Montant'].map((h, i) => (
                  <Text key={i} style={[styles.th, { width: '25%' }]}>{h}</Text>
                ))}
              </View>

              {filteredTransactions.map((tr, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i % 2 === 0 && styles.rowEven, // zébrage
                  ]}
                >
                  {cell(tr.reference_number || tr.id || 'N/A', '25%')}
                  {cell(fmtDate(tr.date), '25%')}
                  {cell(tr.description || 'N/A', '25%')}
                  {cell(`${fmtNum(tr.amount)} TND`, '25%')}
                </View>
              ))}

              <View style={styles.tableRow}>
                {cell('Total', '75%')}
                <Text style={[styles.td, { width: '25%', fontWeight: 'bold' }]}>
                  {totalTransactionAmount} TND
                </Text>
              </View>
            </View>

            {/* ───────── Paiements ───────── */}
            <Text style={styles.label}>Paiements</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                {['Référence', 'Montant', 'Méthode', 'Date'].map((h, i) => (
                  <Text key={i} style={[styles.th, { width: '25%' }]}>{h}</Text>
                ))}
              </View>

              {paymentsData.map((p, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i % 2 === 0 && styles.rowEven,
                  ]}
                >
                  {cell(p.reference || p.transaction_id || 'N/A', '25%')}
                  {cell(`${fmtNum(p.amount_paid)} TND`, '25%')}
                  {cell(p.payment_method || p.payment_method_id || 'N/A', '25%')}
                  {cell(fmtDate(p.payment_date), '25%')}
                </View>
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  );
};

export default ReportDocument;