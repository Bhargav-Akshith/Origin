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
  loginUser,
  switchDemoRole
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

  // Select Portal from Gateway (Quick Demo One-Click Sign In)
  const handleSelectPortal = async (portal: 'user' | 'admin', role = 'inspector') => {
    setIsLoading(true);
    try {
      const targetRole = portal === 'admin' ? (role === 'reviewer' ? 'reviewer' : 'admin') : (role === 'operator' ? 'operator' : 'inspector');
      const res = await switchDemoRole(targetRole);
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
        if (allScans.length > 0 && !selectedScan) {
          setSelectedScan(allScans[0]);
        }
      }
    } catch (err) {
      alert('Sign-In Error: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual Password Sign In from Gateway
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

  const handleRoleSwitch = async (newRole: string) => {
    try {
      setIsLoading(true);
      const res = await switchDemoRole(newRole);
      setCurrentUser(res.user);
      if (newRole !== 'admin' && newRole !== 'reviewer' && activePortal === 'admin') {
        setActivePortal('user');
      }
      const allScans = await fetchScans();
      setScans(allScans);
    } catch (err) {
      alert('Error switching role: ' + err);
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

  const handleUpload = async (file: File, productName: string, category: string) => {
    setIsLoading(true);
    try {
      const scan = await uploadPackagingImage(file, productName, category);
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
        onSelectPortal={handleSelectPortal}
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
        onRoleSwitch={handleRoleSwitch}
        onSignOut={handleSignOut}
        lang={lang}
        onLanguageChange={setLang}
      />

      {/* Main Container */}
      <main className="flex-1 gov-container py-5 space-y-5">
        {/* ========================================================================= */}
        {/* PORTAL 1: ADMIN CONTROL CENTER */}
        {/* ========================================================================= */}
        {activePortal === 'admin' && (
          currentUser?.role !== 'admin' && currentUser?.role !== 'reviewer' ? (
            <div className="bg-white p-12 rounded-xl border border-rose-300 shadow-md text-center max-w-lg mx-auto">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Administrative Clearance Required</h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Access to Portal 1 (Central Command & Adjudication Center) is restricted to Chief Controllers and authorized administrators.
              </p>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition-colors"
              >
                Switch to Chief Admin Role (Demo)
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
