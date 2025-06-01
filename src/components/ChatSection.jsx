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
      <div className="max-h-96 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={`${
              message.isSystem 
                ? 'flex justify-center' 
                : message.isOwn 
                  ? 'flex justify-end' 
                  : 'flex justify-start'
            }`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isSystem
                  ? 'bg-gray-100 text-gray-600 text-sm italic px-3 py-1'
                  : message.isOwn
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
              } ${message.isError ? 'bg-red-100 border border-red-300' : ''}`}>
                
                {!message.isSystem && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      message.isOwn ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {message.isOwn ? '나' : message.username || '익명'}
                    </span>
                    <span className={`text-xs ${
                      message.isOwn ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                
                <p className={`${message.isSystem ? 'text-center' : ''}`}>
                  {message.content}
                </p>
                
                {message.isError && (
                  <div className="text-xs text-red-600 mt-1">
                    ⚠️ 전송 실패
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <div className="animate-pulse">💬</div>
              <p className="text-sm mt-2">채팅방 연결 중...</p>
            </div>
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
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="메시지를 입력하세요... (Enter로 전송)"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1"
          >
            <Send size={16} />
            <span className="hidden sm:inline">전송</span>
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {newMessage.length}/500 • 실시간 채팅이 활성화되었습니다
        </div>
      </div>
    </div>
  );
};

export default ChatSection;