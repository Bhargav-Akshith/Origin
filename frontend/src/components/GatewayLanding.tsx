import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ScanLine, 
  LayoutDashboard, 
  ArrowRight, 
  Lock, 
  Mail, 
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import type { Language } from '../i18n/translations';

interface GatewayLandingProps {
  onLoginSubmit: (email: string, pass: string, portal: 'user' | 'admin') => Promise<void>;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isLoading: boolean;
}

export const GatewayLanding: React.FC<GatewayLandingProps> = ({
  onLoginSubmit,
  lang,
  onLanguageChange,
  isLoading
}) => {
  // Inspector Login State
  const [inspectorEmail, setInspectorEmail] = useState('inspector.sharma@consumer.gov.in');
  const [inspectorPassword, setInspectorPassword] = useState('inspector123');
  const [showInspectorPassword, setShowInspectorPassword] = useState(false);
  const [inspectorError, setInspectorError] = useState<string | null>(null);

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('admin@consumer.gov.in');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleInspectorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setInspectorError(null);
    try {
      await onLoginSubmit(inspectorEmail, inspectorPassword, 'user');
    } catch (err: any) {
      setInspectorError(err.message || 'Authentication failed. Please verify Inspector email & password.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    try {
      await onLoginSubmit(adminEmail, adminPassword, 'admin');
    } catch (err: any) {
      setAdminError(err.message || 'Authentication failed. Please verify Admin email & password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] bg-gradient-to-b from-[#0A1929] via-[#0F2942] to-[#07131F] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* Top Gov Ribbon */}
      <div className="bg-[#050D16] border-b border-slate-800 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-200">
              {lang === 'hi' ? 'भारत सरकार • उपभोक्ता मामले मंत्रालय' : 'GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">
              {lang === 'hi' ? 'विधिक मापविज्ञान विभाग' : 'DEPARTMENT OF LEGAL METROLOGY'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              NLMES National Gateway Active
            </span>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-amber-400 mr-1" />
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  lang === 'hi'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Branding & Header */}
      <div className="pt-8 pb-6 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Smart India Hackathon 2026 • Problem Statement ID #26034</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          {lang === 'hi'
            ? 'विधिक मापविज्ञान (पैक की गई वस्तुएं) प्रवर्तन पोर्टल'
            : 'Legal Metrology Packaged Commodities Verification & Enforcement OS'}
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {lang === 'hi'
            ? 'सुरक्षित आधिकारिक लॉगिन: नीचे अपने अधिकृत क्रेडेंशियल्स (ईमेल और पासवर्ड) दर्ज करके फील्ड निरीक्षण या केंद्रीय प्रशासनिक नियंत्रण केंद्र में प्रवेश करें।'
            : 'Authorized Government Officer Authentication: Enter your official email and password below to access the Field Inspection Screening Terminal or Central Admin Command.'}
        </p>
      </div>

      {/* Main Two Password Gateways Section */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* ========================================================================= */}
        {/* GATEWAY 1: INSPECTOR & FIELD OFFICER PORTAL */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/95 rounded-2xl border-2 border-emerald-500/40 p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <ScanLine className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                {lang === 'hi' ? 'पोर्टल 2 • निरीक्षक टर्मिनल' : 'PORTAL 2 • FIELD INSPECTION'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-1.5">
              {lang === 'hi' ? 'फील्ड निरीक्षक लॉगिन' : 'Field Inspector Authentication'}
            </h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {lang === 'hi'
                ? 'पैकेजिंग फोटो अपलोड, 7 वैधानिक घोषणाओं की जांच, इकाई मूल्य एवं डिजिटल रिपोर्ट निर्माण।'
                : 'Universal multi-angle package capture (>2 photos), OCR evidence localization, and signed inspection reports.'}
            </p>

            {/* Quick Profile Chips */}
            <div className="mb-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Quick Select Officer Account:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setInspectorEmail('inspector.sharma@consumer.gov.in');
                    setInspectorPassword('inspector123');
                    setInspectorError(null);
                  }}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors font-medium ${
                    inspectorEmail.includes('sharma')
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Insp. Sharma (Delhi)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInspectorEmail('inspector.patel@consumer.gov.in');
                    setInspectorPassword('inspector123');
                    setInspectorError(null);
                  }}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors font-medium ${
                    inspectorEmail.includes('patel')
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Insp. Patel (Mumbai)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInspectorEmail('inspector.singh@consumer.gov.in');
                    setInspectorPassword('inspector123');
                    setInspectorError(null);
                  }}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors font-medium ${
                    inspectorEmail.includes('singh')
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Insp. Singh (Bengaluru)
                </button>
              </div>
            </div>

            {/* Inspector Login Form */}
            <form onSubmit={handleInspectorLogin} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
              {inspectorError && (
                <div className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-lg border border-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{inspectorError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Official Email / Officer ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={inspectorEmail}
                    onChange={(e) => setInspectorEmail(e.target.value)}
                    placeholder="inspector.sharma@consumer.gov.in"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Officer Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showInspectorPassword ? 'text' : 'password'}
                    required
                    value={inspectorPassword}
                    onChange={(e) => setInspectorPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowInspectorPassword(!showInspectorPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showInspectorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'पासवर्ड सत्यापित करें एवं प्रवेश करें' : 'Verify Password & Enter Field Terminal'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Security: Section 32 LMPC Enforced</span>
            <span className="font-mono text-emerald-400">PWD: inspector123</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GATEWAY 2: ADMIN CONTROL CENTER */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/95 rounded-2xl border-2 border-amber-500/40 p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600"></div>

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                {lang === 'hi' ? 'पोर्टल 1 • केंद्रीय प्रशासनिक नियंत्रण' : 'PORTAL 1 • EXECUTIVE COMMAND'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-1.5">
              {lang === 'hi' ? 'केंद्रीय व्यवस्थापक (Admin) लॉगिन' : 'Central Administrator Authentication'}
            </h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {lang === 'hi'
                ? 'राष्ट्रीय प्रवर्तन आँकड़े, नियम CRUD इंजन, अधिकारी प्रबंधन, एआई टेलीमेट्री एवं नोटिस अधिनिर्णय।'
                : 'National compliance macro analytics, dynamic rules CRUD engine, officer management, and legal notices.'}
            </p>

            {/* Quick Profile Chips */}
            <div className="mb-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Quick Select Admin Profile:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin@consumer.gov.in');
                    setAdminPassword('admin123');
                    setAdminError(null);
                  }}
                  className="text-[10px] px-2.5 py-1 rounded border bg-amber-600 text-slate-950 border-amber-400 font-bold transition-colors"
                >
                  Chief Controller of Legal Metrology (HQ)
                </button>
              </div>
            </div>

            {/* Admin Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-amber-500/30">
              {adminError && (
                <div className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-lg border border-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Central Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@consumer.gov.in"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Admin Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Verifying Clearance...</span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'एडमिन पासवर्ड सत्यापित करें एवं प्रवेश करें' : 'Verify Password & Enter Admin Command'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Executive Clearance: Level 1</span>
            <span className="font-mono text-amber-400">PWD: admin123</span>
          </div>
        </div>

      </div>

    </div>
  );
};
