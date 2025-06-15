import { useEffect, useState } from 'react';

const API_WS = process.env.REACT_APP_API_WS;

export function useStockWebSocket(stockCode) {
  const [stockData, setStockData] = useState(null);         // 최신 주가 1개
  const [priceHistory, setPriceHistory] = useState([]);     // 차트 데이터용

  useEffect(() => {
    const ws = new WebSocket(`ws://${API_WS}/ws/stocks?code=${stockCode}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "init") {
        // 초기 30개 데이터 수신
        setPriceHistory(message.data);
      } else if (message.type === "update") {
        const newPoint = message.data;
        setStockData(newPoint);
        setPriceHistory((prev) => [...prev.slice(-29), newPoint]);
      }
    };

    return () => ws.close();
  }, [stockCode]);

  return { stockData, priceHistory };
}
