import StockChart from './StockChart';

function StockChartPanel({ priceHistory }) {
  return (
    <div className="p-4 border rounded shadow h-64">
      <StockChart data={priceHistory} />
    </div>
  );
}

export default StockChartPanel;