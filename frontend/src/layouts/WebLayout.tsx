import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ScanLine, 
  FileCheck2, 
  History, 
  BookOpen, 
  Users, 
  Cpu, 
  BarChart3, 
  Lock, 
  Sliders, 
  Bell, 
  ShieldAlert,
  Scale,
  FileText,
  Download,
  Search,
  CheckCircle2,
  Eye
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
import { GovHeader } from '../components/GovHeader';
import { ModeSwitcher } from '../components/common/ModeSwitcher';
import { MetricsBar } from '../components/MetricsBar';
import { UploadZone } from '../components/UploadZone';
import { ScanCanvas } from '../components/ScanCanvas';
import { ComplianceCard } from '../components/ComplianceCard';
import { EvidenceTable } from '../components/common/EvidenceTable';
import { ViolationsList } from '../components/ViolationsList';
import { UserHistory } from '../components/UserHistory';
import { StatusBadge } from '../components/common/StatusBadge';
import { getReportPdfUrl } from '../services/api';

// Admin Components
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { UserManagement } from '../components/admin/UserManagement';
import { RulesManager } from '../components/admin/RulesManager';
import { SubmissionsManager } from '../components/admin/SubmissionsManager';
import { AiDiagnostics } from '../components/admin/AiDiagnostics';
import { AnalyticsView } from '../components/admin/AnalyticsView';
import { AuditLogsViewer } from '../components/admin/AuditLogsViewer';
import { SystemSettings } from '../components/admin/SystemSettings';
import { AlertsCenter } from '../components/admin/AlertsCenter';

interface WebLayoutProps {
  uiMode: UiMode;
  onModeChange: (mode: UiMode) => void;
  activePortal: 'admin' | 'user';
  onPortalChange: (portal: 'admin' | 'user') => void;
  currentUser: User | null;
  onSignOut: () => void;
  onRequestAdminClearance: () => void;
  lang: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  activeTab: InspectionTab;
  onTabChange: (tab: InspectionTab) => void;
  adminActiveTab: string;
  onAdminTabChange: (tab: string) => void;

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
  isLoading: boolean;
}

