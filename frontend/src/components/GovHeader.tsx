import { 
  ShieldCheck, 
  Clock, 
  Globe, 
  UserCheck, 
  LayoutDashboard, 
  ScanLine, 
  KeyRound,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import type { User } from '../types';
import { type Language, translations } from '../i18n/translations';

interface Props {
  activePortal: 'admin' | 'user';
  onPortalChange: (portal: 'admin' | 'user') => void;
  currentUser: User | null;
  onRoleSwitch: (role: string) => void;
  onSignOut: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export function GovHeader({
  activePortal,
  onPortalChange,
  currentUser,
  onRoleSwitch,
  onSignOut,
  lang,
  onLanguageChange
}: Props) {
  const t = translations[lang];
  
  const currentDate = new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="bg-[#0F2942] text-white border-b-4 border-amber-600 shadow-md">
      {/* Top Utility Bar */}
      <div className="bg-[#0A1D30] text-slate-300 text-[11px] py-1 border-b border-slate-800">
        <div className="gov-container flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-slate-200">{t.govIndia}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">{t.deptLegalMetrology}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Quick Demo Role Switcher for Judges */}
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[10px]">
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400 font-semibold">Demo Role:</span>
              <select
                value={currentUser?.role || 'admin'}
                onChange={(e) => onRoleSwitch(e.target.value)}
                className="bg-slate-900 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-slate-600 outline-none text-[10px] cursor-pointer"
              >
                <option value="admin">Chief Admin (Full Control)</option>
                <option value="inspector">Field Inspector</option>
                <option value="reviewer">Senior Reviewer</option>
                <option value="operator">Terminal Operator</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-amber-400 mr-1" />
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  lang === 'en'
                    ? 'bg-amber-500 text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <span className="text-slate-600">/</span>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  lang === 'hi'
                    ? 'bg-amber-500 text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Return to Gateway / Sign Out */}
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white px-2 py-0.5 rounded border border-rose-800 text-[10px] font-bold transition-colors"
              title="Sign out to Main Gateway"
            >
              <LogOut className="w-3 h-3" />
              <span>{lang === 'hi' ? 'गेटवे पर लौटें' : 'Sign Out / Gateway'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="gov-container py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & National/Gov Authority Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {t.portalSubtitle}
                </span>
                <span className="text-[11px] text-slate-300 hidden sm:inline">PS #26034</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {t.portalTitle}
              </h1>
            </div>
          </div>

          {/* Active Officer Status & Portal Indicator */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden lg:flex items-center space-x-2 text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-md border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.inspectionDate}: <b>{currentDate}</b></span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800/90 text-slate-200 px-3 py-1.5 rounded-md border border-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <div className="text-left">
                <p className="font-bold text-[11px] leading-tight text-white">{currentUser?.name || 'Authorized Officer'}</p>
                <p className="text-[9px] text-amber-300 font-semibold uppercase">
                  {currentUser?.role || 'inspector'} • {currentUser?.badge_number || 'GOV-8821'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Portal Switcher Tabs Bar */}
      <div className="bg-[#0b2136] border-t border-slate-800/80 px-4">
        <div className="gov-container flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1 text-slate-400 hover:text-white px-2 py-1.5 rounded text-xs transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'गेटवे' : 'Gateway'}</span>
            </button>
            <span className="text-slate-600">|</span>

            <nav className="flex space-x-1 py-1">
              <button
                onClick={() => onPortalChange('user')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-bold transition-all ${
                  activePortal === 'user'
                    ? 'bg-white text-slate-900 shadow-sm border-t-2 border-emerald-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ScanLine className="w-4 h-4 text-emerald-600" />
                <span>{t.inspectorPortalTab} (Screening & OCR)</span>
              </button>

              <button
                onClick={() => {
                  if (currentUser?.role !== 'admin') {
                    onRoleSwitch('admin');
                  }
                  onPortalChange('admin');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-bold transition-all ${
                  activePortal === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm border-t-2 border-amber-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                <span>{t.adminPortalTab} (Executive Command)</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                  ADMIN
                </span>
              </button>
            </nav>
          </div>

          <div className="hidden sm:flex items-center text-[11px] text-slate-400 space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {activePortal === 'admin' 
                ? 'Admin Control Center • Full Clearance' 
                : 'Inspector Terminal • Ready for Scanning'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
