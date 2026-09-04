import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Bell, Info } from 'lucide-react';
import type { SystemAlert } from '../../types';
import { fetchSystemAlerts, markAlertAsRead } from '../../services/api';
import { type Language } from '../../i18n/translations';

interface Props {
  lang: Language;
}

export function AlertsCenter({ }: Props) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemAlerts(severityFilter);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter]);

  const handleMarkRead = async (alertId: string) => {
    try {
      const updated = await markAlertAsRead(alertId);
      setAlerts(alerts.map(a => a.id === updated.id ? updated : a));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Central Enforcement Notices & System Alerts
            </h2>
            <p className="text-xs text-slate-500">
              Live notifications regarding critical commodity breaches, repeated offenders, and tribunal notices
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Breaches</option>
            <option value="WARNING">Warnings</option>
            <option value="INFO">Informational</option>
          </select>

          <button
            onClick={loadAlerts}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
            Loading active alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            No alerts found under current criteria.
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.is_read
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : isCritical
                    ? 'bg-rose-50/80 border-rose-300 shadow-sm'
                    : isWarning
                    ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                    : 'bg-blue-50/80 border-blue-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                      {isCritical ? (
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">{alert.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{alert.category}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{alert.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        Received: {new Date(alert.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold transition-colors shrink-0"
                    >
                      Mark as Acknowledged
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
