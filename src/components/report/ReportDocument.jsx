import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';

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
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  columnHeader: {
    width: '25%',
    fontWeight: 'bold',
    fontSize: 10,
  },
  columnData: {
    width: '25%',
    fontSize: 10,
  },
});

export default function ReportDocument({
  startDate,
  endDate,
  totalAmount,
  reportType,
  view,
  transactionsImg,
  paymentImg,
  dashboardImg,
  budgetImg,
  topProductsImg,
  clientClassificationImg,
  supplierClassificationImg,
  budgetPredictionImg,
  performanceImg,
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Rapport Administratif</Text>
        <Text style={styles.label}>Période: {startDate} - {endDate}</Text>

        {/* 📊 STATISTICS */}
        {reportType === 'stats' && view === 'tables' && (
          <>
            <Text style={styles.label}>Total des Transactions: {totalAmount.toFixed(2)} DH</Text>
            {transactionsImg && <Image src={transactionsImg} style={styles.image} />}
            {paymentImg && <Image src={paymentImg} style={styles.image} />}
          </>
        )}

        {reportType === 'stats' && view === 'graphs' && (
          <>
            {performanceImg && (
              <>
                <Text style={styles.label}>Indicateurs de Performance</Text>
                <Image src={performanceImg} style={styles.image} />
              </>
            )}
            {dashboardImg && (
              <>
                <Text style={styles.label}>Graphiques des Statistiques</Text>
                <Image src={dashboardImg} style={styles.image} />
              </>
            )}
            {budgetImg && (
              <>
                <Text style={styles.label}>État du Budget</Text>
                <Image src={budgetImg} style={styles.image} />
              </>
            )}
            {topProductsImg && (
              <>
                <Text style={styles.label}>Produits les plus vendus</Text>
                <Image src={topProductsImg} style={styles.image} />
              </>
            )}
          </>
        )}

        {/* 🤖 AI PREDICTIONS */}
        {reportType === 'predictions' && (
          <>
            {view === 'client' && clientClassificationImg && (
              <>
                <Text style={styles.label}>Classification des Clients</Text>
                <Image src={clientClassificationImg} style={styles.image} />
              </>
            )}
            {view === 'supplier' && supplierClassificationImg && (
              <>
                <Text style={styles.label}>Classification des Fournisseurs</Text>
                <Image src={supplierClassificationImg} style={styles.image} />
              </>
            )}
            {budgetPredictionImg && (
              <>
                <Text style={styles.label}>Prédiction du Budget</Text>
                <Image src={budgetPredictionImg} style={styles.image} />
              </>
            )}
          </>
        )}
      </Page>
    </Document>
  );
}