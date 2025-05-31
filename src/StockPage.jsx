import React from 'react';
import NotificationBanner from './components/NotificationBanner';
import StockHeaderPanel from './components/StockHeaderPanel';
import StockChartPanel from './components/StockChartPanel';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';

const dummyStockData = {
  name: "두산에너빌리티",
  c: 150.75,
  d: 2.25,
  dp: 1.52,
  h: 152.3,
  l: 149.1,
  o: 149.5,
  pc: 148.5,
};

const dummyPriceHistory = [
  { time: "10:00", price: 149.5 },
  { time: "10:01", price: 150.1 },
  { time: "10:02", price: 150.3 },
  { time: "10:03", price: 150.7 },
  { time: "10:04", price: 150.75 },
];

const dummyMessages = [
  { nickname: "재열", content: "오늘 두산에너빌리티 잘 가네!" },
  { nickname: "소영", content: "차트 상 저항선 돌파한 듯?" },
  { nickname: "홍길동", content: "150원 넘으면 진입할게요" },
];

const StockPage = () => {
  const stockData = dummyStockData;
  const priceHistory = dummyPriceHistory;
  const messages = dummyMessages;
  const sendMessage = (msg) => console.log('보낸 메시지:', msg);

  return (
    <div className="max-w-screen-xl mx-auto min-h-screen p-6 bg-white">
      <NotificationBanner />

      {/* 위쪽: 정보 + 그래프 */}
      <div className="flex gap-6 mb-6">
        {/* 왼쪽: 주가 정보 */}
        <div className="w-1/2">
          <StockHeaderPanel stockData={stockData} />
        </div>

        {/* 오른쪽: 그래프 */}
        <div className="w-1/2">
          <StockChartPanel priceHistory={priceHistory} />
        </div>
      </div>

      {/* 아래쪽: 채팅 전체 */}
      <div className="w-full">
        <ChatMessageList messages={messages} />
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
};

export default StockPage;


/*
✅ 실시간 WebSocket 전환 시 아래 코드로 교체

import { useStockWebSocket } from './hooks/useWebSocket';
import { useChatWebSocket } from './hooks/useChatWebSocket';
import NotificationBanner from './components/NotificationBanner';
import StockHeaderPanel from './components/StockHeaderPanel';
import StockChartPanel from './components/StockChartPanel';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';

const StockPage = () => {
  const stockCode = '034020';
  const { stockData, priceHistory } = useStockWebSocket(stockCode);
  const { messages, sendMessage } = useChatWebSocket(stockCode);

  return (
    <div className="max-w-screen-xl mx-auto min-h-screen p-6 bg-white">
      <NotificationBanner />

      <div className="flex gap-6 mb-6">
        <div className="w-1/2">
          <StockHeaderPanel stockData={stockData} />
        </div>

        <div className="w-1/2">
          <StockChartPanel priceHistory={priceHistory} />
        </div>
      </div>

      <div className="w-full">
        <ChatMessageList messages={messages} />
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
};

export default StockPage;
*/