import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

function ChatMessageList({ messages }) {
  return (
    <div className="bg-white mt-4 rounded">
      {messages.map((msg, idx) => (
        <div key={idx} className="border-b p-3 text-sm">
          <p className="text-green-600 font-medium mb-1">🌿 글린봇으로 착한 게시글만 모아보세요!</p>

          <p className="text-black text-base font-semibold">{msg.content}</p>

          <div className="flex items-center text-xs text-gray-500 mt-1 justify-between">
            <div className="flex gap-2 items-center">
              <span>{msg.nickname}****</span>
              <span>• {msg.time} 전</span>
              <span>• 조회수 {msg.views}</span>
            </div>

            <div className="flex gap-3 items-center text-gray-600">
              <div className="flex items-center gap-1">
                <ThumbsUp size={14} />
                <span>{msg.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown size={14} />
                <span>{msg.dislikes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>{msg.comments}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatMessageList;
