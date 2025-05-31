import { useEffect, useState } from 'react';

export function useChatWebSocket(stockCode) {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/chat?code=${stockCode}`);
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
