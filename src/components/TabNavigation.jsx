import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab, showChart = false }) => {
  const baseTabs = ['종합', '토론', '뉴스·공시', '시세', '재무', '리서치'];
  const tabs = showChart ? ['차트', ...baseTabs] : baseTabs;

  return (
    <div className="border-b bg-white">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === tab
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;