import jsPDF from 'jspdf';

export default function generateSimplePDF({
  startDate,
  endDate,
  totalAmount,
  transactions = [],
  payments = [],
}) {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  doc.setFontSize(18);
  doc.text('Rapport Administratif', 105, y, { align: 'center' });

  y += 10;
  doc.setFontSize(12);
  doc.text(`Période: ${startDate || 'N/A'} - ${endDate || 'N/A'}`, margin, y);

  y += 10;
  doc.text(`Total des Transactions: ${Number(totalAmount).toFixed(2)} DH`, margin, y);

  // Transactions Section
  y += 20;
  doc.setFontSize(14);
  doc.text('Transactions:', margin, y);
  doc.setFontSize(11);

  if (transactions.length === 0) {
    y += 10;
    doc.text('Aucune transaction disponible.', margin, y);
  } else {
    transactions.forEach((t) => {
      y += 8;
      doc.text(
        `• ${t.date || 'N/A'} | ${t.description || 'N/A'} | ${t.amount?.toFixed(2) || '0.00'} DH`,
        margin,
        y
      );
    });
  }

  // Payments Section
  y += 20;
  doc.setFontSize(14);
  doc.text('Paiements:', margin, y);
  doc.setFontSize(11);

  if (payments.length === 0) {
    y += 10;
    doc.text('Aucun paiement disponible.', margin, y);
  } else {
    payments.forEach((p) => {
      y += 8;
      doc.text(
        `• ${p.date || 'N/A'} | ${p.recipient || 'N/A'} | ${p.amount?.toFixed(2) || '0.00'} DH`,
        margin,
        y
      );
    });
  }

  return doc;
}
