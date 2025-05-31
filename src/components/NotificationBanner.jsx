import React from 'react';

const NotificationBanner = () => {
  return (
    <div className="bg-green-50 border border-green-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-green-600">📱</span>
        <span className="text-sm text-green-800">[새로워진 종목분석] 역대 레전드 글 다시 보기!</span>
      </div>
      <button className="text-green-600">
        <span className="text-lg">›</span>
      </button>
    </div>
  );
};

export default NotificationBanner;