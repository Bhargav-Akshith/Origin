import { useState, useEffect } from 'react';
import { Cpu, RefreshCw } from 'lucide-react';
import type { AiDiagnostics as AiDiagnosticsType } from '../../types';
import { fetchAiDiagnostics } from '../../services/api';
import { type Language } from '../../i18n/translations';

interface Props {
  lang: Language;
}

export function AiDiagnostics({ }: Props) {
  const [data, setData] = useState<AiDiagnosticsType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetchAiDiagnostics();
      setData(res);
    } catch (err) {
      console.error('Failed to load AI metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Computer Vision & AI Inference Engine Diagnostics
            </h2>
            <p className="text-xs text-slate-500">
              Active Vision Pipeline: OpenCV CLAHE Contrast Filter + Spatial OCR Tokenizer v2.2
            </p>
          </div>
        </div>

        <button
          onClick={loadMetrics}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Stats Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total AI Inferences</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{data.total_ai_requests}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {data.success_rate}% Success
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Multi-threaded extraction</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase">Mean Inference Speed</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-700">{data.avg_latency_ms} ms</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Ultra Low
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">SLA Target: &lt; 500 ms</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase">Optical OCR Confidence</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{(data.overall_confidence_avg * 100).toFixed(1)}%</span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                High Precision
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Spatial bounding box confidence</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Vision Engine</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-800">OpenCV + Regex</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                READY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Deskewing & Contrast Active</p>
          </div>
        </div>
      )}

      {/* Real-time AI Inference Execution Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Real-Time Optical AI Execution Logs
          </h3>
          <p className="text-xs text-slate-500">Chronological telemetry of statutory packaging parsing tasks</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Inference Task</th>
                <th className="p-3">Model Architecture</th>
                <th className="p-3">Processing Latency</th>
                <th className="p-3">Confidence Score</th>
                <th className="p-3">Fields Extracted</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading AI telemetry...
                  </td>
                </tr>
              ) : data?.recent_metrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No AI inference executions recorded yet.
                  </td>
                </tr>
              ) : (
                data?.recent_metrics.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{log.operation}</td>
                    <td className="p-3 font-mono text-slate-600">{log.model_name}</td>
                    <td className="p-3">
                      <span className="font-bold text-blue-700">{log.latency_ms} ms</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800">{(log.confidence_avg * 100).toFixed(1)}%</span>
                    </td>
                    <td className="p-3 text-slate-600">{log.fields_extracted} declarations</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
