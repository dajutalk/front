import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';

const ChatSection = ({ messages, sendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white">
      {/* 채팅 메시지 */}
      <div className="max-h-96 overflow-y-auto p-4">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={`mb-4 p-3 border-b ${message.isSystem ? 'bg-gray-50' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-medium ${
                  message.isSystem 
                    ? 'text-gray-600' 
                    : message.username === '나' 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                }`}>
                  {message.username || '익명'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                {message.isPending && (
                  <span className="text-xs text-orange-500">전송 중...</span>
                )}
              </div>
              <p className={`text-gray-800 ${message.isSystem ? 'italic text-sm' : ''}`}>
                {message.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            채팅방이 로딩 중입니다...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 채팅 입력 */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;