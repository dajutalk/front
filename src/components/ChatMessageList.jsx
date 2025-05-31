import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

function ChatMessageList({ messages }) {
  // 메시지가 없을 때 처리
  if (!messages || messages.length === 0) {
    return (
      <div className="bg-white mt-4 rounded p-6 text-center text-gray-500">
        아직 메시지가 없습니다. 첫 번째 메시지를 남겨보세요!
      </div>
    );
  }

  return (
    <div className="bg-white mt-4 rounded">
      {messages.map((msg, idx) => (
        <div key={idx} className="border-b p-3 text-sm">
          <p className="text-green-600 font-medium mb-1">🌿 글린봇으로 착한 게시글만 모아보세요!</p>

          <p className="text-black text-base font-semibold">{msg.content}</p>

          <div className="flex items-center text-xs text-gray-500 mt-1 justify-between">
            <div className="flex gap-2 items-center">
              <span>{msg.username || msg.nickname}****</span>
              <span>• {msg.time || '방금'} 전</span>
              <span>• 조회수 {msg.views || Math.floor(Math.random() * 50) + 10}</span>
            </div>

            <div className="flex gap-3 items-center text-gray-600">
              <div className="flex items-center gap-1">
                <ThumbsUp size={14} />
                <span>{msg.likes || Math.floor(Math.random() * 10)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown size={14} />
                <span>{msg.dislikes || Math.floor(Math.random() * 3)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>{msg.comments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatMessageList;
