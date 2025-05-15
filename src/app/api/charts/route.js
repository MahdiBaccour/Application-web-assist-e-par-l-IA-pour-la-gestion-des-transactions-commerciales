export async function POST(req) {
    const { reportType, view, startDate, endDate } = await req.json();
  
    try {
      // Placeholder data (replace with your database query)
      const data = {
        dashboardData: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Ventes', data: [400, 300, 500] }] },
        budgetData: { labels: ['Budget', 'Dépenses'], datasets: [{ data: [1000, 800] }] },
        topProductsData: { labels: ['Produit A', 'Produit B'], datasets: [{ data: [200, 150] }] },
        performanceData: { labels: ['Q1', 'Q2'], datasets: [{ data: [90, 95] }] },
        transactionsData: { labels: ['T1', 'T2'], datasets: [{ data: [500, 600] }] },
        paymentData: { labels: ['P1', 'P2'], datasets: [{ data: [300, 400] }] },
        clientClassificationData: { labels: ['Client A', 'Client B'], datasets: [{ data: [50, 70] }] },
        supplierClassificationData: { labels: ['Fournisseur A', 'Fournisseur B'], datasets: [{ data: [60, 80] }] },
        budgetPredictionData: { labels: ['2025', '2026'], datasets: [{ data: [1200, 1300] }] },
        totalAmount: 12345.67,
      };
  
      // Generate chart images using QuickChart
      const generateChart = async (chartData, type = 'bar') => {
        const response = await fetch('https://quickchart.io/chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chart: { type, data: chartData },
            width: 600,
            height: 400,
          }),
        });
        return response.text(); // Returns base64 image
      };
  
      const response = {
        dashboardImg: reportType === 'stats' && view === 'graphs' ? await generateChart(data.dashboardData) : null,
        budgetImg: reportType === 'stats' && view === 'graphs' ? await generateChart(data.budgetData, 'pie') : null,
        topProductsImg: reportType === 'stats' && view === 'graphs' ? await generateChart(data.topProductsData) : null,
        performanceImg: reportType === 'stats' && view === 'graphs' ? await generateChart(data.performanceData) : null,
        transactionsImg: reportType === 'stats' && view === 'tables' ? await generateChart(data.transactionsData) : null,
        paymentImg: reportType === 'stats' && view === 'tables' ? await generateChart(data.paymentData) : null,
        clientClassificationImg: reportType === 'predictions' && view === 'client' ? await generateChart(data.clientClassificationData) : null,
        supplierClassificationImg: reportType === 'predictions' && view === 'supplier' ? await generateChart(data.supplierClassificationData) : null,
        budgetPredictionImg: reportType === 'predictions' ? await generateChart(data.budgetPredictionData) : null,
        totalAmount: data.totalAmount,
      };
  
      return Response.json(response);
    } catch (error) {
      console.error('Error generating charts:', error);
      return Response.json({ error: 'Failed to generate charts' }, { status: 500 });
    }
  }