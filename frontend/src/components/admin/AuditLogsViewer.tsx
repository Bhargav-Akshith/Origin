import { useState, useEffect } from 'react';
import { RefreshCw, Lock } from 'lucide-react';
import type { AuditLog } from '../../types';
import { fetchAuditLogs } from '../../services/api';
import { type Language } from '../../i18n/translations';

interface Props {
  lang: Language;
}

export function AuditLogsViewer({ }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(actionFilter, 100);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-slate-900 text-amber-400 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Immutable Statutory Audit Trail & Cryptographic Log
            </h2>
            <p className="text-xs text-slate-500">
              SHA-256 digital seals of all administrative actions, rule mutations, and inspection verdicts
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="COMMODITY_INSPECTED">COMMODITY_INSPECTED</option>
            <option value="SUBMISSION_REVIEWED">SUBMISSION_REVIEWED</option>
            <option value="RULE_CREATED">RULE_CREATED</option>
            <option value="RULE_UPDATED">RULE_UPDATED</option>
            <option value="USER_MODIFIED">USER_MODIFIED</option>
            <option value="SETTING_UPDATED">SETTING_UPDATED</option>
          </select>

          <button
            onClick={loadLogs}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp (IST)</th>
                <th className="p-3">Official Actor</th>
                <th className="p-3">Audit Action</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Action Description & Remarks</th>
                <th className="p-3 text-right">Digital Verification Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-700" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No audit records found matching filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{log.actor_email}</div>
                      <span className="text-[10px] text-blue-700 font-semibold uppercase">{log.actor_role}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700 uppercase">{log.entity_type}</span>
                      {log.entity_id && (
                        <div className="text-[10px] font-mono text-slate-400">#{log.entity_id.slice(0, 8)}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 max-w-sm">{log.description}</td>
                    <td className="p-3 text-right font-mono text-[10px] text-slate-400">
                      {log.sha256_hash ? (
                        <span title={log.sha256_hash} className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {log.sha256_hash.slice(0, 16)}...
                        </span>
                      ) : (
                        <span className="text-slate-300">N/A</span>
                      )}
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
