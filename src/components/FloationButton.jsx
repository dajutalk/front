import React from 'react';

const FloatingButton = () => {
  return (
    <div className="fixed bottom-4 right-4">
      <button className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center">
        <span className="text-2xl">🔥</span>
      </button>
    </div>
  );
};

export default FloatingButton;