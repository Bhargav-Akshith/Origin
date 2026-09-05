import { useState, useEffect } from 'react';
import { GovHeader } from './components/GovHeader';
import { GatewayLanding } from './components/GatewayLanding';
import { MetricsBar } from './components/MetricsBar';
import { UploadZone } from './components/UploadZone';
import { ScanCanvas } from './components/ScanCanvas';
import { ComplianceCard } from './components/ComplianceCard';
import { RulesTable } from './components/RulesTable';
import { ViolationsList } from './components/ViolationsList';
import { UserHistory } from './components/UserHistory';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { RulesManager } from './components/admin/RulesManager';
import { SubmissionsManager } from './components/admin/SubmissionsManager';
import { AiDiagnostics } from './components/admin/AiDiagnostics';
import { AnalyticsView } from './components/admin/AnalyticsView';
import { AuditLogsViewer } from './components/admin/AuditLogsViewer';
import { SystemSettings } from './components/admin/SystemSettings';
import { AlertsCenter } from './components/admin/AlertsCenter';

import type { ScanSession, AdminDashboardStats, DemoSkuPreset, User, ExtractedField } from './types';
import { 
  fetchDashboardMetrics, 
  fetchDemoSkus, 
  fetchScanDetails, 
  uploadPackagingImage,
  fetchScans,
  getMe,
  loginUser
} from './services/api';
import { type Language, translations } from './i18n/translations';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileCheck2, 
  Cpu, 
  BarChart3, 
  Lock, 
  Sliders, 
  Bell, 
  History, 
  ScanLine,
  ShieldAlert
} from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Application View Mode: 'gateway' (Landing Hub with Admin Sign In & Inspector Sign In) or 'portal' (Active Workspace)
  const [viewMode, setViewMode] = useState<'gateway' | 'portal'>('gateway');

  // Active Portal: 'user' (Inspector Screening & OCR) or 'admin' (Admin Control Center)
  const [activePortal, setActivePortal] = useState<'user' | 'admin'>('user');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<string>('dashboard');
  const [userActiveTab, setUserActiveTab] = useState<'scan' | 'history'>('scan');

  // Scanning & Dashboard Data
  const [metrics, setMetrics] = useState<AdminDashboardStats | null>(null);
  const [demoSkus, setDemoSkus] = useState<DemoSkuPreset[]>([]);
  const [scans, setScans] = useState<ScanSession[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanSession | null>(null);
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Admin Password Clearance Modal State
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminAuthPassword, setAdminAuthPassword] = useState('admin123');
  const [showAdminAuthPasswordText, setShowAdminAuthPasswordText] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const user = await getMe().catch(() => null);
      if (user) {
        setCurrentUser(user);
      }

      const [m, skus, allScans] = await Promise.all([
        fetchDashboardMetrics().catch(() => null),
        fetchDemoSkus().catch(() => []),
        fetchScans().catch(() => [])
      ]);
      if (m) setMetrics(m);
      if (skus) setDemoSkus(skus);
      if (allScans) setScans(allScans);

      if (allScans && allScans.length > 0) {
        setSelectedScan(allScans[0]);
      } else if (skus && skus.length > 0) {
        loadDemoSku(skus[0].id);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  // Password Sign In from Gateway
  const handleLoginSubmit = async (email: string, pass: string, portal: 'user' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, pass);
      setCurrentUser(res.user);
      setActivePortal(portal);
      setViewMode('portal');

      // Refresh data
      const [m, allScans] = await Promise.all([
        fetchDashboardMetrics().catch(() => null),
        fetchScans().catch(() => [])
      ]);
      if (m) setMetrics(m);
      if (allScans) {
        setScans(allScans);
        if (allScans.length > 0) {
          setSelectedScan(allScans[0]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminClearanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setIsLoading(true);
    try {
      const res = await loginUser('admin@consumer.gov.in', adminAuthPassword);
      setCurrentUser(res.user);
      setActivePortal('admin');
      setShowAdminAuthModal(false);
      const [m, allScans] = await Promise.all([
        fetchDashboardMetrics().catch(() => null),
        fetchScans().catch(() => [])
      ]);
      if (m) setMetrics(m);
      if (allScans) setScans(allScans);
    } catch (err: any) {
      setAdminAuthError(err.message || 'Invalid Chief Administrator Password. Access Denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setViewMode('gateway');
  };

  const loadDemoSku = async (demoId: string) => {
    setIsLoading(true);
    try {
      const scan = await fetchScanDetails(demoId);
      setSelectedScan(scan);
      setSelectedField(null);
    } catch (err) {
      console.error('Failed to load demo SKU:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (files: File[] | File, productName: string, category: string) => {
    setIsLoading(true);
    try {
      const scan = await uploadPackagingImage(files, productName, category);
      setSelectedScan(scan);
      setSelectedField(null);
      setScans([scan, ...scans]);
      
      const m = await fetchDashboardMetrics();
      setMetrics(m);
    } catch (err) {
      alert('Upload & Verification Error: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Gateway Landing View if not entered into a portal
  if (viewMode === 'gateway') {
    return (
      <GatewayLanding
        onLoginSubmit={handleLoginSubmit}
        lang={lang}
        onLanguageChange={setLang}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6F9] font-sans antialiased text-slate-800">
      {/* Official Government Top Header */}
      <GovHeader
        activePortal={activePortal}
        onPortalChange={setActivePortal}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onRequestAdminClearance={() => {
          setAdminAuthError(null);
          setShowAdminAuthModal(true);
        }}
        lang={lang}
        onLanguageChange={setLang}
      />

      {/* Admin Password Verification Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-amber-500/50 max-w-md w-full overflow-hidden">
            <div className="bg-[#0A1929] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/40">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Administrative Clearance Required
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Rule 32 Central Enforcement Access Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminAuthModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminClearanceSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                You are currently signed in as a <b>Field Inspector</b>. Access to Portal 1 (National Command, Rules Engine & Adjudication) is restricted to Chief Administrators. Enter your master password below to proceed.
              </p>

              {adminAuthError && (
                <div className="text-xs text-rose-300 bg-rose-950/70 p-3 rounded-lg border border-rose-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Administrator Master Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminAuthPasswordText ? 'text' : 'password'}
                    required
                    value={adminAuthPassword}
                    onChange={(e) => setAdminAuthPassword(e.target.value)}
                    placeholder="Enter admin master password..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminAuthPasswordText(!showAdminAuthPasswordText)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-[11px]"
                  >
                    {showAdminAuthPasswordText ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Quick Test Password:</span>
                <button
                  type="button"
                  onClick={() => setAdminAuthPassword('admin123')}
                  className="font-mono text-amber-400 hover:underline font-bold"
                >
                  admin123
                </button>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminAuthModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Verifying...' : 'Authenticate & Enter Admin Command'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 gov-container py-5 space-y-5">
        {/* ========================================================================= */}
        {/* PORTAL 1: ADMIN CONTROL CENTER */}
        {/* ========================================================================= */}
        {activePortal === 'admin' && (
          currentUser?.role !== 'admin' ? (
            <div className="bg-white p-12 rounded-xl border border-rose-300 shadow-md text-center max-w-lg mx-auto">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Administrative Clearance Required</h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Access to Portal 1 (Central Command & Adjudication Center) is restricted to Chief Controllers and authorized administrators.
              </p>
              <button
                onClick={() => {
                  setAdminAuthError(null);
                  setShowAdminAuthModal(true);
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition-colors cursor-pointer"
              >
                Enter Admin Password for Clearance
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Admin Sidebar Navigation (3 cols) */}
              <div className="lg:col-span-3 space-y-1">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
                    Command Navigation
                  </span>
                  
                  <nav className="space-y-1">
                    <button
                      onClick={() => setAdminActiveTab('dashboard')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'dashboard'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-400" />
                      <span>{t.navDashboard}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('users')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'users'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>{t.navUsers}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('rules')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'rules'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>{t.navRules}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('submissions')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'submissions'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4 text-purple-400" />
                      <span>{t.navSubmissions}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('ai')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'ai'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>{t.navAiDiagnostics}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('analytics')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'analytics'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-rose-400" />
                      <span>{t.navAnalytics}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('audit')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'audit'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>{t.navAuditLogs}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('settings')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'settings'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <span>{t.navSettings}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('alerts')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        adminActiveTab === 'alerts'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Bell className="w-4 h-4 text-rose-400" />
                      <span>{t.navAlerts}</span>
                      {metrics && metrics.active_alerts && metrics.active_alerts.length > 0 && (
                        <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          {metrics.active_alerts.length}
                        </span>
                      )}
                    </button>
                  </nav>
                </div>
              </div>

              {/* Admin Main Content Area (9 cols) */}
              <div className="lg:col-span-9 space-y-4">
                {adminActiveTab === 'dashboard' && metrics && (
                  <AdminDashboard
                    stats={metrics}
                    lang={lang}
                    onSelectScan={(scan) => {
                      setSelectedScan(scan);
                      setSelectedField(null);
                    }}
                    onNavigateTab={(tab) => setAdminActiveTab(tab)}
                  />
                )}

                {adminActiveTab === 'users' && (
                  <UserManagement lang={lang} />
                )}

                {adminActiveTab === 'rules' && (
                  <RulesManager lang={lang} />
                )}

                {adminActiveTab === 'submissions' && (
                  <SubmissionsManager
                    lang={lang}
                    onInspectScanEvidence={(scan) => {
                      setSelectedScan(scan);
                      setSelectedField(null);
                      setActivePortal('user');
                      setUserActiveTab('scan');
                    }}
                  />
                )}

                {adminActiveTab === 'ai' && (
                  <AiDiagnostics lang={lang} />
                )}

                {adminActiveTab === 'analytics' && metrics && (
                  <AnalyticsView lang={lang} />
                )}

                {adminActiveTab === 'audit' && (
                  <AuditLogsViewer lang={lang} />
                )}

                {adminActiveTab === 'settings' && (
                  <SystemSettings lang={lang} />
                )}

                {adminActiveTab === 'alerts' && (
                  <AlertsCenter lang={lang} />
                )}
              </div>
            </div>
          )
        )}

        {/* ========================================================================= */}
        {/* PORTAL 2: USER / INSPECTOR SCANNING APPLICATION */}
        {/* ========================================================================= */}
        {activePortal === 'user' && (
          <div className="space-y-5">
            {/* Inspector Navigation Sub-Bar */}
            <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex space-x-2">
                <button
                  onClick={() => setUserActiveTab('scan')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userActiveTab === 'scan'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Universal Ingestion & OCR Scanner</span>
                </button>

                <button
                  onClick={() => setUserActiveTab('history')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userActiveTab === 'history'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>My Submissions & History ({scans.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                Inspector Node: {currentUser?.badge_number || 'GOV-8821'}
              </span>
            </div>

            {userActiveTab === 'history' ? (
              <UserHistory
                scans={scans}
                onSelectScan={(scan) => {
                  setSelectedScan(scan);
                  setSelectedField(null);
                  setUserActiveTab('scan');
                }}
                lang={lang}
              />
            ) : (
              <>
                {/* 1. National Compliance Dashboard Metrics Bar */}
                {metrics && <MetricsBar metrics={metrics} lang={lang} />}

                {/* 2. Commodity Ingestion Terminal (Upload & Live Camera) */}
                <UploadZone
                  demoSkus={demoSkus}
                  onSelectDemo={loadDemoSku}
                  onUpload={handleUpload}
                  isLoading={isLoading}
                  selectedScanId={selectedScan?.id}
                  lang={lang}
                />

                {/* 3. Computer Vision Evidence Locator & Compliance Verdict */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7">
                    <ScanCanvas
                      scan={selectedScan}
                      selectedField={selectedField}
                      onSelectField={setSelectedField}
                      lang={lang}
                    />
                  </div>
                  <div className="lg:col-span-5 flex flex-col">
                    <ComplianceCard scan={selectedScan} lang={lang} />
                  </div>
                </div>

                {/* 4. Statutory Legal Metrology Declarations Breakdown Table */}
                <RulesTable
                  fields={selectedScan?.extracted_fields || []}
                  selectedField={selectedField}
                  onSelectField={(f) => setSelectedField(f)}
                  lang={lang}
                />

                {/* 5. Section 39 Violations & Legal Breaches List */}
                <ViolationsList
                  violations={selectedScan?.violations || []}
                  lang={lang}
                />
              </>
            )}
          </div>
        )}
      </main>

      {/* Official Government Portal Footer */}
      <footer className="bg-[#0A1D30] text-slate-400 py-3 text-[11px] border-t border-slate-800 mt-8">
        <div className="gov-container flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>{t.footerLeft}</p>
          <p className="text-slate-300 font-medium">{t.footerRight}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
