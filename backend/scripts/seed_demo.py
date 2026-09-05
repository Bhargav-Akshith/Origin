import os
import sys
import uuid
from datetime import datetime, timedelta

# Append backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal, Base
import models
from services.auth_service import hash_password
from services.rule_engine import RuleEngineService
from services.report_service import ReportService


def seed_database():
    print("[*] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Official Users & Roles
        users_data = [
            {
                "id": "USR-ADMIN-01",
                "name": "Chief Controller of Legal Metrology",
                "email": "admin@consumer.gov.in",
                "password_hash": hash_password("Admin@2026"),
                "role": "admin",
                "status": "ACTIVE",
                "department": "Central Legal Metrology Enforcement Directorate",
                "badge_number": "CLM-GOV-01"
            },
            {
                "id": "USR-INSPECT-01",
                "name": "Inspector Rajesh Sharma",
                "email": "inspector.sharma@consumer.gov.in",
                "password_hash": hash_password("Inspect@2026"),
                "role": "inspector",
                "status": "ACTIVE",
                "department": "State Enforcement Division — North Zone",
                "badge_number": "GOV-8821"
            },
            {
                "id": "USR-INSPECT-02",
                "name": "Inspector Amit Patel",
                "email": "inspector.patel@consumer.gov.in",
                "password_hash": hash_password("Inspect@2026"),
                "role": "inspector",
                "status": "ACTIVE",
                "department": "Port & Customs Inspection Cell — West Zone",
                "badge_number": "GOV-8822"
            },
            {
                "id": "USR-INSPECT-03",
                "name": "Inspector Vikram Singh",
                "email": "inspector.singh@consumer.gov.in",
                "password_hash": hash_password("Inspect@2026"),
                "role": "inspector",
                "status": "ACTIVE",
                "department": "E-Commerce & Digital Pre-Pack Surveillance Wing",
                "badge_number": "GOV-8823"
            }
        ]

        for u in users_data:
            existing_user = db.query(models.User).filter(models.User.email == u["email"]).first()
            if not existing_user:
                db.add(models.User(**u))
                print(f"  [OK] Seeded User: {u['name']} ({u['role']} - {u['email']})")
            else:
                existing_user.name = u["name"]
                existing_user.role = u["role"]
                existing_user.status = u["status"]
                existing_user.department = u["department"]
                existing_user.badge_number = u["badge_number"]
                existing_user.password_hash = u["password_hash"]

        # Clean up any legacy non-admin/non-inspector roles
        db.query(models.User).filter(~models.User.role.in_(["admin", "inspector"])).update({"role": "inspector"}, synchronize_session=False)

        # 2. Seed Compliance Rules
        for r in RuleEngineService.LEGAL_METROLOGY_RULES:
            existing_rule = db.query(models.ComplianceRule).filter(models.ComplianceRule.id == r["id"]).first()
            if not existing_rule:
                rule_entry = models.ComplianceRule(
                    id=r["id"],
                    rule_name=r["rule_name"],
                    legal_clause=r["legal_clause"],
                    field_target=r["field_target"],
                    description=r["description"],
                    is_mandatory=r["is_mandatory"],
                    is_active=True,
                    severity=r["severity"],
                    penalty_clause="Section 39 / Section 49, Legal Metrology Act, 2009"
                )
                db.add(rule_entry)

        # 3. Seed System Settings
        default_settings = [
            ("ENFORCEMENT_STRICTNESS", "STRICT", "ENFORCEMENT", "Determines whether missing unit price issues an immediate Section 39 seizure notice."),
            ("OCR_MIN_CONFIDENCE_THRESHOLD", "0.75", "OCR", "Minimum optical character recognition confidence score before requiring secondary verification."),
            ("AUTO_NOTICE_GENERATION", "ENABLED", "ENFORCEMENT", "Automatically draft Section 39 legal notice PDF upon detecting Critical breaches."),
            ("MAX_UPLOAD_SIZE_MB", "25", "GENERAL", "Maximum physical packaging photo upload size allowed in megabytes."),
            ("DEFAULT_INSPECTION_WINDOW_DAYS", "15", "GENERAL", "Statutory period granted to manufacturers to submit compliance rectification statements.")
        ]
        for k, v, c, d in default_settings:
            existing_set = db.query(models.SystemSetting).filter(models.SystemSetting.key == k).first()
            if not existing_set:
                db.add(models.SystemSetting(key=k, value=v, category=c, description=d, updated_by="admin@consumer.gov.in"))

        # 4. Seed System Alerts
        sample_alerts = [
            ("CRITICAL", "Repeated Missing Origin Violations Flagged", "Multiple smart electronics batches imported without mandatory Rule 6(1)(n) declarations.", "COMPLIANCE"),
            ("WARNING", "Unit Sale Price (USP) Mathematical Discrepancy", "Automated scan detected 3 SKUs with inverted gram-to-kilogram USP ratios.", "COMPLIANCE"),
            ("INFO", "Central Enforcement OCR Engine Active", "Version 2.3 deployed with Multi-Image Evidence Fusion and CLAHE contrast enhancement.", "SYSTEM")
        ]
        for sev, title, msg, cat in sample_alerts:
            alt_exists = db.query(models.SystemAlert).filter(models.SystemAlert.title == title).first()
            if not alt_exists:
                db.add(models.SystemAlert(id=str(uuid.uuid4()), severity=sev, title=title, message=msg, category=cat, is_read=False))

        # 5. Seed Benchmark Scans & Physical PDF Certificates
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        reports_dir = os.path.join(base_dir, "reports")
        os.makedirs(reports_dir, exist_ok=True)

        demo_scans = [
            {
                "id": "DEMO-BISCUITS-01",
                "user_id": "USR-INSPECT-01",
                "product_name": "Astra Gold Digestive Biscuits 500g",
                "category": "Packaged Food, Edible Oils & Confectionery",
                "image_filename": "demo_compliant_biscuits.jpg",
                "image_url": "/demo_assets/demo_compliant_biscuits.jpg",
                "packaging_images": [
                    {"image_index": 0, "filename": "demo_compliant_biscuits.jpg", "url": "/demo_assets/demo_compliant_biscuits.jpg", "angle_label": "Angle 1: Front Principal Display Panel (Brand & Net Qty)"},
                    {"image_index": 1, "filename": "demo_compliant_biscuits.jpg", "url": "/demo_assets/demo_compliant_biscuits.jpg", "angle_label": "Angle 2: Back Panel (MRP, USP & Manufacturer Info)"}
                ],
                "status": "completed",
                "workflow_status": "COMPLETED",
                "overall_verdict": "COMPLIANT",
                "compliance_score": 100.0,
                "confidence_score": 0.98,
                "report_filename": "certificate_DEMO-BISCUITS-01.pdf",
                "report_url": "/reports/certificate_DEMO-BISCUITS-01.pdf",
                "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "reviewer_notes": "All 7 statutory declarations verified. Unit Sale Price conforms to metric scale.",
                "reviewed_by": "Chief Controller of Legal Metrology",
                "reviewed_at": datetime.now()
            },
            {
                "id": "DEMO-SNACKS-02",
                "user_id": "USR-INSPECT-02",
                "product_name": "Crispy Waves Potato Wafers 200g",
                "category": "Packaged Food, Edible Oils & Confectionery",
                "image_filename": "demo_violation_mrp_usp.jpg",
                "image_url": "/demo_assets/demo_violation_mrp_usp.jpg",
                "packaging_images": [
                    {"image_index": 0, "filename": "demo_violation_mrp_usp.jpg", "url": "/demo_assets/demo_violation_mrp_usp.jpg", "angle_label": "Angle 1: Front Panel (Commodity Name)"},
                    {"image_index": 1, "filename": "demo_violation_mrp_usp.jpg", "url": "/demo_assets/demo_violation_mrp_usp.jpg", "angle_label": "Angle 2: Rear Panel (Missing Tax Statement & USP)"}
                ],
                "status": "completed",
                "workflow_status": "NOTICE_ISSUED",
                "overall_verdict": "NON_COMPLIANT",
                "compliance_score": 62.5,
                "confidence_score": 0.94,
                "report_filename": "certificate_DEMO-SNACKS-02.pdf",
                "report_url": "/reports/certificate_DEMO-SNACKS-02.pdf",
                "sha256_hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
                "reviewer_notes": "Section 39 Notice drafted for missing tax declaration and omitted consumer redressal email.",
                "reviewed_by": "Chief Controller of Legal Metrology",
                "reviewed_at": datetime.now()
            },
            {
                "id": "DEMO-LOTION-03",
                "user_id": "USR-INSPECT-03",
                "product_name": "GlowSilk Herbal Body Lotion 250ml",
                "category": "Cosmetics, Soaps & Personal Hygiene",
                "image_filename": "demo_violation_origin.jpg",
                "image_url": "/demo_assets/demo_violation_origin.jpg",
                "packaging_images": [
                    {"image_index": 0, "filename": "demo_violation_origin.jpg", "url": "/demo_assets/demo_violation_origin.jpg", "angle_label": "Angle 1: Front Panel"},
                    {"image_index": 1, "filename": "demo_violation_origin.jpg", "url": "/demo_assets/demo_violation_origin.jpg", "angle_label": "Angle 2: Back Panel (Omitted Country of Origin)"}
                ],
                "status": "completed",
                "workflow_status": "UNDER_REVIEW",
                "overall_verdict": "NON_COMPLIANT",
                "compliance_score": 75.0,
                "confidence_score": 0.96,
                "report_filename": "certificate_DEMO-LOTION-03.pdf",
                "report_url": "/reports/certificate_DEMO-LOTION-03.pdf",
                "sha256_hash": "f9e8d7c6b5a43210fedcba9876543210fedcba9876543210fedcba9876543210",
                "reviewer_notes": "Pending manufacturer country of origin proof under Rule 6(1)(n).",
                "reviewed_by": "Chief Controller of Legal Metrology",
                "reviewed_at": datetime.now()
            }
        ]

        for scan_data in demo_scans:
            existing_scan = db.query(models.ScanSession).filter(models.ScanSession.id == scan_data["id"]).first()
            if not existing_scan:
                scan_obj = models.ScanSession(**scan_data)
                db.add(scan_obj)

                # Add Audit log
                audit = models.AuditLog(
                    id=str(uuid.uuid4()),
                    scan_id=scan_data["id"],
                    actor_email="inspector.sharma@consumer.gov.in",
                    actor_role="inspector",
                    action="COMMODITY_INSPECTED",
                    entity_type="SCAN",
                    entity_id=scan_data["id"],
                    sha256_hash=scan_data["sha256_hash"],
                    description=f"Automated statutory inspection completed for {scan_data['product_name']}."
                )
                db.add(audit)

            # Generate physical PDF on disk
            pdf_path = os.path.join(reports_dir, scan_data["report_filename"])
            ReportService.generate_inspection_certificate(
                scan_id=scan_data["id"],
                product_name=scan_data["product_name"],
                category=scan_data["category"],
                verdict=scan_data["overall_verdict"],
                compliance_score=scan_data["compliance_score"],
                fields=[],
                violations=[],
                output_path=pdf_path,
                inspector_id="GOV-8821"
            )

        db.commit()
        print("[SUCCESS] Database seed completed successfully with verified 2-role hierarchy and generated PDF certificates!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
