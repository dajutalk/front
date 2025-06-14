import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const [holdings, setHoldings] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [holdingsRes, tradesRes] = await Promise.all([
          fetch("http://localhost:8000/api/mock-investment/holdings-summary", {
            credentials: "include",
          }),
          fetch("http://localhost:8000/api/mock-investment/trade-history", {
            credentials: "include",
          }),
        ]);

        const holdingsData = await holdingsRes.json();
        const tradesData = await tradesRes.json();

        setHoldings(holdingsData.holdings || []);
        setTrades(tradesData.trades || []);
      } catch (err) {
        console.error("마이페이지 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartMockInvestment = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/mock-investment/start", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        alert("모의투자를 시작했습니다.");
      } else {
        const data = await res.json();
        alert(data.detail || "오류 발생");
      }
    } catch (err) {
      alert("요청 실패");
      console.error(err);
    }
  };

  if (loading) return <div className="p-6 text-center">📊 데이터 로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📈 마이페이지</h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate("/")}
          >
            홈으로
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleStartMockInvestment}
          >
            모의투자 시작
          </button>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">🪙 보유 종목</h2>
        <div className="bg-white rounded shadow p-4">
          {holdings.length === 0 ? (
            <p className="text-gray-600">보유 중인 종목이 없습니다.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">종목</th>
                  <th className="text-right py-2">보유 수량</th>
                  <th className="text-right py-2">평균 매수 가격</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((item) => (
                  <tr key={item.symbol} className="border-b">
                    <td className="py-2">{item.symbol}</td>
                    <td className="text-right py-2">{item.quantity.toLocaleString()}</td>
                    <td className="text-right py-2">${item.average_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">📜 거래 기록</h2>
        <div className="bg-white rounded shadow p-4 max-h-[400px] overflow-y-auto">
          {trades.length === 0 ? (
            <p className="text-gray-600">거래 내역이 없습니다.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">일시</th>
                  <th className="text-left py-2">종목</th>
                  <th className="text-left py-2">구분</th>
                  <th className="text-right py-2">수량</th>
                  <th className="text-right py-2">가격</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{new Date(trade.timestamp).toLocaleString()}</td>
                    <td className="py-2">{trade.symbol}</td>
                    <td className={`py-2 ${trade.type === "BUY" ? "text-green-600" : "text-blue-600"}`}>
                      {trade.type === "BUY" ? "매수" : "매도"}
                    </td>
                    <td className="text-right py-2">{trade.quantity.toLocaleString()}</td>
                    <td className="text-right py-2">${trade.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
