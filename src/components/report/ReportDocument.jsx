import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    padding: 5,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
});

const ReportDocument = ({
  startDate,
  endDate,
  totalAmount,
  reportType,
  view,
  transactionsData = [],
  paymentsData = [],
}) => {
  // Filter transactions safely
  const filteredTransactions = transactionsData.filter((transaction) => {
    const date = new Date(transaction.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) return date >= start && date <= end;
    if (start) return date >= start;
    if (end) return date <= end;
    return true;
  });

  const totalTransactionAmount = filteredTransactions
    .reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0)
    .toFixed(2);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.header}>Rapport Administratif</Text>
          <Text style={styles.label}>
            Période: {startDate || 'N/A'} - {endDate || 'N/A'}
          </Text>

          {(reportType === 'stats' || reportType === 'credit') && view === 'tables' && (
            <>
              <Text style={styles.label}>
                Total des Transactions: {totalAmount || totalTransactionAmount} DH
              </Text>

              {/* Transactions Table */}
              <Text style={styles.label}>Transactions</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>ID</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>Date</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>Description</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>Montant</Text>
                </View>

                {filteredTransactions.map((transaction, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{transaction.id || 'N/A'}</Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{transaction.date || 'N/A'}</Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{transaction.description || 'N/A'}</Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>
                      {Number(transaction.amount).toFixed(2)} DH
                    </Text>
                  </View>
                ))}

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '75%', fontWeight: 'bold' }]}>Total</Text>
                  <Text style={[styles.tableCell, { width: '25%', fontWeight: 'bold' }]}>
                    {totalTransactionAmount} DH
                  </Text>
                </View>
              </View>

              {/* Payments Table */}
              <Text style={styles.label}>Paiements</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>ID</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>Montant</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>Méthode</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>Date</Text>
                </View>

                {paymentsData.map((payment, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{payment.id || 'N/A'}</Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{payment.amount_paid || 'N/A'}</Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{payment.payment_method_id || 'N/A'}</Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{payment.payment_date || 'N/A'}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ReportDocument;
