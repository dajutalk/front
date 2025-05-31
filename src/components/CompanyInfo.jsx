import React from 'react';

const CompanyInfo = ({ stockData }) => {
  return (
    <div className="p-4 bg-white border-b">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">두산</span>
        </div>
        <div>
          <h3 className="font-bold">{stockData.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>4.8점평</span>
            <span className="text-red-500">답급 전</span>
          </div>
        </div>
        <button className="ml-auto p-2">
          <span className="text-gray-400">^</span>
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        10만두별 오늘 전력주도 빽느거보니까<br />
        배부른 달팽이 두봡이는 아미 사고 싶어하는 주체가 많아서 골인. 찐진종을둣<br />
        받는는 껄거우 십견은 더 많아야지
      </p>

      <button className="w-full bg-green-500 text-white py-3 rounded-lg font-medium">
        주주인증하고 실시간으로 소통하기
      </button>
    </div>
  );
};

export default CompanyInfo;