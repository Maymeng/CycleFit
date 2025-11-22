import React from 'react';
import { LayoutDashboard, BarChart2, Settings, PlusCircle } from 'lucide-react';

interface NavigationProps {
  activeTab: 'dashboard' | 'insights' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'insights' | 'settings') => void;
  onAdd: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, onAdd }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto w-full bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe pt-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex justify-around items-center h-16 px-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-2 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-black scale-105' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Today</span>
        </button>

        <div className="relative -top-6">
          <button 
            onClick={onAdd}
            className="bg-black text-white p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-gray-50"
          >
            <PlusCircle size={28} />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center p-2 transition-all duration-300 ${activeTab === 'insights' ? 'text-black scale-105' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <BarChart2 size={24} strokeWidth={activeTab === 'insights' ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Insights</span>
        </button>
      </div>
    </nav>
  );
};