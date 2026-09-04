import os
import sys
from PIL import Image, ImageDraw, ImageFont

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from database import engine, SessionLocal, Base
from models import ComplianceRule, ScanSession, ExtractedField, Violation, User
from services.rule_engine import RuleEngineService
from services.report_service import ReportService

def draw_veg_icon(draw, x, y, size=18):
    # Standard Indian Green Veg Symbol (Square with green circle)
    draw.rectangle([(x, y), (x + size, y + size)], outline=(0, 140, 60), width=2)
    radius = size // 4
    center_x = x + size // 2
    center_y = y + size // 2
    draw.ellipse([(center_x - radius, center_y - radius), (center_x + radius, center_y + radius)], fill=(0, 140, 60))

def draw_barcode(draw, x, y, width=140, height=45):
    # Simulated GS1 Barcode
    draw.rectangle([(x, y), (x + width, y + height)], fill=(255, 255, 255), outline=(150, 150, 150))
    bar_x = x + 8
    import random
    random.seed(42)
    while bar_x < (x + width - 10):
        bar_w = random.choice([1, 2, 3])
        draw.rectangle([(bar_x, y + 4), (bar_x + bar_w, y + height - 12)], fill=(20, 20, 20))
        bar_x += bar_w + random.choice([2, 3, 4])
    draw.text((x + 20, y + height - 10), "8 901234 567890", fill=(50, 50, 50))

