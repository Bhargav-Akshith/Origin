import { useState, useEffect } from 'react';
import { GovHeader } from './components/GovHeader';
import { MetricsBar } from './components/MetricsBar';
import { UploadZone } from './components/UploadZone';
import { ScanCanvas } from './components/ScanCanvas';
import { ComplianceCard } from './components/ComplianceCard';
import { RulesTable } from './components/RulesTable';
import { ViolationsList } from './components/ViolationsList';
import { ApiService } from './services/api';
import type { DashboardMetrics, DemoSkuPreset, ExtractedField, ScanSession } from './types';
import { type Language, translations } from './i18n/translations';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<Language>('en');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [demoSkus, setDemoSkus] = useState<DemoSkuPreset[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanSession | null>(null);
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = translations[lang];

  // Load initial data
  const loadInitialData = async () => {
    try {
      setErrorMessage(null);
      const [m, demos] = await Promise.all([
        ApiService.getMetrics(),
        ApiService.getDemoSkus()
      ]);
      setMetrics(m);
      setDemoSkus(demos);

      // Select first demo SKU if no active scan
      if (demos.length > 0 && !currentScan) {
        const firstScan = await ApiService.getScanDetails(demos[0].id);
        setCurrentScan(firstScan);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to backend inspection API');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectDemo = async (demoId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const scan = await ApiService.getScanDetails(demoId);
      setCurrentScan(scan);
      setSelectedField(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load demo inspection session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File, productName: string, category: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const scan = await ApiService.uploadAndProcess(file, productName, category);
      setCurrentScan(scan);
      setSelectedField(null);
      // Refresh dashboard metrics
      const m = await ApiService.getMetrics();
      setMetrics(m);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing packaging inspection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official Top Government Header with Interactive Language Toggle */}
      <GovHeader lang={lang} onLanguageChange={setLang} />

      <main className="gov-container flex-1 py-4">
        {/* Live Metrics Overview Bar */}
        <MetricsBar metrics={metrics} lang={lang} />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => loadInitialData()}
              className="font-bold underline text-rose-900 hover:text-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Ingestion Dropzone & 1-Click Demo SKUs */}
        <UploadZone
          demoSkus={demoSkus}
          onSelectDemo={handleSelectDemo}
          onUpload={handleUpload}
          isLoading={isLoading}
          selectedScanId={currentScan?.id}
          lang={lang}
        />

        {/* Active Inspection Workspace */}
        {currentScan && (
          <div className="mt-4 space-y-4">
            {/* Overall Verdict Banner */}
            <ComplianceCard scan={currentScan} lang={lang} />

            {/* Main Visual & Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Interactive Canvas (7 Cols) */}
              <div className="lg:col-span-7">
                <ScanCanvas
                  scan={currentScan}
                  selectedField={selectedField}
                  onSelectField={(f) => setSelectedField(f)}
                  lang={lang}
                />
              </div>

              {/* Right Column: 7-Declaration Checklist & Violations (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <RulesTable
                  fields={currentScan.extracted_fields}
                  selectedField={selectedField}
                  onSelectField={(f) => setSelectedField(f)}
                  lang={lang}
                />

                <ViolationsList
                  violations={currentScan.violations}
                  lang={lang}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Official Government Footer */}
      <footer className="bg-slate-900 text-slate-400 py-3 border-t border-slate-800 text-xs">
        <div className="gov-container flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
          <div>
            <span className="font-semibold text-slate-200">{t.footerLeft}</span>
          </div>
          <div className="text-slate-500">
            {t.footerRight}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
