function StockHeaderPanel({ stockData }) {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-2">{stockData.name}</h2>
      <p className="text-5xl font-extrabold">{stockData.c}원</p>
      <p className={stockData.d >= 0 ? "text-red-600 text-lg" : "text-blue-600 text-lg"}>
        {stockData.d >= 0 ? '▲' : '▼'} {stockData.d} ({stockData.dp}%)
      </p>
      <p className="text-base text-gray-600">
        시가 {stockData.o} / 고가 {stockData.h} / 저가 {stockData.l} / 전일 {stockData.pc}
      </p>
    </div>
  );
}

export default StockHeaderPanel;