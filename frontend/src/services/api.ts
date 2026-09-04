import type {
  ScanSession,
  AdminDashboardStats,
  DemoSkuPreset,
  ComplianceRule,
  User,
  TokenResponse,
  SystemSetting,
  SystemAlert,
  AiDiagnostics,
  AuditLog
} from '../types';

const API_BASE = '/api/v1';

// Token storage helper
let currentToken: string | null = localStorage.getItem('sih_auth_token');

export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (token) {
    localStorage.setItem('sih_auth_token', token);
  } else {
    localStorage.removeItem('sih_auth_token');
  }
};

export const getAuthToken = () => currentToken;

const getHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
};

// ---------------------------------------------------------------------------
// AUTHENTICATION APIs
// ---------------------------------------------------------------------------

export const loginUser = async (email: string, password: string): Promise<TokenResponse> => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  const data: TokenResponse = await res.json();
  setAuthToken(data.access_token);
  return data;
};

export const switchDemoRole = async (role: string): Promise<TokenResponse> => {
  const res = await fetch(`${API_BASE}/auth/switch-demo-role/${role}`);
  if (!res.ok) throw new Error('Role switch failed');
  const data: TokenResponse = await res.json();
  setAuthToken(data.access_token);
  return data;
};

export const getMe = async (): Promise<User> => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Session expired');
  return res.json();
};

// ---------------------------------------------------------------------------
// ADMIN APIs
// ---------------------------------------------------------------------------

export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch admin dashboard metrics');
  return res.json();
};

export const fetchAdminUsers = async (search = '', role = 'ALL', statusFilter = 'ALL'): Promise<User[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role !== 'ALL') params.append('role', role);
  if (statusFilter !== 'ALL') params.append('status_filter', statusFilter);

  const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch user directory');
  return res.json();
};

export const updateAdminUser = async (userId: string, updateData: Partial<User>): Promise<User> => {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
};

export const toggleUserStatus = async (userId: string): Promise<User> => {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-status`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to toggle user status');
  return res.json();
};

export const fetchAdminRules = async (): Promise<ComplianceRule[]> => {
  const res = await fetch(`${API_BASE}/admin/rules`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch compliance rules');
  return res.json();
};

export const createAdminRule = async (ruleData: Omit<ComplianceRule, 'id'>): Promise<ComplianceRule> => {
  const res = await fetch(`${API_BASE}/admin/rules`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(ruleData)
  });
  if (!res.ok) throw new Error('Failed to create statutory rule');
  return res.json();
};

export const updateAdminRule = async (ruleId: string, ruleData: Partial<ComplianceRule>): Promise<ComplianceRule> => {
  const res = await fetch(`${API_BASE}/admin/rules/${ruleId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(ruleData)
  });
  if (!res.ok) throw new Error('Failed to update rule');
  return res.json();
};

export const deleteAdminRule = async (ruleId: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/admin/rules/${ruleId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete rule');
};

export const fetchAdminSubmissions = async (workflow_status = 'ALL', verdict = 'ALL', search = ''): Promise<ScanSession[]> => {
  const params = new URLSearchParams();
  if (workflow_status !== 'ALL') params.append('workflow_status', workflow_status);
  if (verdict !== 'ALL') params.append('verdict', verdict);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/admin/submissions?${params.toString()}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
};

export const reviewSubmission = async (
  scanId: string,
  workflow_status: string,
  reviewer_notes?: string,
  overall_verdict?: string
): Promise<ScanSession> => {
  const res = await fetch(`${API_BASE}/admin/scans/${scanId}/review`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ workflow_status, reviewer_notes, overall_verdict })
  });
  if (!res.ok) throw new Error('Failed to update submission review');
  return res.json();
};

export const fetchAiDiagnostics = async (): Promise<AiDiagnostics> => {
  const res = await fetch(`${API_BASE}/admin/ai-metrics`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch AI diagnostics');
  return res.json();
};

export const fetchAuditLogs = async (action = 'ALL', limit = 50): Promise<AuditLog[]> => {
  const params = new URLSearchParams();
  if (action !== 'ALL') params.append('action', action);
  params.append('limit', limit.toString());

  const res = await fetch(`${API_BASE}/admin/audit-logs?${params.toString()}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch audit trail');
  return res.json();
};

export const fetchSystemSettings = async (): Promise<SystemSetting[]> => {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const updateSystemSetting = async (key: string, value: string, description?: string): Promise<SystemSetting> => {
  const res = await fetch(`${API_BASE}/admin/settings/${key}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ value, description })
  });
  if (!res.ok) throw new Error('Failed to update setting');
  return res.json();
};

export const fetchSystemAlerts = async (severity = 'ALL'): Promise<SystemAlert[]> => {
  const params = new URLSearchParams();
  if (severity !== 'ALL') params.append('severity', severity);

  const res = await fetch(`${API_BASE}/admin/alerts?${params.toString()}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
};

export const markAlertAsRead = async (alertId: string): Promise<SystemAlert> => {
  const res = await fetch(`${API_BASE}/admin/alerts/${alertId}/read`, {
    method: 'PUT',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to update alert');
  return res.json();
};

// ---------------------------------------------------------------------------
// USER / INSPECTOR APIs
// ---------------------------------------------------------------------------

export const fetchRules = async (): Promise<ComplianceRule[]> => {
  const res = await fetch(`${API_BASE}/rules`);
  if (!res.ok) throw new Error('Failed to fetch rules');
  return res.json();
};

export const fetchDemoSkus = async (): Promise<DemoSkuPreset[]> => {
  const res = await fetch(`${API_BASE}/demo-skus`);
  if (!res.ok) throw new Error('Failed to fetch benchmark SKUs');
  return res.json();
};

export const fetchDashboardMetrics = async (): Promise<AdminDashboardStats> => {
  const res = await fetch(`${API_BASE}/dashboard/metrics`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
};

export const fetchScans = async (): Promise<ScanSession[]> => {
  const res = await fetch(`${API_BASE}/scans`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch inspection history');
  return res.json();
};

export const fetchScanDetails = async (scanId: string): Promise<ScanSession> => {
  const res = await fetch(`${API_BASE}/scans/${scanId}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch inspection record');
  return res.json();
};

export const uploadPackagingImage = async (
  file: File,
  productName: string,
  category: string
): Promise<ScanSession> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('product_name', productName);
  formData.append('category', category);

  const res = await fetch(`${API_BASE}/scans/upload`, {
    method: 'POST',
    headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : undefined,
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Upload and processing failed');
  }

  return res.json();
};

export const getReportPdfUrl = (scanId: string) => `${API_BASE}/scans/${scanId}/pdf`;
