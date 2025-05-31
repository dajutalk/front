import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function StockMain() {
  const [stocks, setStocks] = useState([]); // 빈 배열로 시작
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("연결 중...");
  const [wsRef, setWsRef] = useState(null);
  const navigate = useNavigate();

  const handleSelectStock = (selectedStockName) => {
    console.log("선택된 종목:", selectedStockName);
    
    // 종목 상세 페이지로 이동
    navigate(`/stock/${selectedStockName}`);
  };

  // 최신 데이터 요청 함수
  const requestLatestData = () => {
    if (wsRef && wsRef.readyState === WebSocket.OPEN) {
      wsRef.send("get_latest");
    }
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/main");
    setWsRef(ws);

    ws.onopen = () => {
      console.log("✅ WebSocket 연결됨");
      setConnectionStatus("연결됨");
      // 연결되자마자 최신 데이터 요청
      ws.send("get_latest");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📨 서버로부터 받은 메시지:", message);
        
        // 메시지 타입 확인
        if (message.type === "market_update" && message.data) {
          const { stocks = [], cryptos = [] } = message.data;
          console.log(`📊 받은 데이터 - 주식: ${stocks.length}개, 코인: ${cryptos.length}개`);
          
          // 모든 데이터를 하나의 배열로 합치기
          const allData = [
            ...stocks.map(stock => ({ ...stock, isStock: true })),
            ...cryptos.map(crypto => ({ ...crypto, isStock: false }))
          ];
          
          console.log("🔄 처리할 전체 데이터:", allData);

          setStocks((prev) => {
            const updatedStocks = [...prev];
            let updateCount = 0;
            const currentTime = new Date();
            const timeString = currentTime.toLocaleTimeString("ko-KR", {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            allData.forEach((quote, index) => {
              console.log(`📈 처리 중인 데이터 [${index}]:`, quote);
              
              // symbol 필드 확인
              if (!quote.symbol) {
                console.warn("⚠️ symbol 필드가 없는 데이터:", quote);
                return;
              }

              const idx = updatedStocks.findIndex((s) => s.name === quote.symbol);

              // 가격 필드 - 서버 데이터 구조에 맞게 수정
              const price = parseFloat(quote.price);
              
              // 가격이 유효한지 확인
              if (isNaN(price)) {
                console.warn("❌ 유효하지 않은 가격 데이터:", quote);
                return;
              }

              // 서버에서 받은 히스토리 데이터 변환 (처음 로드시)
              const historyData = quote.history ? quote.history.map(h => ({
                time: h.time.toString(),
                price: h.price
              })) : [];

              if (idx !== -1) {
                // 기존 종목 업데이트
                const existingData = updatedStocks[idx].data;
                const newDataPoint = { time: timeString, price };
                
                // 기존 데이터가 있으면 추가, 없으면 히스토리 사용
                const updatedData = existingData.length > 0 
                  ? [...existingData, newDataPoint].slice(-50)
                  : historyData.length > 0 
                    ? [...historyData, newDataPoint].slice(-50)
                    : [newDataPoint];

                updatedStocks[idx] = {
                  ...updatedStocks[idx],
                  data: updatedData,
                  isStock: quote.isStock,
                  lastUpdate: timeString,
                  // 추가 정보 저장
                  currentPrice: price,
                  change: parseFloat(quote.change) || 0,
                  changePercent: parseFloat(quote.changePercent) || 0
                };
                
                updateCount++;
                console.log(`✅ ${quote.symbol} 업데이트 완료 - 가격: ${price}, 데이터 포인트: ${updatedData.length}개`);
              } else {
                // 새로운 종목 동적 추가
                console.log(`➕ 새 종목 추가: ${quote.symbol} (${quote.isStock ? '주식' : '코인'})`);
                
                // 히스토리가 있으면 사용하고, 없으면 현재 데이터만
                const initialData = historyData.length > 0 
                  ? historyData 
                  : [{ time: timeString, price }];

                updatedStocks.push({
                  name: quote.symbol,
                  data: initialData,
                  isStock: quote.isStock,
                  lastUpdate: timeString,
                  currentPrice: price,
                  change: parseFloat(quote.change) || 0,
                  changePercent: parseFloat(quote.changePercent) || 0
                });
                updateCount++;
              }
            });

            console.log(`🎯 총 ${updateCount}개 종목 업데이트됨, 전체: ${updatedStocks.length}개`);
            
            // 항상 상태 업데이트 (히스토리 데이터 로드를 위해)
            return updatedStocks;
          });
        } else {
          console.warn("⚠️ 알 수 없는 메시지 형태:", message);
        }
      } catch (error) {
        console.error("❌ 데이터 파싱 에러:", error);
        console.error("원본 데이터:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket 에러:", error);
      setConnectionStatus("연결 오류");
    };

    ws.onclose = (event) => {
      console.log("❌ WebSocket 연결 종료됨", event.code, event.reason);
      setConnectionStatus("연결 끊김");
      
      // 자동 재연결 시도 (5초 후)
      setTimeout(() => {
        console.log("WebSocket 재연결 시도...");
        setConnectionStatus("재연결 중...");
        // 컴포넌트가 아직 마운트되어 있다면 재연결
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, []);

  // 👉 코인과 주식을 분리 - 검색어가 비어있으면 모든 종목 표시
  const coinStocks = stocks.filter((stock) => 
    !stock.isStock && 
    stock.data.length > 0 && 
    (searchTerm === "" || stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const stockStocks = stocks.filter((stock) => 
    stock.isStock && 
    stock.data.length > 0 && 
    (searchTerm === "" || stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex">
      {/* ✅ Sidebar */}
      <Sidebar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stockList={stocks}
        onSelectStock={handleSelectStock}
      />

      {/* ✅ 차트 영역 */}
      <div className="flex-1 p-4">
        {/* 연결 상태 표시 */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📈 실시간 주식/코인 차트</h1>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-sm ${
              connectionStatus === "연결됨" ? "bg-green-100 text-green-800" :
              connectionStatus === "연결 중..." || connectionStatus === "재연결 중..." ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {connectionStatus}
            </span>
            <button 
              onClick={requestLatestData}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              새로고침
            </button>
          </div>
        </div>

        {/* ✅ 코인 차트 */}
        <h2 className="text-lg font-semibold mb-2">🪙 코인 차트 ({coinStocks.length}개)</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {coinStocks.map((stock, idx) => (
            <div
              key={stock.name}
              className="border p-2 rounded shadow bg-white flex flex-col items-center"
            >
              <h3 className="text-sm font-semibold mb-1">{stock.name}</h3>
              {stock.data.length > 0 ? (
                <LineChart width={300} height={150} data={stock.data}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={["dataMin - 1", "dataMax + 1"]} 
                    tick={{ fontSize: 10 }}
                    width={60}
                  />
                  <CartesianGrid stroke="#ccc" />
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString(), '가격']}
                    labelFormatter={(label) => `시간: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    dot={false}
                    strokeWidth={2}
                    connectNulls
                  />
                </LineChart>
              ) : (
                <div className="w-[300px] h-[150px] flex items-center justify-center text-gray-500">
                  데이터 로딩 중...
                </div>
              )}
              <div className="mt-1 text-xs text-gray-700">
                <span className="font-semibold">현재가:</span>{" "}
                {stock.data.length ? stock.data[stock.data.length - 1].price.toLocaleString() : "-"}
                <span className="ml-2 text-gray-500">
                  ({stock.data.length}개 포인트)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ 주식 차트 */}
        <h2 className="text-lg font-semibold mb-2">📈 주식 차트 ({stockStocks.length}개)</h2>
        <div className="grid grid-cols-2 gap-4">
          {stockStocks.map((stock, idx) => (
            <div
              key={stock.name}
              className="border p-2 rounded shadow bg-white flex flex-col items-center"
            >
              <h3 className="text-sm font-semibold mb-1">{stock.name}</h3>
              {stock.data.length > 0 ? (
                <LineChart width={300} height={150} data={stock.data}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={["dataMin - 0.5", "dataMax + 0.5"]} 
                    tick={{ fontSize: 10 }}
                    width={60}
                  />
                  <CartesianGrid stroke="#ccc" />
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString(), '가격']}
                    labelFormatter={(label) => `시간: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#82ca9d"
                    dot={false}
                    strokeWidth={2}
                    connectNulls
                  />
                </LineChart>
              ) : (
                <div className="w-[300px] h-[150px] flex items-center justify-center text-gray-500">
                  데이터 로딩 중...
                </div>
              )}
              <div className="mt-1 text-xs text-gray-700 space-y-1">
                <div>
                  <span className="font-semibold">현재가:</span>{" "}
                  {stock.currentPrice ? stock.currentPrice.toLocaleString() : 
                   stock.data.length ? stock.data[stock.data.length - 1].price.toLocaleString() : "-"}
                  <span className="ml-2 text-gray-500">
                    ({stock.data.length}개 포인트)
                  </span>
                </div>
                {stock.isStock && stock.change !== undefined && (
                  <div className="flex gap-2 text-xs">
                    <span className={`${stock.change >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </span>
                    <span className={`${stock.changePercent >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
