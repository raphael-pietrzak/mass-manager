import React from 'react';
import { tabs } from './tabs';

interface TabsNavigationProps {
  activeTab: string;
  setActiveTab: (tabKey: string) => void;
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <div key={tab.key} className="flex items-center">
            <button
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default TabsNavigation;