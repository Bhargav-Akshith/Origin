import type { DashboardMetrics, DemoSkuPreset, ScanSession } from '../types';

const API_BASE = '/api/v1';

export const ApiService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/dashboard/metrics`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  async getDemoSkus(): Promise<DemoSkuPreset[]> {
    const res = await fetch(`${API_BASE}/demo-skus`);
    if (!res.ok) throw new Error('Failed to fetch demo SKUs');
    return res.json();
  },

  async getScanDetails(scanId: string): Promise<ScanSession> {
    const res = await fetch(`${API_BASE}/scans/${scanId}`);
    if (!res.ok) throw new Error('Failed to fetch scan details');
    return res.json();
  },

  async uploadAndProcess(file: File, productName: string, category: string): Promise<ScanSession> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('product_name', productName);
    formData.append('category', category);

    const res = await fetch(`${API_BASE}/scans/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to process packaging inspection');
    }
    return res.json();
  }
};
