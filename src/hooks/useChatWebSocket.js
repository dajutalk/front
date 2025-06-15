import { useEffect, useState } from 'react';

const API_WS = process.env.REACT_APP_API_WS;

export function useChatWebSocket(stockCode) {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(`wss://${API_WS}/ws/chat?code=${stockCode}`);
    setWs(socket);

    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);

      setMessages((prev) => [
        ...prev.slice(-99), // ✅ 최근 99개만 남기고
        newMessage,         // 새 메시지 추가 → 총 100개 유지
      ]);
    };

    return () => {
      socket.close();
    };
  }, [stockCode]);

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return { messages, sendMessage };
}
