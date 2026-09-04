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
    role = Column(String(50), default="inspector")  # inspector, admin, auditor
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("ScanSession", back_populates="user")

class ScanSession(Base):
    __tablename__ = "scan_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    product_name = Column(String(200), nullable=False)
    category = Column(String(100), default="Packaged Food & Beverages")
    image_filename = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    status = Column(String(50), default="pending")  # pending, processed, failed
    overall_verdict = Column(String(50), default="PENDING")  # COMPLIANT, NON_COMPLIANT, INCONCLUSIVE
    compliance_score = Column(Float, default=0.0)  # 0 to 100
    confidence_score = Column(Float, default=0.0)  # 0 to 1.0
    report_filename = Column(String(255), nullable=True)
    report_url = Column(String(500), nullable=True)
    sha256_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scans")
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
    bbox = Column(JSON, nullable=True)  # {"x": 10, "y": 20, "w": 30, "h": 15} in percent
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
    severity = Column(String(50), default="CRITICAL")  # CRITICAL, HIGH, MEDIUM

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
    scan_id = Column(String(36), ForeignKey("scan_sessions.id"), nullable=False)
    action = Column(String(100), nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    inspector_id = Column(String(50), default="INSPECTOR-GOV-2026")
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    scan = relationship("ScanSession", back_populates="audit_logs")
