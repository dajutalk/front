import React from 'react';
import { MessageCircle } from 'lucide-react';

const ChatMessage = ({ message }) => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-600">🌿</span>
        <span className="text-sm text-green-600">글린봇으로 작한 게시글만 모아보세요!</span>
        <button className="ml-auto text-sm text-gray-400">설정</button>
      </div>
      
      <h4 className="font-medium mb-2">{message.content}</h4>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <span>{message.username}</span>
        <span>•</span>
        <span>{message.time}</span>
        <span>•</span>
        <span>조회수 {Math.floor(Math.random() * 20) + 5}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1 text-sm text-gray-500">
          <span>👍</span>
          <span>{message.likes}</span>
        </button>
        <button className="flex items-center gap-1 text-sm text-gray-500">
          <span>👎</span>
          <span>{message.dislikes}</span>
        </button>
        <button className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
          <MessageCircle size={14} />
          <span>0</span>
        </button>
      </div>
    </div>
  );
};

export default ChatMessage;