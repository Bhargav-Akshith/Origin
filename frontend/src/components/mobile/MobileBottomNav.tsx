import React from 'react';
import { 
  Home, 
  Camera, 
  History, 
  Scale, 
  FileText, 
  User
} from 'lucide-react';
import type { InspectionTab } from '../../types';

interface MobileBottomNavProps {
  activeTab: InspectionTab;
  onTabChange: (tab: InspectionTab) => void;
  reviewCount?: number;
  totalSubmissions?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  reviewCount = 0,
  totalSubmissions = 0
}) => {
  const tabs: { id: InspectionTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'inspect',
      label: 'Inspect',
      icon: <Camera className="w-5 h-5" />
    },
    {
      id: 'submissions',
      label: 'History',
      icon: <History className="w-5 h-5" />,
      badge: totalSubmissions > 0 ? totalSubmissions : undefined
    },
    {
      id: 'reviews',
      label: 'Review',
      icon: <Scale className="w-5 h-5" />,
      badge: reviewCount > 0 ? reviewCount : undefined
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F2942] border-t border-slate-700/80 shadow-2xl safe-area-bottom select-none">
      <div className="flex items-center justify-around py-1.5 px-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-amber-400 bg-slate-800/80 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Icon with badge */}
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border border-slate-900 shadow-sm">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {tab.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
