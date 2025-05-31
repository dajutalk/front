// src/components/ChatInput.jsx

import React, { useState } from 'react';

function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    onSend(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center border-t p-2 mt-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="의견을 남겨보세요..."
        className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none"
      />
      <button
        type="submit"
        className="ml-2 px-3 py-2 bg-blue-500 text-white text-sm rounded"
      >
        등록
      </button>
    </form>
  );
}

export default ChatInput;