def create_demo_image(filename: str, title: str, brand: str, category: str, texts: list, bg_color=(250, 250, 248), accent_color=(15, 41, 66)):
    assets_dir = os.path.join(BASE_DIR, "demo_assets")
    os.makedirs(assets_dir, exist_ok=True)
    img_path = os.path.join(assets_dir, filename)

    img = Image.new("RGB", (900, 680), color=bg_color)
    draw = ImageDraw.Draw(img)

    # 1. Outer Border / Packaging Container
    draw.rectangle([(15, 15), (885, 665)], outline=(200, 205, 215), width=2)
    draw.rectangle([(25, 25), (875, 655)], outline=(225, 230, 240), width=1)

    # 2. Header Branding Banner
    draw.rectangle([(25, 25), (875, 95)], fill=accent_color)
    draw.text((45, 38), brand.upper(), fill=(217, 119, 6)) # Amber gold
    draw.text((45, 58), title, fill=(255, 255, 255))
    draw.text((680, 50), category.upper(), fill=(200, 220, 245))

    # 3. Veg Symbol & Product Badges
    draw_veg_icon(draw, 835, 45, size=24)

    # 4. Declarations Panel Box
    draw.rectangle([(40, 115), (860, 570)], fill=(255, 255, 255), outline=(210, 215, 225), width=1)
    draw.rectangle([(40, 115), (860, 145)], fill=(240, 243, 248))
    draw.text((55, 123), "PRINCIPAL STATUTORY DECLARATIONS (LEGAL METROLOGY ACT, 2009)", fill=(50, 65, 85))

    # 5. Draw Declarations Table Rows
    y = 160
    for idx, item in enumerate(texts):
        label = item.get("label", "")
        val = item.get("val", "")
        box = item.get("box", None)
        is_valid = item.get("valid", True)

        # Alternating subtle row shading
        if idx % 2 == 1:
            draw.rectangle([(42, y - 4), (858, y + 36)], fill=(248, 250, 252))

        draw.text((55, y + 4), f"{label}:", fill=(90, 100, 115))
        
        # Highlight non-compliant values with red text on image
        val_color = (15, 23, 42) if is_valid else (190, 24, 93)
        draw.text((280, y + 4), str(val), fill=val_color)

        if box:
            # Map percentage coordinates [0-100] to actual canvas pixel rectangle
            x1 = int(box["x"] * 9.0)
            y1 = int(box["y"] * 6.8)
            x2 = int((box["x"] + box["w"]) * 9.0)
            y2 = int((box["y"] + box["h"]) * 6.8)

            border_c = (5, 150, 105) if is_valid else (220, 38, 38)
            draw.rectangle([(x1, y1), (x2, y2)], outline=border_c, width=2)
            
            # Draw tiny label tag on box
            tag_text = "PASS" if is_valid else "VIOLATION"
            draw.rectangle([(x1, max(0, y1 - 16)), (x1 + 65, y1)], fill=border_c)
            draw.text((x1 + 6, max(2, y1 - 14)), tag_text, fill=(255, 255, 255))

        y += 44

    # 6. Bottom Panel: Barcode & Consumer Assurance Seal
    draw_barcode(draw, 55, 590, width=160, height=55)
    
    draw.rectangle([(700, 590), (860, 645)], fill=(240, 248, 244), outline=(180, 220, 200))
    draw.text((715, 600), "FSSAI LICENSED", fill=(5, 120, 85))
    draw.text((715, 620), "Lic. No: 10018022007891", fill=(60, 90, 75))

    img.save(img_path, quality=95)
    return img_path

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Seed Compliance Rules
    for r in RuleEngineService.LEGAL_METROLOGY_RULES:
        existing = db.query(ComplianceRule).filter(ComplianceRule.id == r["id"]).first()
        if not existing:
            rule_obj = ComplianceRule(
                id=r["id"],
                rule_name=r["rule_name"],
                legal_clause=r["legal_clause"],
                field_target=r["field_target"],
                description=r["description"],
                is_mandatory=r["is_mandatory"],
                severity=r["severity"]
            )
            db.add(rule_obj)
    db.commit()

    # 2. Curated Unique Demo SKUs (3 Distinct Product Categories)
    demo_skus = [
        {
            "id": "DEMO-BISCUITS-01",
            "filename": "demo_compliant_biscuits.jpg",
            "title": "Astra Gold 100% Whole Wheat Digestive Biscuits (500g)",
            "brand": "Astra Foods India",
            "category": "Packaged Food & Confectionery",
            "verdict": "COMPLIANT",
            "score": 100.0,
            "accent": (15, 41, 66),
            "texts": [
                {"label": "Generic Commodity Name", "val": "Whole Wheat Digestive Biscuits", "valid": True, "box": {"x": 5, "y": 23, "w": 40, "h": 6}},
                {"label": "Net Quantity / Standard Unit", "val": "500 g (Net Weight)", "valid": True, "box": {"x": 5, "y": 29, "w": 28, "h": 6}},
                {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 95.00 (incl. of all taxes) | USP Rs. 0.19 / g", "valid": True, "box": {"x": 5, "y": 35, "w": 88, "h": 6}},
                {"label": "Month & Year of Manufacture", "val": "02/2026", "valid": True, "box": {"x": 5, "y": 42, "w": 30, "h": 6}},
                {"label": "Best Before / Expiry Period", "val": "Best Before 9 Months from date of packaging", "valid": True, "box": {"x": 5, "y": 48, "w": 50, "h": 6}},
                {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 55, "w": 32, "h": 6}},
                {"label": "Manufacturer & Packer Address", "val": "Astra Foods Ltd., Plot 12, Chakan Industrial Estate, Pune 411001", "valid": True, "box": {"x": 5, "y": 61, "w": 90, "h": 6}},
                {"label": "Consumer Care Redressal Details", "val": "care@astrafoods.in | National Toll Free: 1800-200-4455", "valid": True, "box": {"x": 5, "y": 67, "w": 88, "h": 6}},
            ],
            "violations": []
        },
        {
            "id": "DEMO-SNACKS-02",
            "filename": "demo_violation_mrp_usp.jpg",
            "title": "Crispy Waves Tangy Masala Potato Wafers (200g)",
            "brand": "Crispy Snackworks",
            "category": "Packaged Snacks",
            "verdict": "NON_COMPLIANT",
            "score": 75.0,
            "accent": (140, 45, 25),
            "texts": [
                {"label": "Generic Commodity Name", "val": "Potato Chips & Wafers", "valid": True, "box": {"x": 5, "y": 23, "w": 35, "h": 6}},
                {"label": "Net Quantity / Standard Unit", "val": "200 g", "valid": True, "box": {"x": 5, "y": 29, "w": 25, "h": 6}},
                {"label": "MRP Declared", "val": "Rs. 60 [Missing 'incl. of all taxes' & Missing Unit Sale Price (USP)]", "valid": False, "box": {"x": 5, "y": 35, "w": 88, "h": 6}},
                {"label": "Month & Year of Manufacture", "val": "01/2026", "valid": True, "box": {"x": 5, "y": 42, "w": 28, "h": 6}},
                {"label": "Best Before / Expiry Period", "val": "Best Before 6 Months", "valid": True, "box": {"x": 5, "y": 48, "w": 35, "h": 6}},
                {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 55, "w": 32, "h": 6}},
                {"label": "Manufacturer & Packer Address", "val": "Crispy Foods Corp, Sector 4, IMT Manesar, Gurugram 122051", "valid": True, "box": {"x": 5, "y": 61, "w": 88, "h": 6}},
                {"label": "Consumer Care Redressal Details", "val": "[Consumer Redressal Officer Email & Phone Omitted]", "valid": False, "box": {"x": 5, "y": 67, "w": 70, "h": 6}},
            ],
            "violations": [
                {
                    "rule_id": "LMR-06",
                    "clause": "Rule 6(1)(e)",
                    "issue_title": "Non-Compliance: Maximum Retail Price (MRP) & USP",
                    "description": "Retail price printed without mandatory statutory '(incl. of all taxes)' phrase and omitted Unit Sale Price (USP per gram).",
                    "severity": "CRITICAL"
                },
                {
                    "rule_id": "LMR-07",
                    "clause": "Rule 6(1)(k)",
                    "issue_title": "Non-Compliance: Consumer Redressal Contacts",
                    "description": "Mandatory Consumer Grievance Redressal Officer contact details (Email ID & Telephone Helpline) omitted from packaging.",
                    "severity": "HIGH"
                }
            ]
        },
        {
            "id": "DEMO-LOTION-03",
            "filename": "demo_violation_origin.jpg",
            "title": "GlowSilk Intensive Herbal Nourishing Body Lotion (250ml)",
            "brand": "GlowSilk Cosmeceuticals",
            "category": "Personal Care & Cosmetics",
            "verdict": "NON_COMPLIANT",
            "score": 87.5,
            "accent": (45, 85, 60),
            "texts": [
                {"label": "Generic Commodity Name", "val": "Herbal Body Moisturizing Lotion", "valid": True, "box": {"x": 5, "y": 23, "w": 40, "h": 6}},
                {"label": "Net Quantity / Standard Unit", "val": "250 ml", "valid": True, "box": {"x": 5, "y": 29, "w": 25, "h": 6}},
                {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 299.00 (incl. of all taxes) | USP Rs. 1.20 / ml", "valid": True, "box": {"x": 5, "y": 35, "w": 88, "h": 6}},
                {"label": "Month & Year of Manufacture", "val": "11/2025", "valid": True, "box": {"x": 5, "y": 42, "w": 28, "h": 6}},
                {"label": "Best Before / Expiry Period", "val": "Use before 24 Months from manufacturing", "valid": True, "box": {"x": 5, "y": 48, "w": 48, "h": 6}},
                {"label": "Country of Origin", "val": "[MANDATORY COUNTRY OF ORIGIN DECLARATION OMITTED]", "valid": False, "box": {"x": 5, "y": 55, "w": 75, "h": 6}},
                {"label": "Manufacturer & Packer Address", "val": "Imported & Marketed by GlowSilk India Pvt Ltd, Nariman Point, Mumbai 400021", "valid": True, "box": {"x": 5, "y": 61, "w": 90, "h": 6}},
                {"label": "Consumer Care Redressal Details", "val": "support@glowsilk.in | Executive Helpline: 1800-444-9988", "valid": True, "box": {"x": 5, "y": 67, "w": 85, "h": 6}},
            ],
            "violations": [
                {
                    "rule_id": "LMR-08",
                    "clause": "Rule 6(1)(n)",
                    "issue_title": "Non-Compliance: Mandatory Country of Origin",
                    "description": "Package fails to declare the Country of Origin or manufacturing origin on the principal display panel.",
                    "severity": "CRITICAL"
                }
            ]
        }
    ]

    reports_dir = os.path.join(BASE_DIR, "reports")
    os.makedirs(reports_dir, exist_ok=True)

    for sku in demo_skus:
        img_path = create_demo_image(
            filename=sku["filename"],
            title=sku["title"],
            brand=sku["brand"],
            category=sku["category"],
            texts=sku["texts"],
            accent_color=sku["accent"]
        )
        scan_id = sku["id"]
        
        # Build fields list
        fields_data = []
        for t in sku["texts"]:
            label_lower = t["label"].lower()
            if "generic" in label_lower:
                ft = "generic_name"
            elif "quantity" in label_lower:
                ft = "net_quantity"
            elif "mrp" in label_lower:
                ft = "mrp"
            elif "manufacture" in label_lower or "mfg" in label_lower:
                ft = "mfg_date"
            elif "expiry" in label_lower or "before" in label_lower:
                ft = "expiry_date"
            elif "origin" in label_lower:
                ft = "country_origin"
            elif "manufacturer" in label_lower or "packer" in label_lower:
                ft = "mfg_address"
            else:
                ft = "consumer_care"

            fields_data.append({
                "field_type": ft,
                "field_label": t["label"],
                "raw_text": t["val"],
                "normalized_value": t["val"],
                "bbox": t["box"],
                "confidence": 0.98 if t["valid"] else 0.45,
                "is_valid": t["valid"],
                "validation_message": "Statutory declaration fully verified" if t["valid"] else "Statutory declaration non-compliant or omitted"
            })

        cert = ReportService.generate_inspection_certificate(
            scan_id=scan_id,
            product_name=sku["title"],
            category=sku["category"],
            verdict=sku["verdict"],
            compliance_score=sku["score"],
            fields=fields_data,
            violations=sku["violations"],
            output_dir=reports_dir
        )

        # Clear any prior records for this scan ID to maintain zero duplicates
        db.query(Violation).filter(Violation.scan_id == scan_id).delete()
        db.query(ExtractedField).filter(ExtractedField.scan_id == scan_id).delete()
        db.query(ScanSession).filter(ScanSession.id == scan_id).delete()
        db.commit()

        # Insert clean scan session
        scan = ScanSession(
            id=scan_id,
            product_name=sku["title"],
            category=sku["category"],
            image_filename=sku["filename"],
            image_url=f"/demo_assets/{sku['filename']}",
            status="completed",
            overall_verdict=sku["verdict"],
            compliance_score=sku["score"],
            confidence_score=0.96,
            report_filename=cert["filename"],
            report_url=cert["url"],
            sha256_hash=cert["sha256_hash"]
        )
        db.add(scan)
        db.flush()

        for f in fields_data:
            field_obj = ExtractedField(
                scan_id=scan.id,
                field_type=f["field_type"],
                field_label=f["field_label"],
                raw_text=f["raw_text"],
                normalized_value=f["normalized_value"],
                bbox=f["bbox"],
                confidence=f["confidence"],
                is_valid=f["is_valid"],
                validation_message=f["validation_message"]
            )
            db.add(field_obj)

        for v in sku["violations"]:
            viol_obj = Violation(
                scan_id=scan.id,
                rule_id=v["rule_id"],
                field_type="mrp" if "LMR-06" in v["rule_id"] else ("consumer_care" if "LMR-07" in v["rule_id"] else "country_origin"),
                clause=v["clause"],
                issue_title=v["issue_title"],
                description=v["description"],
                severity=v["severity"],
                evidence_snippet="Identified breach on packaging principal display panel"
            )
            db.add(viol_obj)

    db.commit()
    db.close()
    print("Database re-seeded with 100% unique, verified, original commodity records!")

if __name__ == "__main__":
    seed_database()
