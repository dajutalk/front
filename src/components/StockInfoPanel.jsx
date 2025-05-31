import StockChart from './StockChart';

function StockInfoPanel({ stockData, priceHistory }) {
  return (
<div className="bg-white p-6 rounded shadow border mb-6">
  <h2 className="text-2xl font-bold mb-2">{stockData.name}</h2>
  <p className="text-5xl font-extrabold">{stockData.c}원</p>
  <p className={stockData.d >= 0 ? "text-red-600 text-lg" : "text-blue-600 text-lg"}>
    {stockData.d >= 0 ? '▲' : '▼'} {stockData.d} ({stockData.dp}%)
  </p>
  <p className="text-base text-gray-600 mb-4">
    시가 {stockData.o} / 고가 {stockData.h} / 저가 {stockData.l} / 전일 {stockData.pc}
  </p>

  {/* 그래프 영역 */}
  <div className="h-64">  {/* 256px → 이전보다 약 1.5배 확장 */}
    <StockChart data={priceHistory} />
  </div>
</div>
  );
}

export default StockInfoPanel;
