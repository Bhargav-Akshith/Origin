import { useState, useEffect } from 'react';
import { Save, RefreshCw, Sliders } from 'lucide-react';
import type { SystemSetting } from '../../types';
import { fetchSystemSettings, updateSystemSetting } from '../../services/api';
import { type Language } from '../../i18n/translations';

interface Props {
  lang: Language;
}

export function SystemSettings({ }: Props) {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemSettings();
      setSettings(data);
      const vals: Record<string, string> = {};
      data.forEach(s => { vals[s.key] = s.value; });
      setEditValues(vals);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (key: string) => {
    setSavingKey(key);
    try {
      const updated = await updateSystemSetting(key, editValues[key]);
      setSettings(settings.map(s => s.key === key ? updated : s));
      alert(`Setting '${key}' successfully updated to '${editValues[key]}'.`);
    } catch (err) {
      alert('Error saving setting: ' + err);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              National Enforcement System Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Configure operational parameters, optical OCR sensitivity thresholds, and legal notice triggers
            </p>
          </div>
        </div>

        <button
          onClick={loadSettings}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading system parameters...
          </div>
        ) : (
          settings.map((setting) => (
            <div key={setting.key} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-slate-900">{setting.key}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {setting.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">{setting.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                {setting.key === 'ENFORCEMENT_STRICTNESS' ? (
                  <select
                    value={editValues[setting.key] || setting.value}
                    onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded bg-white font-bold outline-none text-slate-800"
                  >
                    <option value="STRICT">STRICT (Immediate Seizure Flag)</option>
                    <option value="MODERATE">MODERATE (Warning Notice First)</option>
                  </select>
                ) : setting.key === 'AUTO_NOTICE_GENERATION' ? (
                  <select
                    value={editValues[setting.key] || setting.value}
                    onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded bg-white font-bold outline-none text-slate-800"
                  >
                    <option value="ENABLED">ENABLED</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editValues[setting.key] || setting.value}
                    onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none font-medium"
                  />
                )}

                <button
                  onClick={() => handleSave(setting.key)}
                  disabled={savingKey === setting.key}
                  className="flex items-center space-x-1 px-3.5 py-1.5 bg-[#0F2942] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingKey === setting.key ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Save</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
