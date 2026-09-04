export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ExtractedField {
  id?: string;
  field_type: string;
  field_label: string;
  raw_text: string | null;
  normalized_value: string | null;
  bbox: BoundingBox | null;
  confidence: number;
  is_valid: boolean;
  validation_message: string | null;
}

export interface Violation {
  id?: string;
  rule_id: string;
  field_type: string;
  clause: string;
  issue_title: string;
  description: string;
  severity: string;
  evidence_snippet: string | null;
}

export interface AuditLog {
  id?: string;
  scan_id?: string | null;
  actor_email: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  sha256_hash?: string | null;
  description?: string | null;
  ip_address?: string;
  timestamp: string;
}

export interface ScanSession {
  id: string;
  user_id?: string | null;
  assigned_to_user_id?: string | null;
  product_name: string;
  category: string;
  image_filename?: string;
  image_url: string;
  status: string;
  workflow_status: 'NEW' | 'PROCESSING' | 'UNDER_REVIEW' | 'COMPLETED' | 'REJECTED' | 'NOTICE_ISSUED';
  overall_verdict: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  compliance_score: number;
  confidence_score: number;
  report_filename?: string | null;
  report_url: string | null;
  sha256_hash: string | null;
  reviewer_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  extracted_fields: ExtractedField[];
  violations: Violation[];
  audit_logs?: AuditLog[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'inspector' | 'reviewer' | 'operator';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  department?: string;
  badge_number?: string;
  last_active_at?: string;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ComplianceRule {
  id: string;
  rule_name: string;
  legal_clause: string;
  field_target: string;
  description: string;
  is_mandatory: boolean;
  is_active: boolean;
  severity: string;
  penalty_clause?: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  category: string;
  description?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface SystemAlert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
}

export interface AiMetricLog {
  id: string;
  operation: string;
  model_name: string;
  latency_ms: number;
  confidence_avg: number;
  fields_extracted: number;
  status: string;
  timestamp: string;
}

export interface AiDiagnostics {
  total_ai_requests: number;
  avg_latency_ms: number;
  overall_confidence_avg: number;
  active_model: string;
  success_rate: number;
  recent_metrics: AiMetricLog[];
}

export interface AdminDashboardStats {
  total_users: number;
  active_users: number;
  total_inspections: number;
  compliant_count: number;
  non_compliant_count: number;
  compliance_rate: number;
  pending_reviews_count: number;
  critical_breaches_count: number;
  avg_ai_latency_ms: number;
  system_health_status: string;
  recent_scans: ScanSession[];
  recent_audit_logs: AuditLog[];
  active_alerts: SystemAlert[];
}

export type DashboardMetrics = AdminDashboardStats;

export interface DemoSkuPreset {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  expected_verdict: string;
  image_name: string;
  violations_summary: string[];
}
