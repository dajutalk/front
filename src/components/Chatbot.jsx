import { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    const data = await response.json();
    const botMessage = { role: "assistant", content: data.reply };
    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button onClick={() => setOpen(true)} className="bg-blue-500 text-white rounded-full p-3 shadow-lg">
          💬
        </button>
      )}
      {open && (
        <div className="bg-white border rounded-lg w-80 h-96 flex flex-col shadow-xl">
          <div className="p-3 bg-blue-100 flex justify-between items-center">
            <span className="font-bold">자비스 (Beta)</span>
            <button onClick={() => setOpen(false)}>❌</button>
          </div>

          <div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-2 border-b border-yellow-300">
            ※ 자비스가 하는 말은 정확하지 않습니다. 참고만 하시길 바랍니다.
          </div>

          <div className="flex-1 overflow-auto p-2">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 text-sm ${msg.role === "user" ? "text-right" : "text-left text-blue-700"}`}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex">
            <input
              className="flex-1 border rounded p-1 mr-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="질문을 입력하세요"
            />
            <button onClick={handleSend} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
              보내기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
