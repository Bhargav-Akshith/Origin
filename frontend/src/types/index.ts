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

export interface ScanSession {
  id: string;
  product_name: string;
  category: string;
  image_url: string;
  status: string;
  overall_verdict: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  compliance_score: number;
  confidence_score: number;
  report_url: string | null;
  sha256_hash: string | null;
  created_at: string;
  extracted_fields: ExtractedField[];
  violations: Violation[];
}

export interface DashboardMetrics {
  total_inspections: number;
  compliant_count: number;
  non_compliant_count: number;
  compliance_rate: number;
  critical_violations_count: number;
  recent_scans: ScanSession[];
}

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
