import React from 'react';
import { TrendingUp, TrendingDown, MessageCircle, Bell, Star } from 'lucide-react';

const StockHeader = ({ stockData, isConnected }) => {
  return (
    <div className="p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500">{stockData.symbol} 코스피</div>
          <h1 className="text-xl font-bold">{stockData.name}</h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-gray-100">
            <MessageCircle size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-full bg-gray-100">
            <Bell size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-full bg-gray-100">
            <Star size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            {stockData.currentPrice.toLocaleString()}
          </span>
          <span className="text-sm">원</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className={`flex items-center gap-1 ${stockData.change < 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {stockData.change < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
            <span className="font-medium">
              {Math.abs(stockData.change).toLocaleString()} {stockData.changePercent}%
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {stockData.lastUpdate} • 실시간
            {isConnected && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block"></span>}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="font-bold">{stockData.volume.toLocaleString()}</span>
        <div className={`flex items-center gap-1 ${stockData.volumeChange < 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {stockData.volumeChange < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          <span>{Math.abs(stockData.volumeChange).toLocaleString()} {stockData.volumeChangePercent}%</span>
        </div>
        <span className="text-gray-500">NXT 05.30 10:07</span>
      </div>
    </div>
  );
};

export default StockHeader;