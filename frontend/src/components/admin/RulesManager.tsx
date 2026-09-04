import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import type { ComplianceRule } from '../../types';
import { fetchAdminRules, createAdminRule, updateAdminRule, deleteAdminRule } from '../../services/api';
import { type Language } from '../../i18n/translations';

interface Props {
  lang: Language;
}

export function RulesManager({ }: Props) {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);

  const [formData, setFormData] = useState({
    rule_name: '',
    legal_clause: '',
    field_target: 'mrp',
    description: '',
    is_mandatory: true,
    is_active: true,
    severity: 'CRITICAL',
    penalty_clause: 'Section 39 / Section 49, Legal Metrology Act, 2009'
  });

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminRules();
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormData({
      rule_name: '',
      legal_clause: 'Rule 6(1)(',
      field_target: 'mrp',
      description: '',
      is_mandatory: true,
      is_active: true,
      severity: 'CRITICAL',
      penalty_clause: 'Section 39 / Section 49, Legal Metrology Act, 2009'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: ComplianceRule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      legal_clause: rule.legal_clause,
      field_target: rule.field_target,
      description: rule.description,
      is_mandatory: rule.is_mandatory,
      is_active: rule.is_active,
      severity: rule.severity,
      penalty_clause: rule.penalty_clause || 'Section 39, Legal Metrology Act, 2009'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm(`Are you sure you want to delete statutory rule ${ruleId}?`)) return;
    try {
      await deleteAdminRule(ruleId);
      setRules(rules.filter(r => r.id !== ruleId));
    } catch (err) {
      alert('Error deleting rule: ' + err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const updated = await updateAdminRule(editingRule.id, formData);
        setRules(rules.map(r => r.id === updated.id ? updated : r));
      } else {
        const created = await createAdminRule(formData);
        setRules([...rules, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Error saving rule: ' + err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Legal Metrology Rules Engine Manager
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic validation clauses under Packaged Commodities Rules, 2011 & Amendments
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadRules}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 bg-[#0F2942] hover:bg-[#1E3A8A] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Statutory Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Rule Code & Clause</th>
                <th className="p-3">Statutory Declaration Title</th>
                <th className="p-3">Target Field</th>
                <th className="p-3">Legal Severity</th>
                <th className="p-3">Mandatory</th>
                <th className="p-3">Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading Legal Metrology rules...
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-900">{rule.id}</span>
                      <div className="text-[11px] text-blue-700 font-semibold">{rule.legal_clause}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{rule.rule_name}</div>
                      <p className="text-[10px] text-slate-500 mt-0.5 max-w-md">{rule.description}</p>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{rule.field_target}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : rule.severity === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold ${rule.is_mandatory ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {rule.is_mandatory ? 'YES' : 'OPTIONAL'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`w-2 h-2 rounded-full inline-block ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300">
            <div className="bg-[#0F2942] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingRule ? `Edit Rule: ${editingRule.id}` : 'Create Statutory Compliance Rule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Legal Clause</label>
                  <input
                    type="text"
                    value={formData.legal_clause}
                    onChange={(e) => setFormData({ ...formData, legal_clause: e.target.value })}
                    placeholder="e.g. Rule 6(1)(a)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Field Key</label>
                  <select
                    value={formData.field_target}
                    onChange={(e) => setFormData({ ...formData, field_target: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white outline-none"
                  >
                    <option value="mrp">MRP & Unit Sale Price</option>
                    <option value="net_quantity">Net Quantity</option>
                    <option value="mfg_date">Month & Year of Mfg</option>
                    <option value="expiry_date">Best Before / Expiry</option>
                    <option value="country_origin">Country of Origin</option>
                    <option value="mfg_address">Manufacturer Address</option>
                    <option value="consumer_care">Consumer Redressal</option>
                    <option value="generic_name">Generic Commodity Name</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Declaration Title</label>
                <input
                  type="text"
                  value={formData.rule_name}
                  onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                  placeholder="e.g. Maximum Retail Price & Unit Sale Price"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Statutory Requirement Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed description of the legal declaration requirement..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enforcement Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white outline-none font-medium"
                  >
                    <option value="CRITICAL">CRITICAL (Seizure & Notice)</option>
                    <option value="HIGH">HIGH (Notice Issued)</option>
                    <option value="MEDIUM">MEDIUM (Warning Rectification)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penalty Legislation</label>
                  <input
                    type="text"
                    value={formData.penalty_clause}
                    onChange={(e) => setFormData({ ...formData, penalty_clause: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Mandatory Declaration</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Rule Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold"
                >
                  Save Statutory Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
