import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Chatbot from "./components/Chatbot";

const API_URL = process.env.REACT_APP_API_URL;
const API_WS = process.env.REACT_APP_API_WS;

export default function StockMain() {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("연결 중...");
  const [wsRef, setWsRef] = useState(null);
  const navigate = useNavigate();

  const handleSelectStock = (selectedStockName) => {
    navigate(`/stock/${selectedStockName}`);
  };

  const handleStartMockInvestment = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mock-investment/start`, {
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

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
      window.location.reload();
    } catch (error) {
      navigate("/login");
      window.location.reload();
    }
  };

  const requestLatestData = () => {
    if (wsRef && wsRef.readyState === WebSocket.OPEN) {
      wsRef.send("get_latest");
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`wss://${API_WS}/ws/main`);
    setWsRef(ws);

    ws.onopen = () => {
      setConnectionStatus("연결됨");
      ws.send("get_latest");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "market_update" && message.data) {
          const { stocks = [], cryptos = [] } = message.data;
          const allData = [
            ...stocks.map((stock) => ({ ...stock, isStock: true })),
            ...cryptos.map((crypto) => ({ ...crypto, isStock: false })),
          ];

          setStocks((prev) => {
            const updatedStocks = [...prev];
            const currentTime = new Date();
            const timeString = currentTime.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            allData.forEach((quote) => {
              const idx = updatedStocks.findIndex((s) => s.name === quote.symbol);
              const price = parseFloat(quote.price);
              if (isNaN(price)) return;

              const historyData = quote.history?.map((h) => ({
                time: h.time.toString(),
                price: h.price,
              })) || [];

              const newDataPoint = { time: timeString, price };

              if (idx !== -1) {
                const updatedData = [...updatedStocks[idx].data, newDataPoint].slice(-50);
                updatedStocks[idx] = {
                  ...updatedStocks[idx],
                  data: updatedData,
                  currentPrice: price,
                  change: parseFloat(quote.change) || 0,
                  changePercent: parseFloat(quote.changePercent) || 0,
                  lastUpdate: timeString,
                };
              } else {
                const initialData = historyData.length > 0 ? historyData : [newDataPoint];
                updatedStocks.push({
                  name: quote.symbol,
                  data: initialData,
                  isStock: quote.isStock,
                  lastUpdate: timeString,
                  currentPrice: price,
                  change: parseFloat(quote.change) || 0,
                  changePercent: parseFloat(quote.changePercent) || 0,
                });
              }
            });

            return updatedStocks;
          });
        }
      } catch (error) {
        console.error("WebSocket 메시지 처리 에러:", error);
      }
    };

    ws.onerror = () => setConnectionStatus("연결 오류");
    ws.onclose = () => {
      setConnectionStatus("연결 끊김");
      setTimeout(() => setConnectionStatus("재연결 중..."), 5000);
    };

    return () => ws.close();
  }, []);

  const coinStocks = stocks.filter((s) => !s.isStock && s.data.length > 0 && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const stockStocks = stocks.filter((s) => s.isStock && s.data.length > 0 && s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <Sidebar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stockList={stocks}
        onSelectStock={handleSelectStock}
      />

      <div className="flex-1 p-4 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold">📈 실시간 주식/코인 차트</h1>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-sm self-start ${
              connectionStatus === "연결됨" ? "bg-green-100 text-green-800" :
              connectionStatus.includes("중") ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {connectionStatus}
            </span>
            <button onClick={requestLatestData} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              새로고침
            </button>
            <button onClick={handleStartMockInvestment} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              모의투자 시작
            </button>
            <button
              onClick={() => navigate("/mypage")}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              마이페이지
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              로그아웃
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2">🪙 코인 차트 ({coinStocks.length}개)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {coinStocks.map((stock) => (
          <StockChart
            key={stock.name}
            stock={stock}
            color="#8884d8"
            onClick={() => handleSelectStock(stock.name)}
          />
        ))}
        </div>

        <h2 className="text-lg font-semibold mb-2">📈 주식 차트 ({stockStocks.length}개)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockStocks.map((stock) => (
          <StockChart
            key={stock.name}
            stock={stock}
            color="#82ca9d"
            onClick={() => handleSelectStock(stock.name)}
          />
        ))}
        </div>
      </div>

      <div className="w-full lg:w-96 p-2">
        <Chatbot />
      </div>
    </div>
  );
}

function StockChart({ stock, color }) {
  return (
    <div className="border p-2 rounded shadow bg-white flex flex-col items-center w-full">
      <h3 className="text-sm font-semibold mb-1">{stock.name}</h3>
      {stock.data.length > 0 ? (
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={stock.data}>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fontSize: 10 }} width={60} />
            <CartesianGrid stroke="#ccc" />
            <Tooltip
              formatter={(value) => [value.toLocaleString(), '가격']}
              labelFormatter={(label) => `시간: ${label}`}
            />
            <Line type="monotone" dataKey="price" stroke={color} dot={false} strokeWidth={2} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-[150px] flex items-center justify-center text-gray-500">
          데이터 로딩 중...
        </div>
      )}
      <div className="mt-1 text-xs text-gray-700 space-y-1 w-full text-left">
        <div>
          <span className="font-semibold">현재가:</span>{" "}
          {stock.currentPrice ? stock.currentPrice.toLocaleString() : "-"}
          <span className="ml-2 text-gray-500">({stock.data.length}개 포인트)</span>
        </div>
        {stock.isStock && stock.change !== undefined && (
          <div className="flex gap-2 text-xs">
            <span className={stock.change >= 0 ? 'text-red-600' : 'text-blue-600'}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
            </span>
            <span className={stock.changePercent >= 0 ? 'text-red-600' : 'text-blue-600'}>
              ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
