import React from 'react';
import { ShieldCheck, Globe, LogOut } from 'lucide-react';
import type { User as UserType, UiMode } from '../../types';
import { ModeSwitcher } from '../common/ModeSwitcher';

interface MobileHeaderProps {
  currentUser: UserType | null;
  uiMode: UiMode;
  onModeChange: (mode: UiMode) => void;
  lang: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  onSignOut: () => void;
  onRequestAdminClearance?: () => void;
  isSimulatedDevice?: boolean;
  onToggleSimulatedDevice?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  uiMode,
  onModeChange,
  lang,
  onLanguageChange,
  onSignOut,
  isSimulatedDevice,
  onToggleSimulatedDevice
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#0F2942] text-white shadow-md border-b-2 border-amber-500 select-none">
      {/* Top Banner with Gov text & Mode Switcher */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-slate-800 bg-[#0A1D30]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">
              NLMES LMPC
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              PS #26034 • v2.0
            </div>
          </div>
        </div>

        {/* Global Prominent Mode Switcher */}
        <ModeSwitcher
          mode={uiMode}
          onModeChange={onModeChange}
          isSimulatedDevice={isSimulatedDevice}
          onToggleSimulatedDevice={onToggleSimulatedDevice}
          compact
        />
      </div>

      {/* Officer Bar & Actions */}
      <div className="px-3 py-1.5 flex items-center justify-between text-xs bg-[#0F2942]">
        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
          <span className="font-bold text-[11px] text-slate-200 truncate max-w-[120px]">
            {currentUser?.name || 'Field Inspector'}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-slate-800 text-amber-300 border border-slate-700">
            {isAdmin ? 'ADMIN' : 'INSPECTOR'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={() => onLanguageChange(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-amber-300 hover:text-white"
          >
            <Globe className="w-3 h-3" />
            <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={onSignOut}
            className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800"
            title="Sign Out to Gateway"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
