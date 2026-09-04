import { ShieldCheck, Clock, Globe, UserCheck } from 'lucide-react';
import { type Language, translations } from '../i18n/translations';

interface Props {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export function GovHeader({ lang, onLanguageChange }: Props) {
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
          
          <div className="flex items-center space-x-4">
            {/* Interactive Language Selector */}
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
                English
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
            
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline">{t.stdCompliancePortal}</span>
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

          {/* Officer Session & Portal Status */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden lg:flex items-center space-x-2 text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-md border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.inspectionDate}: <b>{currentDate}</b></span>
            </div>

            <div className="flex items-center space-x-2 bg-emerald-950/90 text-emerald-300 px-3 py-1.5 rounded-md border border-emerald-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold tracking-wide text-[11px]">{t.portalActive}</span>
            </div>

            <div className="hidden sm:flex items-center space-x-2 bg-slate-800/90 text-slate-200 px-3 py-1.5 rounded-md border border-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <div className="text-left">
                <p className="font-bold text-[11px] leading-tight">{t.inspectorId}</p>
                <p className="text-[9px] text-slate-400">{t.enforcementWing}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
