import React from 'react';
import { Monitor, Smartphone, SmartphoneNfc, Maximize2 } from 'lucide-react';
import type { UiMode } from '../../types';

interface ModeSwitcherProps {
  mode: UiMode;
  onModeChange: (mode: UiMode) => void;
  isSimulatedDevice?: boolean;
  onToggleSimulatedDevice?: () => void;
  className?: string;
  compact?: boolean;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  mode,
  onModeChange,
  isSimulatedDevice = false,
  onToggleSimulatedDevice,
  className = '',
  compact = false
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Primary Mode Switcher Toggle */}
      <div 
        role="group"
        aria-label="UI Mode Selection"
        className="relative inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700 shadow-inner backdrop-blur-sm select-none"
      >
        {/* Desktop Web Mode Button */}
        <button
          type="button"
          onClick={() => onModeChange('web')}
          aria-pressed={mode === 'web'}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            mode === 'web'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Switch to Web Mode (Desktop & Tablet multi-column layout)"
        >
          <Monitor className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${mode === 'web' ? 'text-cyan-300' : 'text-slate-400'}`} />
          <span>{compact ? 'WEB' : '🖥 WEB MODE'}</span>
        </button>

        {/* Mobile Mode Button */}
        <button
          type="button"
          onClick={() => onModeChange('mobile')}
          aria-pressed={mode === 'mobile'}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            mode === 'mobile'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Switch to Mobile Mode (Touch-friendly card & step-by-step layout)"
        >
          <Smartphone className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${mode === 'mobile' ? 'text-emerald-200' : 'text-slate-400'}`} />
          <span>{compact ? 'MOBILE' : '📱 MOBILE MODE'}</span>
        </button>
      </div>

      {/* Simulator Device Bezel Toggle (Visible when in Mobile Mode on larger screens) */}
      {mode === 'mobile' && onToggleSimulatedDevice && (
        <button
          type="button"
          onClick={onToggleSimulatedDevice}
          className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
            isSimulatedDevice
              ? 'bg-indigo-950 text-indigo-300 border-indigo-700 shadow-sm'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-750'
          }`}
          title={isSimulatedDevice ? 'Switch to Fluid Full-Width Mobile View' : 'Preview in Realistic Mobile Device Frame'}
        >
          {isSimulatedDevice ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fluid Width</span>
            </>
          ) : (
            <>
              <SmartphoneNfc className="w-3.5 h-3.5 text-slate-300" />
              <span>Device Frame</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
