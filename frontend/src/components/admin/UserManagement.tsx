import React, { useState, useEffect } from 'react';
import { Users, Search, UserX, UserCheck, Edit2, RefreshCw } from 'lucide-react';
import type { User } from '../../types';
import { fetchAdminUsers, updateAdminUser, toggleUserStatus } from '../../services/api';
import { type Language } from '../../i18n/translations';

interface Props {
  lang: Language;
}

export function UserManagement({ }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers(search, roleFilter, statusFilter);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const updated = await toggleUserStatus(user.id);
      setUsers(users.map(u => u.id === updated.id ? updated : u));
    } catch (err) {
      alert('Error updating user status: ' + err);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updated = await updateAdminUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        status: editingUser.status,
        department: editingUser.department,
        badge_number: editingUser.badge_number
      });
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      setEditingUser(null);
    } catch (err) {
      alert('Error updating user: ' + err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Official User & Inspector Directory
            </h2>
            <p className="text-xs text-slate-500">
              Manage enforcement officers, roles, badges, and departmental clearances
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search officer or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 outline-none"
            />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700"
          >
            <option value="ALL">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="inspector">Inspector</option>
            <option value="reviewer">Reviewer</option>
            <option value="operator">Operator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Suspended</option>
          </select>

          <button
            onClick={loadUsers}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Official Name & Badge</th>
                <th className="p-3">Government Email</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Department Division</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading official users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">Badge: {user.badge_number || 'N/A'}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.role === 'inspector'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : user.role === 'reviewer'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-[200px] truncate">{user.department || 'Department of Legal Metrology'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Role & Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded transition-colors ${
                          user.status === 'ACTIVE'
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                      >
                        {user.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-300">
            <div className="bg-[#0F2942] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Official Clearance</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-300 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-100 rounded text-slate-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white outline-none"
                  >
                    <option value="admin">Administrator</option>
                    <option value="inspector">Inspector</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="operator">Operator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BLOCKED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Division</label>
                <input
                  type="text"
                  value={editingUser.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Badge Number</label>
                <input
                  type="text"
                  value={editingUser.badge_number || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, badge_number: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