export const WebLayout: React.FC<WebLayoutProps> = ({
  uiMode,
  onModeChange,
  activePortal,
  onPortalChange,
  currentUser,
  onSignOut,
  onRequestAdminClearance,
  lang,
  onLanguageChange,
  activeTab,
  onTabChange,
  adminActiveTab,
  onAdminTabChange,
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
  isLoading
}) => {
  const [reportSearch, setReportSearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');

  const pendingReviewScans = scans.filter(
    (s) => s.workflow_status === 'UNDER_REVIEW' || s.overall_verdict === 'NON_COMPLIANT'
  );

  const filteredReports = scans.filter((s) =>
    (s.product_name || '').toLowerCase().includes(reportSearch.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(reportSearch.toLowerCase()) ||
    (s.id || '').toLowerCase().includes(reportSearch.toLowerCase())
  );

  const filteredReviews = pendingReviewScans.filter((s) =>
    (s.product_name || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
    (s.id || '').toLowerCase().includes(reviewSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6F9] font-sans antialiased text-slate-800">
      {/* Official Government Top Header with Prominent Global Mode Switcher */}
      <GovHeader
        activePortal={activePortal}
        onPortalChange={onPortalChange}
        currentUser={currentUser}
        onSignOut={onSignOut}
        onRequestAdminClearance={onRequestAdminClearance}
        lang={lang}
        onLanguageChange={onLanguageChange}
      />

      {/* Global Mode Switcher & Officer Session Sub-Bar */}
      <div className="bg-[#0b2136] text-white py-2 px-4 border-b border-slate-700/80 shadow-inner">
        <div className="gov-container flex flex-wrap items-center justify-between gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">
              Interface Mode:
            </span>
            <ModeSwitcher mode={uiMode} onModeChange={onModeChange} />
          </div>

          {/* Quick Stats & Active Scan Indicator */}
          <div className="flex items-center gap-3 text-xs text-slate-300">
            {selectedScan && (
              <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
                <span className="text-[11px] text-slate-400 font-semibold">Active SKU:</span>
                <span className="font-bold text-amber-300 truncate max-w-[200px]">
                  {selectedScan.product_name}
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                    selectedScan.overall_verdict === 'COMPLIANT'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {selectedScan.overall_verdict}
                </span>
              </div>
            )}
            <span className="text-slate-400 hidden md:inline">
              Total Database Records: <b>{scans.length}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Desktop Container */}
      <main className="flex-1 gov-container py-5 space-y-5">
        {/* ========================================================================= */}
        {/* PORTAL 1: ADMIN CONTROL CENTER */}
        {/* ========================================================================= */}
        {activePortal === 'admin' ? (
          currentUser?.role !== 'admin' ? (
            <div className="bg-white p-12 rounded-xl border border-rose-300 shadow-md text-center max-w-lg mx-auto">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Administrative Clearance Required</h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Access to Central Command & Adjudication Center is restricted to Chief Controllers.
              </p>
              <button
                onClick={onRequestAdminClearance}
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
                      onClick={() => onAdminTabChange('dashboard')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'dashboard'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-400" />
                      <span>Executive Dashboard</span>
                    </button>

                    <button
                      onClick={() => onAdminTabChange('users')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'users'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>User & Role Access</span>
                    </button>

                    <button
                      onClick={() => onAdminTabChange('rules')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'rules'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>Rules Engine Manager</span>
                    </button>

                    <button
                      onClick={() => onAdminTabChange('submissions')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'submissions'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4 text-purple-400" />
                      <span>Case Review & Submissions</span>
                    </button>

                    <button
                      onClick={() => onAdminTabChange('ai')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'ai'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>AI Model Diagnostics</span>
                    </button>

                    <button
                      onClick={() => onAdminTabChange('analytics')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'analytics'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-rose-400" />
                      <span>Analytics & Insights</span>
                    </button>

                    <button
                      onClick={() => onAdminTabChange('audit')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'audit'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Statutory Audit Trail</span>
                    </button>

                    <button
                      onClick={() => onAdminTabChange('settings')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'settings'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <span>System Settings</span>
                    </button>

                    <button
                      onClick={() => onAdminTabChange('alerts')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        adminActiveTab === 'alerts'
                          ? 'bg-[#0F2942] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Bell className="w-4 h-4 text-rose-400" />
                      <span>Alerts Center</span>
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
                      onSelectScan(scan);
                      onSelectField(null);
                    }}
                    onNavigateTab={onAdminTabChange}
                  />
                )}
                {adminActiveTab === 'users' && <UserManagement lang={lang} />}
                {adminActiveTab === 'rules' && <RulesManager lang={lang} />}
                {adminActiveTab === 'submissions' && (
                  <SubmissionsManager
                    lang={lang}
                    onInspectScanEvidence={(scan) => {
                      onSelectScan(scan);
                      onSelectField(null);
                      onPortalChange('user');
                      onTabChange('inspect');
                    }}
                  />
                )}
                {adminActiveTab === 'ai' && <AiDiagnostics lang={lang} />}
                {adminActiveTab === 'analytics' && metrics && <AnalyticsView lang={lang} />}
                {adminActiveTab === 'audit' && <AuditLogsViewer lang={lang} />}
                {adminActiveTab === 'settings' && <SystemSettings lang={lang} />}
                {adminActiveTab === 'alerts' && <AlertsCenter lang={lang} />}
              </div>
            </div>
          )
        ) : (
          /* ========================================================================= */
          /* PORTAL 2: FIELD INSPECTOR DESKTOP WORKSPACE */
          /* ========================================================================= */
          <div className="space-y-5">
            {/* Inspector Navigation Sub-Bar with 4 Clear Dedicated Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {/* 1. Ingestion Scanner */}
                <button
                  onClick={() => onTabChange('inspect')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'inspect'
                      ? 'bg-[#0F2942] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ScanLine className={`w-4 h-4 ${activeTab === 'inspect' ? 'text-amber-400' : 'text-blue-700'}`} />
                  <span>Universal Ingestion & OCR Scanner</span>
                </button>

                {/* 2. Submissions & History */}
                <button
                  onClick={() => onTabChange('submissions')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'submissions'
                      ? 'bg-[#0F2942] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <History className={`w-4 h-4 ${activeTab === 'submissions' ? 'text-amber-400' : 'text-blue-700'}`} />
                  <span>Submissions History ({scans.length})</span>
                </button>

                {/* 3. Review Required Queue */}
                <button
                  onClick={() => onTabChange('reviews')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-[#0F2942] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Scale className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span>Adjudication Queue ({pendingReviewScans.length})</span>
                  {pendingReviewScans.length > 0 && (
                    <span className="ml-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {pendingReviewScans.length}
                    </span>
                  )}
                </button>

                {/* 4. Official Reports */}
                <button
                  onClick={() => onTabChange('reports')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'reports'
                      ? 'bg-[#0F2942] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'reports' ? 'text-amber-400' : 'text-emerald-700'}`} />
                  <span>Certificates & Reports</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-mono hidden lg:inline">
                Inspector Node: {currentUser?.badge_number || 'GOV-8821'}
              </span>
            </div>

            {/* TAB CONTENT 1: UNIVERSAL INGESTION SCANNER */}
            {activeTab === 'inspect' && (
              <>
                {/* 1. National Compliance Metrics Bar */}
                {metrics && <MetricsBar metrics={metrics} lang={lang} />}

                {/* 2. Commodity Ingestion Terminal (Upload & Live Camera) */}
                <UploadZone
                  demoSkus={demoSkus}
                  onSelectDemo={onSelectDemoSku}
                  onUpload={onUpload}
                  isLoading={isLoading}
                  selectedScanId={selectedScan?.id}
                  lang={lang}
                />

                {/* 3. Computer Vision Evidence Locator & Compliance Verdict (Multi-Column) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7">
                    <ScanCanvas
                      scan={selectedScan}
                      selectedField={selectedField}
                      onSelectField={onSelectField}
                      lang={lang}
                    />
                  </div>
                  <div className="lg:col-span-5 flex flex-col">
                    <ComplianceCard scan={selectedScan} lang={lang} />
                  </div>
                </div>

                {/* 4. Statutory Legal Metrology Declarations Breakdown Table */}
                <EvidenceTable
                  fields={selectedScan?.extracted_fields || []}
                  selectedField={selectedField}
                  onSelectField={onSelectField}
                  lang={lang}
                />

                {/* 5. Section 39 Violations & Legal Breaches List */}
                <ViolationsList
                  violations={selectedScan?.violations || []}
                  lang={lang}
                />
              </>
            )}

            {/* TAB CONTENT 2: SUBMISSIONS HISTORY */}
            {activeTab === 'submissions' && (
              <UserHistory
                scans={scans}
                onSelectScan={(scan) => {
                  onSelectScan(scan);
                  onSelectField(null);
                  onTabChange('inspect');
                }}
                lang={lang}
              />
            )}

            {/* TAB CONTENT 3: ADJUDICATION & REVIEW QUEUE */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                      <Scale className="w-5 h-5 text-amber-600" />
                      Statutory Review & Adjudication Queue
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Case adjudications requiring human-in-the-loop inspector review or statutory override
                    </p>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter review queue..."
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                    />
                  </div>
                </div>

                {filteredReviews.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-800 text-sm">All Cases Cleared</h4>
                    <p className="text-xs text-slate-500 mt-0.5">No pending inspections require review.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredReviews.map((scan) => (
                      <div
                        key={scan.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{scan.product_name}</h4>
                            <p className="text-xs text-slate-500">{scan.category}</p>
                          </div>
                          <StatusBadge status={scan.overall_verdict} size="sm" />
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Compliance Score:</span>
                            <span className="font-mono font-bold text-rose-700">
                              {Math.round(scan.compliance_score || 0)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Flagged Breaches:</span>
                            <span className="font-bold text-rose-600">
                              {(scan.violations || []).length} Violations
                            </span>
                          </div>
                          {scan.reviewer_notes && (
                            <div className="text-[11px] text-amber-800 italic pt-1 border-t border-slate-200">
                              Note: {scan.reviewer_notes}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScan(scan);
                              onSelectField(null);
                              onTabChange('inspect');
                            }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Evidence</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScan(scan);
                              onOpenReviewModal();
                            }}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Adjudicate</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: OFFICIAL CERTIFICATES & REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      Official Legal Metrology Inspection Certificates
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Statutory certificates generated under Rule 32 of Legal Metrology (Packaged Commodities) Rules, 2011
                    </p>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search certificates..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Certificate ID</th>
                        <th className="py-3 px-4">Commodity Description</th>
                        <th className="py-3 px-4">Statutory Verdict</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">SHA-256 Audit Hash</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredReports.map((scan) => {
                        const pdfUrl = getReportPdfUrl(scan.id);

                        return (
                          <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-900">
                              CLM-{scan.id.substring(0, 8).toUpperCase()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{scan.product_name}</div>
                              <div className="text-[10px] text-slate-500">{scan.category}</div>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={scan.overall_verdict} size="sm" />
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                              {Math.round(scan.compliance_score || 0)}%
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                              {scan.sha256_hash ? `${scan.sha256_hash.substring(0, 16)}...` : 'Pending'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-[#0F2942] hover:bg-[#1E3A8A] text-amber-300 hover:text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF Certificate</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Official Government Portal Footer */}
      <footer className="bg-[#0A1D30] text-slate-400 py-3 text-[11px] border-t border-slate-800 mt-8">
        <div className="gov-container flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>
            GOVERNMENT OF INDIA &bull; MINISTRY OF CONSUMER AFFAIRS &bull; DEPARTMENT OF LEGAL METROLOGY
          </p>
          <p className="text-slate-300 font-medium">
            Standard Compliance Portal &bull; LMR 2011 PS #26034
          </p>
        </div>
      </footer>
    </div>
  );
};
