from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: float = Field(..., description="X coordinate percentage 0-100")
    y: float = Field(..., description="Y coordinate percentage 0-100")
    w: float = Field(..., description="Width percentage 0-100")
    h: float = Field(..., description="Height percentage 0-100")
    model_config = {"from_attributes": True}

class ExtractedFieldSchema(BaseModel):
    id: Optional[str] = None
    field_type: str
    field_label: str
    raw_text: Optional[str] = None
    normalized_value: Optional[str] = None
    bbox: Optional[Dict[str, Any]] = None
    confidence: float = 0.0
    is_valid: bool = False
    validation_message: Optional[str] = None
    model_config = {"from_attributes": True}

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

class ScanSessionResponse(BaseModel):
    id: str
    product_name: str
    category: str
    image_url: str
    status: str
    overall_verdict: str
    compliance_score: float
    confidence_score: float
    report_url: Optional[str] = None
    sha256_hash: Optional[str] = None
    created_at: datetime
    extracted_fields: List[ExtractedFieldSchema] = []
    violations: List[ViolationSchema] = []

    model_config = {"from_attributes": True}

class ComplianceRuleSchema(BaseModel):
    id: str
    rule_name: str
    legal_clause: str
    field_target: str
    description: str
    is_mandatory: bool
    severity: str

    model_config = {"from_attributes": True}

class DashboardMetrics(BaseModel):
    total_inspections: int
    compliant_count: int
    non_compliant_count: int
    compliance_rate: float
    critical_violations_count: int
    recent_scans: List[ScanSessionResponse] = []

class DemoSkuPreset(BaseModel):
    id: str
    title: str
    brand: str
    category: str
    description: str
    expected_verdict: str
    image_name: str
    violations_summary: List[str]
