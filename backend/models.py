import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="inspector")  # admin, inspector, reviewer, operator
    status = Column(String(50), default="ACTIVE")  # ACTIVE, INACTIVE, BLOCKED
    department = Column(String(100), default="Department of Legal Metrology")
    badge_number = Column(String(50), default="GOV-8821")
    last_active_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("ScanSession", foreign_keys="ScanSession.user_id", back_populates="user")
    reviews = relationship("ScanSession", foreign_keys="ScanSession.assigned_to_user_id", back_populates="assigned_reviewer")

class ScanSession(Base):
    __tablename__ = "scan_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    assigned_to_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    product_name = Column(String(200), nullable=False)
    category = Column(String(100), default="Packaged Food, Edible Oils & Confectionery")
    image_filename = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    status = Column(String(50), default="completed")  # pending, completed, failed
    workflow_status = Column(String(50), default="NEW")  # NEW, PROCESSING, UNDER_REVIEW, COMPLETED, REJECTED, NOTICE_ISSUED
    overall_verdict = Column(String(50), default="PENDING")  # COMPLIANT, NON_COMPLIANT, INCONCLUSIVE
    compliance_score = Column(Float, default=0.0)  # 0 to 100
    confidence_score = Column(Float, default=0.0)  # 0 to 1.0
    report_filename = Column(String(255), nullable=True)
    report_url = Column(String(500), nullable=True)
    sha256_hash = Column(String(64), nullable=True)
    packaging_images = Column(JSON, nullable=True)  # [{"url": "/uploads/...", "filename": "...", "angle": "Front Panel"}]
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="scans")
    assigned_reviewer = relationship("User", foreign_keys=[assigned_to_user_id], back_populates="reviews")
    extracted_fields = relationship("ExtractedField", back_populates="scan", cascade="all, delete-orphan")
    violations = relationship("Violation", back_populates="scan", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="scan", cascade="all, delete-orphan")

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scan_sessions.id"), nullable=False)
    field_type = Column(String(50), nullable=False)  # mrp, net_quantity, mfg_date, expiry_date, country_origin, mfg_address, consumer_care, generic_name
    field_label = Column(String(100), nullable=False)
    raw_text = Column(Text, nullable=True)
    normalized_value = Column(String(255), nullable=True)
    bbox = Column(JSON, nullable=True)  # {"x": 10, "y": 20, "w": 30, "h": 15}
    image_index = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    confidence = Column(Float, default=0.0)
    is_valid = Column(Boolean, default=False)
    validation_message = Column(String(255), nullable=True)

    scan = relationship("ScanSession", back_populates="extracted_fields")


class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(String(50), primary_key=True)  # e.g., "LMR-01"
    rule_name = Column(String(150), nullable=False)
    legal_clause = Column(String(100), nullable=False)  # e.g., "Rule 6(1)(a)"
    field_target = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    is_mandatory = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    severity = Column(String(50), default="CRITICAL")  # CRITICAL, HIGH, MEDIUM
    penalty_clause = Column(String(200), default="Section 39 / Section 49, Legal Metrology Act, 2009")
    created_at = Column(DateTime, default=datetime.utcnow)

    violations = relationship("Violation", back_populates="rule")

class Violation(Base):
    __tablename__ = "violations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scan_sessions.id"), nullable=False)
    rule_id = Column(String(50), ForeignKey("compliance_rules.id"), nullable=False)
    field_type = Column(String(50), nullable=False)
    clause = Column(String(100), nullable=False)
    issue_title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="CRITICAL")
    evidence_snippet = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("ScanSession", back_populates="violations")
    rule = relationship("ComplianceRule", back_populates="violations")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scan_sessions.id"), nullable=True)
    actor_email = Column(String(100), default="admin@consumer.gov.in")
    actor_role = Column(String(50), default="admin")
    action = Column(String(100), nullable=False)  # USER_CREATED, RULE_MODIFIED, SCAN_REVIEWED, SETTING_CHANGED
    entity_type = Column(String(50), default="SCAN")  # USER, RULE, SCAN, SETTING, SYSTEM
    entity_id = Column(String(50), nullable=True)
    sha256_hash = Column(String(64), nullable=True)
    description = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow)

    scan = relationship("ScanSession", back_populates="audit_logs")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True)
    value = Column(String(255), nullable=False)
    category = Column(String(50), default="GENERAL")  # GENERAL, OCR, ENFORCEMENT, NOTIFICATIONS
    description = Column(Text, nullable=True)
    updated_by = Column(String(100), default="admin@consumer.gov.in")
    updated_at = Column(DateTime, default=datetime.utcnow)

class SystemAlert(Base):
    __tablename__ = "system_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    severity = Column(String(20), default="INFO")  # INFO, WARNING, CRITICAL
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="COMPLIANCE")  # COMPLIANCE, SYSTEM, SECURITY, AI
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AiMetricLog(Base):
    __tablename__ = "ai_metric_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    operation = Column(String(50), default="OCR_EXTRACTION")
    model_name = Column(String(100), default="OpenCV-Tesseract-RegexEngine-v2.1")
    latency_ms = Column(Float, default=120.0)
    confidence_avg = Column(Float, default=0.92)
    fields_extracted = Column(Integer, default=7)
    status = Column(String(20), default="SUCCESS")  # SUCCESS, FALLBACK, ERROR
    timestamp = Column(DateTime, default=datetime.utcnow)
