import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ScanLine, 
  LayoutDashboard, 
  ArrowRight, 
  KeyRound, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Globe
} from 'lucide-react';
import type { Language } from '../i18n/translations';

interface GatewayLandingProps {
  onSelectPortal: (portal: 'user' | 'admin', role?: string) => Promise<void>;
  onLoginSubmit: (email: string, pass: string, portal: 'user' | 'admin') => Promise<void>;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isLoading: boolean;
}

export const GatewayLanding: React.FC<GatewayLandingProps> = ({
  onSelectPortal,
  onLoginSubmit,
  lang,
  onLanguageChange,
  isLoading
}) => {
  // Manual login modal or toggle states
  const [activeLoginForm, setActiveLoginForm] = useState<'none' | 'inspector' | 'admin'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent, portal: 'user' | 'admin') => {
    e.preventDefault();
    setLoginError(null);
    try {
      await onLoginSubmit(email, password, portal);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const openInspectorForm = () => {
    setActiveLoginForm('inspector');
    setEmail('inspector.sharma@consumer.gov.in');
    setPassword('inspector123');
    setLoginError(null);
  };

  const openAdminForm = () => {
    setActiveLoginForm('admin');
    setEmail('admin@consumer.gov.in');
    setPassword('admin123');
    setLoginError(null);
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
      <div className="pt-10 pb-8 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-5 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Smart India Hackathon 2026 • Problem Statement ID #26034</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          {lang === 'hi'
            ? 'विधिक मापविज्ञान (पैक की गई वस्तुएं) प्रवर्तन पोर्टल'
            : 'Legal Metrology Packaged Commodities Verification & Enforcement OS'}
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {lang === 'hi'
            ? 'पैक की गई वस्तुओं पर 7 अनिवार्य घोषणाओं, इकाई विक्रय मूल्य (USP), और निर्माण तिथि की स्वचालित कंप्यूटर विज़न और OCR आधारित वैधानिक जांच प्रणाली।'
            : 'Central AI & Vision Platform for automated compliance verification under Legal Metrology (Packaged Commodities) Rules, 2011. Select your authorized role gateway to proceed.'}
        </p>
      </div>

      {/* Main Two Gateways Section */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 pb-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* ========================================================================= */}
        {/* GATEWAY 1: INSPECTOR & FIELD OFFICER PORTAL */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/90 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500/70 p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm transition-all duration-300 relative group overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>

          <div>
            {/* Badge & Icon */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <ScanLine className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                {lang === 'hi' ? 'पोर्टल 2 • मुख्य उपयोगकर्ता / निरीक्षक' : 'PORTAL 2 • FIELD ENFORCEMENT'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {lang === 'hi' ? 'निरीक्षक एवं प्रवर्तन पोर्टल' : 'Inspector & Field Screening Portal'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              {lang === 'hi'
                ? 'पैकेजिंग फोटो या लाइव कैमरा द्वारा 7 अनिवार्य घोषणाओं, स्थान निर्देशांक, इकाई मूल्य (USP) और डिजिटल प्रमाणपत्र का निष्पादन।'
                : 'Universal Ingestion Terminal for physical label scanning, bounding box evidence localization, rule compliance checking, and SHA-256 signed certificates.'}
            </p>

            {/* Feature List */}
            <div className="space-y-3 mb-8 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Universal Package Ingestion:</b> High-res file upload & live WebRTC camera scanner</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>7 Statutory Declarations:</b> Rules 6(1)(a)-(n) validation with OCR bounding boxes</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Mathematical USP Validation:</b> Automated INR/g, INR/ml ratio calculations</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Tamper-Evident Report:</b> Instant downloadable signed PDF Legal Metrology certificate</span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div>
            {activeLoginForm === 'inspector' ? (
              <form onSubmit={(e) => handleManualLogin(e, 'user')} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-emerald-500/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Inspector Login
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setActiveLoginForm('none')}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {loginError && (
                  <div className="text-[11px] text-rose-400 bg-rose-950/50 p-2 rounded border border-rose-800/60">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Official Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
                >
                  {isLoading ? 'Verifying...' : 'Sign In as Inspector'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={() => onSelectPortal('user', 'inspector')}
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2.5 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/70 transform hover:-translate-y-0.5 transition-all"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'निरीक्षक साइन-इन (एक क्लिक प्रवेश)' : 'Enter Inspector Portal (Sign In)'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={openInspectorForm}
                    className="text-[11px] text-slate-400 hover:text-emerald-300 transition-colors underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    Custom Password Sign In
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">Demo: inspector.sharma@consumer.gov.in</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GATEWAY 2: ADMIN CONTROL CENTER */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/90 rounded-2xl border-2 border-amber-500/30 hover:border-amber-500/70 p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm transition-all duration-300 relative group overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>

          <div>
            {/* Badge & Icon */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                {lang === 'hi' ? 'पोर्टल 1 • केंद्रीय प्रशासनिक नियंत्रण' : 'PORTAL 1 • EXECUTIVE COMMAND'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {lang === 'hi' ? 'एडमिन कंट्रोल सेंटर' : 'Admin Control Center & Command Hub'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              {lang === 'hi'
                ? 'राष्ट्रीय प्रवर्तन आँकड़े, नियम इंजन प्रबंधन, अधिकारी पहुँच नियंत्रण, एआई विज़न टेलीमेट्री एवं कानूनी नोटिस अधिनिर्णय।'
                : 'Central Executive Command for macro compliance analytics, dynamic rules engine CRUD, case adjudication, and cryptographic audit security.'}
            </p>

            {/* Feature List */}
            <div className="space-y-3 mb-8 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><b>Executive Dashboard:</b> Macro compliance index, state distributions & live metrics</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><b>Dynamic Rules Engine:</b> Full CRUD for statutory clauses, penalty amounts & regex rules</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><b>Adjudication Center:</b> Case review, Section 39 Notice issuance & officer assignment</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><b>Cryptographic Audit Trail:</b> Immutable SHA-256 logged officer actions & AI diagnostics</span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div>
            {activeLoginForm === 'admin' ? (
              <form onSubmit={(e) => handleManualLogin(e, 'admin')} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-amber-500/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Administrator Login
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setActiveLoginForm('none')}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {loginError && (
                  <div className="text-[11px] text-rose-400 bg-rose-950/50 p-2 rounded border border-rose-800/60">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Admin Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
                >
                  {isLoading ? 'Verifying...' : 'Sign In as Administrator'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={() => onSelectPortal('admin', 'admin')}
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2.5 shadow-lg shadow-amber-950/50 hover:shadow-amber-900/70 transform hover:-translate-y-0.5 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-950" />
                  <span>{lang === 'hi' ? 'एडमिन साइन-इन (नियंत्रण केंद्र)' : 'Enter Admin Control Center (Sign In)'}</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-slate-950" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={openAdminForm}
                    className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    Custom Password Sign In
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">Demo: admin@consumer.gov.in</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Role Selection Bar for SIH Evaluation */}
      <div className="border-t border-slate-800 bg-[#050D16] py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-semibold text-slate-300">Quick Hackathon Evaluation Sign-In Profiles:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectPortal('admin', 'admin')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 font-medium text-[11px] transition-colors"
            >
              Chief Admin
            </button>
            <button
              onClick={() => onSelectPortal('user', 'inspector')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 font-medium text-[11px] transition-colors"
            >
              Field Inspector Sharma
            </button>
            <button
              onClick={() => onSelectPortal('admin', 'reviewer')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-slate-700 font-medium text-[11px] transition-colors"
            >
              Legal Reviewer Verma
            </button>
            <button
              onClick={() => onSelectPortal('user', 'operator')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 font-medium text-[11px] transition-colors"
            >
              Terminal Operator Ananya
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
