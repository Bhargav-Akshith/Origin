import React, { useState, useEffect } from 'react';
import { GatewayLanding } from './components/GatewayLanding';
import { WebLayout } from './layouts/WebLayout';
import { MobileLayout } from './layouts/MobileLayout';
import { ReviewActionModal } from './components/common/ReviewActionModal';

import type { 
  ScanSession, 
  AdminDashboardStats, 
  DemoSkuPreset, 
  User, 
  ExtractedField,
  InspectionTab,
  UiMode
} from './types';

import { 
  fetchDashboardMetrics, 
  fetchDemoSkus, 
  fetchScanDetails, 
  uploadPackagingImage,
  fetchScans,
  getMe,
  loginUser,
  reinspectScanApi
} from './services/api';

import { type Language } from './i18n/translations';
import { Lock, ShieldAlert } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<Language>('en');

  // Presentation Mode: 'web' (Desktop Multi-Column) or 'mobile' (Touch-First Single-Column)
  const [uiMode, setUiMode] = useState<UiMode>(() => {
    const saved = localStorage.getItem('lmpc_ui_mode');
    if (saved === 'web' || saved === 'mobile') return saved;
    return window.innerWidth < 768 ? 'mobile' : 'web';
  });

  // Application View Mode: 'gateway' (Landing Hub with Admin Sign In & Inspector Sign In) or 'portal' (Active Workspace)
  const [viewMode, setViewMode] = useState<'gateway' | 'portal'>('gateway');

  // Active Portal: 'user' (Inspector Screening & OCR) or 'admin' (Admin Control Center)
  const [activePortal, setActivePortal] = useState<'user' | 'admin'>('user');
  const [activeTab, setActiveTab] = useState<InspectionTab>('inspect');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('dashboard');

  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  // Review & Adjudication Action Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  // Mode change handler (Zero Data Loss)
  const handleModeChange = (newMode: UiMode) => {
    setUiMode(newMode);
    localStorage.setItem('lmpc_ui_mode', newMode);
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
      setScans((prev) => [scan, ...prev.filter((s) => s.id !== scan.id)]);
      
      const m = await fetchDashboardMetrics();
      setMetrics(m);
    } catch (err: any) {
      alert('Upload & Verification Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReinspect = async () => {
    if (!selectedScan) return;
    setIsLoading(true);
    try {
      const updated = await reinspectScanApi(selectedScan.id);
      setSelectedScan(updated);
      setScans((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      alert('Re-inspection and secondary quality verification request submitted.');
    } catch (err: any) {
      alert('Failed to request reinspection: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewCompleted = (updatedScan: ScanSession) => {
    setSelectedScan(updatedScan);
    setScans((prev) => prev.map((s) => (s.id === updatedScan.id ? updatedScan : s)));
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
    <>
      {/* Dynamic Presentation Layout (Web Mode vs Mobile Mode) */}
      {uiMode === 'web' ? (
        <WebLayout
          uiMode={uiMode}
          onModeChange={handleModeChange}
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
          activeTab={activeTab}
          onTabChange={setActiveTab}
          adminActiveTab={adminActiveTab}
          onAdminTabChange={setAdminActiveTab}
          metrics={metrics}
          demoSkus={demoSkus}
          scans={scans}
          selectedScan={selectedScan}
          selectedField={selectedField}
          onSelectScan={setSelectedScan}
          onSelectField={setSelectedField}
          onUpload={handleUpload}
          onSelectDemoSku={loadDemoSku}
          onOpenReviewModal={() => setShowReviewModal(true)}
          isLoading={isLoading}
        />
      ) : (
        <MobileLayout
          uiMode={uiMode}
          onModeChange={handleModeChange}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onRequestAdminClearance={() => {
            setAdminAuthError(null);
            setShowAdminAuthModal(true);
          }}
          lang={lang}
          onLanguageChange={setLang}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          metrics={metrics}
          demoSkus={demoSkus}
          scans={scans}
          selectedScan={selectedScan}
          selectedField={selectedField}
          onSelectScan={setSelectedScan}
          onSelectField={setSelectedField}
          onUpload={handleUpload}
          onSelectDemoSku={loadDemoSku}
          onOpenReviewModal={() => setShowReviewModal(true)}
          onReinspect={handleReinspect}
          isLoading={isLoading}
        />
      )}

      {/* Shared Review & Adjudication Modal */}
      <ReviewActionModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        scan={selectedScan}
        onReviewCompleted={handleReviewCompleted}
        lang={lang}
      />

      {/* Shared Admin Password Verification Clearance Modal */}
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
    </>
  );
}

export default App;
