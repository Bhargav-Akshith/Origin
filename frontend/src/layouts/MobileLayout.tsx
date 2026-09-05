import React, { useState } from 'react';
import { 
  Camera, 
  ChevronRight, 
  Download,
  FileText, 
  Search, 
  ShieldCheck 
} from 'lucide-react';
import type { 
  ScanSession, 
  AdminDashboardStats, 
  DemoSkuPreset, 
  User, 
  ExtractedField, 
  InspectionTab,
  UiMode
} from '../types';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { MobileBottomNav } from '../components/mobile/MobileBottomNav';
import { MobileInspectionWizard } from '../components/mobile/MobileInspectionWizard';
import { MobileEvidenceList } from '../components/mobile/MobileEvidenceList';
import { MobileDecisionView } from '../components/mobile/MobileDecisionView';
import { StatusBadge } from '../components/common/StatusBadge';
import { getReportPdfUrl } from '../services/api';

interface MobileLayoutProps {
  uiMode: UiMode;
  onModeChange: (mode: UiMode) => void;
  currentUser: User | null;
  onSignOut: () => void;
  onRequestAdminClearance: () => void;
  lang: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  activeTab: InspectionTab;
  onTabChange: (tab: InspectionTab) => void;

  // Data
  metrics: AdminDashboardStats | null;
  demoSkus: DemoSkuPreset[];
  scans: ScanSession[];
  selectedScan: ScanSession | null;
  selectedField: ExtractedField | null;
  onSelectScan: (scan: ScanSession) => void;
  onSelectField: (field: ExtractedField | null) => void;
  onUpload: (files: File[] | File, productName: string, category: string) => void;
  onSelectDemoSku: (demoId: string) => void;
  onOpenReviewModal: () => void;
  onReinspect: () => void;
  isLoading: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  uiMode,
  onModeChange,
  currentUser,
  onSignOut,
  onRequestAdminClearance,
  lang,
  onLanguageChange,
  activeTab,
  onTabChange,
  metrics,
  demoSkus,
  scans,
  selectedScan,
  selectedField,
  onSelectScan,
  onSelectField,
  onUpload,
  onSelectDemoSku,
  onOpenReviewModal,
  onReinspect,
  isLoading
}) => {
  const [isSimulatedDevice, setIsSimulatedDevice] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');
  const [searchReports, setSearchReports] = useState('');
  const [mobileDetailView, setMobileDetailView] = useState<'decision' | 'evidence'>('decision');

  const pendingReviews = scans.filter((s) => s.workflow_status === 'UNDER_REVIEW' || s.overall_verdict === 'NON_COMPLIANT');

  const filteredHistory = scans.filter((s) =>
    (s.product_name || '').toLowerCase().includes(searchHistory.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchHistory.toLowerCase()) ||
    (s.id || '').toLowerCase().includes(searchHistory.toLowerCase())
  );

  const filteredReports = scans.filter((s) =>
    (s.product_name || '').toLowerCase().includes(searchReports.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchReports.toLowerCase()) ||
    (s.id || '').toLowerCase().includes(searchReports.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      // -------------------------------------------------------------
      // TAB 1: HOME / DASHBOARD
      // -------------------------------------------------------------
      case 'dashboard':
        return (
          <div className="space-y-4">
            {/* KPI Cards 2x2 with rich gradients */}
            {metrics && (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Audits</span>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                    {metrics.total_inspections}
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                    National Ledger
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Compliance Rate</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">
                    {Math.round(metrics.compliance_rate)}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                    {metrics.compliant_count} Verified Pass
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Non-Compliant</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <div className="text-xl font-black text-rose-600 font-mono mt-0.5">
                    {metrics.non_compliant_count}
                  </div>
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                    Breaches Flagged
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Pending Review</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="text-xl font-black text-amber-600 font-mono mt-0.5">
                    {metrics.pending_reviews_count}
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                    Requires Action
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions Hero Banner */}
            <div className="bg-gradient-to-r from-[#0F2942] to-[#1E3A8A] text-white p-4 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span className="font-extrabold text-sm">Quick Inspection</span>
                </div>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
                  AI READY
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Capture physical commodity label photos for instant LMPC statutory compliance clearance.
              </p>
              <button
                type="button"
                onClick={() => onTabChange('inspect')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Launch Camera Scanner</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Active Selected Scan Card if exists */}
            {selectedScan && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500">
                    Active Inspection
                  </span>
                  <StatusBadge status={selectedScan.overall_verdict} size="sm" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedScan.product_name}</h4>
                  <p className="text-[11px] text-slate-500">{selectedScan.category}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDetailView('decision');
                      onTabChange('reviews');
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-lg text-center cursor-pointer"
                  >
                    View Verdict
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDetailView('evidence');
                      onTabChange('reviews');
                    }}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2 rounded-lg text-center cursor-pointer"
                  >
                    Evidence ({selectedScan.extracted_fields?.length || 0})
                  </button>
                </div>
              </div>
            )}

            {/* Recent Submissions Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Recent Submissions
                </span>
                <button
                  type="button"
                  onClick={() => onTabChange('submissions')}
                  className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  View All ({scans.length})
                </button>
              </div>

              <div className="space-y-2">
                {scans.slice(0, 4).map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => {
                      onSelectScan(scan);
                      onSelectField(null);
                      setMobileDetailView('decision');
                      onTabChange('reviews');
                    }}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <div className="pr-2 min-w-0">
                      <h5 className="font-bold text-slate-900 text-xs truncate">
                        {scan.product_name}
                      </h5>
                      <p className="text-[10px] text-slate-500 truncate">
                        {scan.category} • {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={scan.overall_verdict} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // TAB 2: INSPECT / CAMERA WIZARD
      // -------------------------------------------------------------
      case 'inspect':
        return (
          <MobileInspectionWizard
            demoSkus={demoSkus}
            onSelectDemo={(demoId) => {
              onSelectDemoSku(demoId);
              setMobileDetailView('decision');
              onTabChange('reviews');
            }}
            onSubmitInspection={(files, name, cat) => {
              onUpload(files, name, cat);
              setMobileDetailView('decision');
              onTabChange('reviews');
            }}
            isLoading={isLoading}
            selectedScanId={selectedScan?.id}
            lang={lang}
          />
        );

      // -------------------------------------------------------------
      // TAB 3: SUBMISSIONS HISTORY
      // -------------------------------------------------------------
      case 'submissions':
        return (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900">
                  Inspection Ledger ({scans.length})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  History
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by commodity name, ID, or category..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredHistory.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  No inspection records found.
                </div>
              ) : (
                filteredHistory.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => {
                      onSelectScan(scan);
                      onSelectField(null);
                      setMobileDetailView('decision');
                      onTabChange('reviews');
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2 cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate">
                          {scan.product_name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">{scan.category}</p>
                      </div>
                      <StatusBadge status={scan.overall_verdict} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 text-slate-500">
                      <span>Score: <b>{Math.round(scan.compliance_score || 0)}%</b></span>
                      <span>Violations: <b>{(scan.violations || []).length}</b></span>
                      <span className="text-blue-700 font-bold flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // TAB 4: REVIEW & ACTIVE DECISION
      // -------------------------------------------------------------
      case 'reviews':
        return (
          <div className="space-y-3">
            {/* Active SKU pill selector if multiple pending */}
            {pendingReviews.length > 0 && (
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-1">
                  <span>PENDING ADJUDICATION QUEUE ({pendingReviews.length}):</span>
                  <span className="text-amber-700">Tap to Switch</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {pendingReviews.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        onSelectScan(s);
                        onSelectField(null);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer shrink-0 truncate max-w-[150px] ${
                        selectedScan?.id === s.id
                          ? 'bg-[#0F2942] text-amber-300 border-[#0F2942] shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s.product_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View Toggle: Verdict vs Evidence */}
            <div className="bg-slate-200 p-1 rounded-xl grid grid-cols-2 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMobileDetailView('decision')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  mobileDetailView === 'decision'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Statutory Verdict
              </button>
              <button
                type="button"
                onClick={() => setMobileDetailView('evidence')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  mobileDetailView === 'evidence'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Extracted Evidence ({selectedScan?.extracted_fields?.length || 0})
              </button>
            </div>

            {mobileDetailView === 'decision' ? (
              <MobileDecisionView
                scan={selectedScan}
                onOpenReviewModal={onOpenReviewModal}
                onReinspect={onReinspect}
                onNavigateTab={onTabChange}
                lang={lang}
              />
            ) : (
              <MobileEvidenceList
                fields={selectedScan?.extracted_fields || []}
                packagingImages={selectedScan?.packaging_images || []}
                selectedField={selectedField}
                onSelectField={onSelectField}
                lang={lang}
              />
            )}
          </div>
        );

      // -------------------------------------------------------------
      // TAB 5: REPORTS & CERTIFICATES
      // -------------------------------------------------------------
      case 'reports':
        return (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900">
                  Official Statutory Certificates ({scans.length})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Rule 32
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search certificates by commodity name..."
                  value={searchReports}
                  onChange={(e) => setSearchReports(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredReports.map((scan) => {
                const pdfUrl = getReportPdfUrl(scan.id);

                return (
                  <div
                    key={scan.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate">
                          {scan.product_name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          CLM-{scan.id.substring(0, 6).toUpperCase()} • {scan.overall_verdict}
                        </p>
                      </div>
                    </div>

                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-[#0F2942] hover:bg-[#1E3A8A] text-amber-300 hover:text-white p-2.5 rounded-xl transition-colors cursor-pointer"
                      title="Download PDF Certificate"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // TAB 6: OFFICER PROFILE & SETTINGS
      // -------------------------------------------------------------
      case 'profile':
        return (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-amber-400 mx-auto flex items-center justify-center border-2 border-amber-400 font-extrabold text-xl shadow">
                {currentUser?.name?.charAt(0) || 'O'}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {currentUser?.name || 'Field Inspector'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {currentUser?.email || 'inspector@consumer.gov.in'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Node: {currentUser?.badge_number || 'GOV-8821'}</span>
              </div>
            </div>

            {/* Officer Details List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-semibold">Department</span>
                <span className="font-bold text-slate-900">{currentUser?.department || 'Legal Metrology'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-semibold">Clearance Role</span>
                <span className="font-bold text-amber-700 uppercase">{currentUser?.role || 'inspector'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-semibold">Active Presentation</span>
                <span className="font-bold text-emerald-700">Mobile Touch Mode</span>
              </div>
            </div>

            {/* Admin clearance trigger if not chief admin */}
            {currentUser?.role !== 'admin' && (
              <button
                type="button"
                onClick={onRequestAdminClearance}
                className="w-full bg-slate-900 text-amber-400 font-extrabold text-xs py-3 px-4 rounded-2xl shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter Chief Administrator Clearance</span>
              </button>
            )}

            {/* Switch to Web Mode action */}
            <button
              type="button"
              onClick={() => onModeChange('web')}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs py-3 px-4 rounded-2xl border border-blue-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🖥 Switch to Desktop Web Mode</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const containerContent = (
    <div className="min-h-screen flex flex-col bg-[#F3F6F9] font-sans text-slate-800 pb-20 select-none">
      {/* Mobile Top Header */}
      <MobileHeader
        currentUser={currentUser}
        uiMode={uiMode}
        onModeChange={onModeChange}
        lang={lang}
        onLanguageChange={onLanguageChange}
        onSignOut={onSignOut}
        isSimulatedDevice={isSimulatedDevice}
        onToggleSimulatedDevice={() => setIsSimulatedDevice(!isSimulatedDevice)}
      />

      {/* Main Single-Column Scrollable Body */}
      <main className="flex-1 p-3.5 space-y-3.5 max-w-md mx-auto w-full">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        reviewCount={pendingReviews.length}
        totalSubmissions={scans.length}
      />
    </div>
  );

  // If in desktop simulator frame mode, render inside a realistic mobile bezel
  if (isSimulatedDevice) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        {/* Device Top Control Bar */}
        <div className="mb-3 flex items-center justify-between w-full max-w-[420px] text-xs text-slate-300 px-2">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mobile Device Simulator</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSimulatedDevice(false)}
            className="text-amber-400 hover:underline font-semibold text-[11px] cursor-pointer"
          >
            Switch to Fluid Width
          </button>
        </div>

        {/* Realistic iPhone / Mobile Frame */}
        <div className="w-full max-w-[400px] h-[840px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-white/20 relative overflow-hidden flex flex-col">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center gap-2 border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full bg-slate-100 rounded-[38px] overflow-y-auto pt-4 relative no-scrollbar">
            {containerContent}
          </div>
        </div>
      </div>
    );
  }

  return containerContent;
};
