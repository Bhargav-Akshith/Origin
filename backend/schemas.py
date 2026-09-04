from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Auth & User Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "inspector"
    department: Optional[str] = "Department of Legal Metrology"
    badge_number: Optional[str] = "GOV-8821"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    department: Optional[str] = None
    badge_number: Optional[str] = None
    last_active_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    department: Optional[str] = None
    badge_number: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Bounding box schema
class BoundingBox(BaseModel):
    x: float
    y: float
    w: float
    h: float

# Extracted field
class ExtractedFieldSchema(BaseModel):
    id: Optional[str] = None
    field_type: str
    field_label: str
    raw_text: Optional[str] = None
    normalized_value: Optional[str] = None
    bbox: Optional[BoundingBox] = None
    confidence: float
    is_valid: bool
    validation_message: Optional[str] = None

    model_config = {"from_attributes": True}

# Violation
class ViolationSchema(BaseModel):
    id: Optional[str] = None
    rule_id: str
    field_type: str
    clause: str
    issue_title: str
    description: str
    severity: str
    evidence_snippet: Optional[str] = None

    model_config = {"from_attributes": True}

# Audit Log
class AuditLogSchema(BaseModel):
    id: Optional[str] = None
    scan_id: Optional[str] = None
    actor_email: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    sha256_hash: Optional[str] = None
    description: Optional[str] = None
    ip_address: Optional[str] = "127.0.0.1"
    timestamp: datetime

    model_config = {"from_attributes": True}

# Scan Session
class ScanSessionResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    assigned_to_user_id: Optional[str] = None
    product_name: str
    category: str
    image_filename: str
    image_url: str
    status: str
    workflow_status: str
    overall_verdict: str
    compliance_score: float
    confidence_score: float
    report_filename: Optional[str] = None
    report_url: Optional[str] = None
    sha256_hash: Optional[str] = None
    reviewer_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    extracted_fields: List[ExtractedFieldSchema] = []
    violations: List[ViolationSchema] = []
    audit_logs: List[AuditLogSchema] = []

    model_config = {"from_attributes": True}

# Scan Review Request
class ScanReviewRequest(BaseModel):
    workflow_status: str  # NEW, PROCESSING, UNDER_REVIEW, COMPLETED, REJECTED, NOTICE_ISSUED
    overall_verdict: Optional[str] = None
    reviewer_notes: Optional[str] = None
    assigned_to_user_id: Optional[str] = None

# Compliance Rule
class ComplianceRuleSchema(BaseModel):
    id: str
    rule_name: str
    legal_clause: str
    field_target: str
    description: str
    is_mandatory: bool
    is_active: bool = True
    severity: str
    penalty_clause: Optional[str] = None

    model_config = {"from_attributes": True}

class ComplianceRuleCreateUpdate(BaseModel):
    rule_name: str
    legal_clause: str
    field_target: str
    description: str
    is_mandatory: bool = True
    is_active: bool = True
    severity: str = "CRITICAL"
    penalty_clause: Optional[str] = "Section 39 / Section 49, Legal Metrology Act, 2009"

# System Setting
class SystemSettingSchema(BaseModel):
    key: str
    value: str
    category: str
    description: Optional[str] = None
    updated_by: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class SystemSettingUpdate(BaseModel):
    value: str
    category: Optional[str] = None
    description: Optional[str] = None

# System Alert
class SystemAlertSchema(BaseModel):
    id: str
    severity: str
    title: str
    message: str
    category: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}

# AI Diagnostics
class AiMetricLogSchema(BaseModel):
    id: str
    operation: str
    model_name: str
    latency_ms: float
    confidence_avg: float
    fields_extracted: int
    status: str
    timestamp: datetime

    model_config = {"from_attributes": True}

class AiDiagnosticsResponse(BaseModel):
    total_ai_requests: int
    avg_latency_ms: float
    overall_confidence_avg: float
    active_model: str
    success_rate: float
    recent_metrics: List[AiMetricLogSchema]

# Admin Dashboard Stats
class AdminDashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_inspections: int
    compliant_count: int
    non_compliant_count: int
    compliance_rate: float
    pending_reviews_count: int
    critical_breaches_count: int
    avg_ai_latency_ms: float
    system_health_status: str
    recent_scans: List[ScanSessionResponse]
    recent_audit_logs: List[AuditLogSchema]
    active_alerts: List[SystemAlertSchema]

# Demo Preset
class DemoSkuPreset(BaseModel):
    id: str
    title: str
    brand: str
    category: str
    description: str
    expected_verdict: str
    image_name: str
    violations_summary: List[str]
