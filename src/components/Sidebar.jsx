import React from "react";
import { FiSearch } from "react-icons/fi"; // 돋보기 아이콘

export default function Sidebar({
  searchTerm = "",
  setSearchTerm = () => {},
  stockList = [],
  onSelectStock = () => {},
}) {
  return (
    <div className="w-64 p-4 bg-gray-100 h-screen sticky top-0">
      <div className="relative mb-4">
        <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="종목 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border pl-8 p-2 rounded"
        />
      </div>

      <ul>
        {stockList.length > 0 ? (
          stockList
            .filter((stock) => stock.name.includes(searchTerm))
            .map((stock) => (
              <li
                key={stock.name}
                onClick={() => onSelectStock(stock.name)}
                className="cursor-pointer hover:bg-gray-200 p-1 rounded"
              >
                {stock.name}
              </li>
            ))
        ) : (
          <li className="text-gray-500">종목이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
