import os
import json
import random
from PIL import Image, ImageDraw, PngImagePlugin

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "test_sample_images")
os.makedirs(SAMPLE_DIR, exist_ok=True)

def draw_veg_icon(draw, x, y, size=20, is_veg=True):
    color = (0, 140, 60) if is_veg else (180, 40, 20)
    draw.rectangle([(x, y), (x + size, y + size)], outline=color, width=2)
    radius = size // 4
    center_x = x + size // 2
    center_y = y + size // 2
    draw.ellipse([(center_x - radius, center_y - radius), (center_x + radius, center_y + radius)], fill=color)

def draw_barcode(draw, x, y, width=150, height=48, code="8 904567 890123"):
    draw.rectangle([(x, y), (x + width, y + height)], fill=(255, 255, 255), outline=(170, 175, 185))
    bar_x = x + 10
    random.seed(len(code) + x)
    while bar_x < (x + width - 12):
        bar_w = random.choice([1, 2, 3])
        draw.rectangle([(bar_x, y + 4), (bar_x + bar_w, y + height - 12)], fill=(15, 23, 42))
        bar_x += bar_w + random.choice([2, 3, 4])
    draw.text((x + 22, y + height - 10), code, fill=(60, 70, 85))

def generate_packaging_image(filename, title, brand, category, declarations, accent_color=(15, 41, 66), is_food=True):
    img = Image.new("RGB", (920, 700), color=(250, 250, 248))
    draw = ImageDraw.Draw(img)

    # 1. Outer Product Packaging Box
    draw.rectangle([(15, 15), (905, 685)], outline=(190, 198, 210), width=2)
    draw.rectangle([(25, 25), (895, 675)], outline=(225, 232, 242), width=1)

    # 2. Header Branding Banner
    draw.rectangle([(25, 25), (895, 105)], fill=accent_color)
    draw.text((45, 40), brand.upper(), fill=(234, 179, 8)) # Gold
    draw.text((45, 62), title, fill=(255, 255, 255))
    draw.text((640, 52), category.upper()[:30], fill=(210, 230, 255))

    # 3. Standard Mark / Veg Mark
    if is_food:
        draw_veg_icon(draw, 850, 48, size=24, is_veg=True)
    else:
        draw.rectangle([(835, 42), (875, 82)], outline=(210, 230, 255), width=2)
        draw.text((842, 54), "ISI", fill=(255, 255, 255))

    # 4. Declarations Panel Box
    draw.rectangle([(40, 125), (880, 595)], fill=(255, 255, 255), outline=(215, 220, 230), width=1)
    draw.rectangle([(40, 125), (880, 155)], fill=(241, 245, 249))
    draw.text((55, 133), "STATUTORY COMMODITY DECLARATIONS • LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011", fill=(30, 41, 59))

    # 5. Render Declarations Table Rows & Tokens
    y = 175
    tokens = []

    for idx, item in enumerate(declarations):
        label = item.get("label", "")
        val = item.get("val", "")
        box = item.get("box", {"x": 5, "y": 25, "w": 40, "h": 6})
        is_valid = item.get("valid", True)

        if idx % 2 == 1:
            draw.rectangle([(42, y - 4), (878, y + 36)], fill=(248, 250, 252))

        draw.text((55, y + 4), f"{label}:", fill=(100, 116, 139))
        val_color = (15, 23, 42) if is_valid else (190, 24, 93)
        draw.text((290, y + 4), str(val), fill=val_color)

        x1 = int(box["x"] * 9.2)
        y1 = int(box["y"] * 7.0)
        x2 = int((box["x"] + box["w"]) * 9.2)
        y2 = int((box["y"] + box["h"]) * 7.0)

        border_c = (5, 150, 105) if is_valid else (220, 38, 38)
        draw.rectangle([(x1, y1), (x2, y2)], outline=border_c, width=2)

        tag_text = "PASS" if is_valid else "VIOLATION"
        draw.rectangle([(x1, max(0, y1 - 16)), (x1 + 65, y1)], fill=border_c)
        draw.text((x1 + 8, max(2, y1 - 14)), tag_text, fill=(255, 255, 255))

        tokens.append({
            "text": f"{label}: {val}",
            "confidence": 0.98 if is_valid else 0.45,
            "bbox": box
        })

        y += 44

    # 6. Bottom Panel
    draw_barcode(draw, 55, 615, width=160, height=52)
    draw.rectangle([(690, 615), (880, 668)], fill=(241, 245, 249), outline=(203, 213, 225))
    draw.text((705, 625), "CENTRAL REGISTRATION", fill=(15, 41, 66))
    draw.text((705, 645), "Reg No: LMR/2026/IND/9921", fill=(100, 116, 139))

    target_path = os.path.join(SAMPLE_DIR, filename)
    img.save(target_path, quality=95)

    # Save sidecar JSON for zero-fail upload parsing in hackathon demos
    sidecar_path = os.path.splitext(target_path)[0] + ".json"
    with open(sidecar_path, "w", encoding="utf-8") as f:
        json.dump(tokens, f, indent=2)

    print(f"Created sample image & sidecar: {target_path}")
    return target_path

def generate_all_samples():
    # Sample 1: Green Tea Box (100% Compliant)
    generate_packaging_image(
        filename="sample_01_green_tea_compliant.jpg",
        title="Himalayan Pure Organic Green Tea (100g / 50 Bags)",
        brand="Himalayan Herbal Teas",
        category="Packaged Food, Edible Oils & Confectionery",
        accent_color=(20, 83, 45),
        is_food=True,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Organic Green Tea Bags", "valid": True, "box": {"x": 5, "y": 25, "w": 38, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Wt: 100 g (50 Tea Bags)", "valid": True, "box": {"x": 5, "y": 31, "w": 42, "h": 6}},
            {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 240.00 (incl. of all taxes) | USP Rs. 2.40 / g", "valid": True, "box": {"x": 5, "y": 37, "w": 88, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 03/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Best Before 18 Months from date of packaging", "valid": True, "box": {"x": 5, "y": 50, "w": 52, "h": 6}},
            {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 56, "w": 32, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by Himalayan Plantation Teas Ltd., Tea Estate, Palampur, HP 176061", "valid": True, "box": {"x": 5, "y": 62, "w": 90, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "care@himalayanteas.in | National Toll Free: 1800-111-2233", "valid": True, "box": {"x": 5, "y": 68, "w": 88, "h": 6}},
        ]
    )

    # Sample 2: Protein Powder (Missing USP & Tax statement)
    generate_packaging_image(
        filename="sample_02_protein_powder_missing_usp.jpg",
        title="ProMax Ultra 100% Whey Isolate Protein Powder (1kg)",
        brand="ProMax Sports Nutrition",
        category="Pharmaceuticals & Nutrition Pre-packs",
        accent_color=(124, 45, 18),
        is_food=True,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Whey Protein Dietary Food Supplement", "valid": True, "box": {"x": 5, "y": 25, "w": 48, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Wt: 1 kg", "valid": True, "box": {"x": 5, "y": 31, "w": 30, "h": 6}},
            {"label": "MRP Declared", "val": "Rs. 2999 [Missing 'incl. of all taxes' & Missing Unit Sale Price]", "valid": False, "box": {"x": 5, "y": 37, "w": 90, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 02/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Use before 24 Months from manufacturing", "valid": True, "box": {"x": 5, "y": 50, "w": 48, "h": 6}},
            {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 56, "w": 32, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by ProMax Nutrition Labs Pvt Ltd, MIDC Industrial Area, Mumbai 400072", "valid": True, "box": {"x": 5, "y": 62, "w": 90, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "support@promaxlabs.com | Helpline: 1800-888-4422", "valid": True, "box": {"x": 5, "y": 68, "w": 85, "h": 6}},
        ]
    )

    # Sample 3: Smart Watch Packaging (Missing Country of Origin)
    generate_packaging_image(
        filename="sample_03_smartwatch_missing_origin.jpg",
        title="VoltEdge Pulse Pro Bluetooth Calling Smartwatch",
        brand="VoltEdge Technologies",
        category="Electronics, Cables & Domestic Appliances",
        accent_color=(30, 41, 59),
        is_food=False,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Smart Wearable Watch Device", "valid": True, "box": {"x": 5, "y": 25, "w": 46, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Qty: 1 units", "valid": True, "box": {"x": 5, "y": 31, "w": 65, "h": 6}},
            {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 3,499.00 (incl. of all taxes) | USP Rs. 3,499.00 / Unit", "valid": True, "box": {"x": 5, "y": 37, "w": 88, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 01/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Best Before 12 Months", "valid": True, "box": {"x": 5, "y": 50, "w": 52, "h": 6}},
            {"label": "Country of Origin", "val": "[MANDATORY STATEMENT OF ORIGIN OMITTED ON PACKAGING]", "valid": False, "box": {"x": 5, "y": 56, "w": 80, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by VoltEdge India Pvt Ltd, Outer Ring Road, Bengaluru 560103", "valid": True, "box": {"x": 5, "y": 62, "w": 90, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "help@voltedge.in | Toll Free Care: 1800-999-7733", "valid": True, "box": {"x": 5, "y": 68, "w": 85, "h": 6}},
        ]
    )

    # Sample 4: Liquid Laundry Detergent (100% Compliant)
    generate_packaging_image(
        filename="sample_04_liquid_detergent_compliant.jpg",
        title="SuperClean Ultra Concentrated Liquid Laundry Detergent (1L)",
        brand="SuperClean Home Care",
        category="Household Detergents & Chemical Commodities",
        accent_color=(14, 116, 144),
        is_food=False,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Liquid Laundry Detergent Solution", "valid": True, "box": {"x": 5, "y": 25, "w": 44, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Qty: 1000 ml", "valid": True, "box": {"x": 5, "y": 31, "w": 30, "h": 6}},
            {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 199.00 (incl. of all taxes) | USP Rs. 0.20 / ml", "valid": True, "box": {"x": 5, "y": 37, "w": 88, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 02/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Best Before 24 Months from manufacturing date", "valid": True, "box": {"x": 5, "y": 50, "w": 50, "h": 6}},
            {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 56, "w": 32, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by SuperClean Chemicals India Ltd., GIDC Estate, Vapi, Gujarat 396195", "valid": True, "box": {"x": 5, "y": 62, "w": 90, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "feedback@superclean.in | Helpline: 1800-444-6622", "valid": True, "box": {"x": 5, "y": 68, "w": 85, "h": 6}},
        ]
    )

    # Sample 5: Hair Shampoo (Missing Customer Care Email & Phone)
    generate_packaging_image(
        filename="sample_05_hair_shampoo_missing_care.jpg",
        title="SilkGlow Natural Argan Oil Nourishing Shampoo (300ml)",
        brand="SilkGlow Cosmeceuticals",
        category="Cosmetics, Soaps & Personal Hygiene",
        accent_color=(162, 28, 175),
        is_food=False,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Hair Conditioning Shampoo", "valid": True, "box": {"x": 5, "y": 25, "w": 38, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Qty: 300 ml", "valid": True, "box": {"x": 5, "y": 31, "w": 25, "h": 6}},
            {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 349.00 (incl. of all taxes) | USP Rs. 1.16 / ml", "valid": True, "box": {"x": 5, "y": 37, "w": 88, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 12/2025", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Best Before 36 Months from packaging", "valid": True, "box": {"x": 5, "y": 50, "w": 46, "h": 6}},
            {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 56, "w": 32, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by SilkGlow Cosmetics Ltd., Industrial Area Phase-II, Baddi, HP 173205", "valid": True, "box": {"x": 5, "y": 62, "w": 90, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "[Consumer Redressal Helpline & Email Omitted]", "valid": False, "box": {"x": 5, "y": 68, "w": 70, "h": 6}},
        ]
    )

    # Sample 6: Premium Basmati Rice (100% Compliant)
    generate_packaging_image(
        filename="sample_06_basmati_rice_compliant.jpg",
        title="Royal Kohinoor Aged Basmati Rice (5kg Bag)",
        brand="Royal Kohinoor Heritage Grains",
        category="Agricultural Commodities & Grain Staples",
        accent_color=(161, 98, 7),
        is_food=True,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Aged Long Grain Basmati Rice", "valid": True, "box": {"x": 5, "y": 25, "w": 45, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Wt: 5.0 kg", "valid": True, "box": {"x": 5, "y": 31, "w": 28, "h": 6}},
            {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 650.00 (incl. of all taxes) | USP Rs. 130.00 / kg", "valid": True, "box": {"x": 5, "y": 37, "w": 88, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Pkg: 01/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Best Before 24 Months from packaging date", "valid": True, "box": {"x": 5, "y": 50, "w": 52, "h": 6}},
            {"label": "Country of Origin", "val": "Country of Origin: India", "valid": True, "box": {"x": 5, "y": 56, "w": 36, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Packed by Kohinoor Agri Foods Pvt Ltd, GT Road, Karnal, Haryana 132001", "valid": True, "box": {"x": 5, "y": 62, "w": 90, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "customercare@kohinoorrice.com | Toll Free: 1800-200-5544", "valid": True, "box": {"x": 5, "y": 68, "w": 88, "h": 6}},
        ]
    )

    # Sample 7: Energy Efficient LED Bulb (100% Compliant)
    generate_packaging_image(
        filename="sample_07_led_bulb_compliant.jpg",
        title="LumiVolt 9W High Lumen B22 LED Bulb Pack",
        brand="LumiVolt Lighting Solutions",
        category="Electrical Hardware & Domestic Luminaires",
        accent_color=(37, 99, 235),
        is_food=False,
        declarations=[
            {"label": "Generic Commodity Name", "val": "LED Self-Ballasted Lamp 9W B22", "valid": True, "box": {"x": 5, "y": 25, "w": 48, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Qty: 1 units", "valid": True, "box": {"x": 5, "y": 31, "w": 25, "h": 6}},
            {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 140.00 (incl. of all taxes) | USP Rs. 140.00 / Unit", "valid": True, "box": {"x": 5, "y": 37, "w": 88, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 02/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Warranty: 24 Months from invoice", "valid": True, "box": {"x": 5, "y": 50, "w": 42, "h": 6}},
            {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 56, "w": 32, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by LumiVolt India Ltd, Sector 63, Noida, Uttar Pradesh 201301", "valid": True, "box": {"x": 5, "y": 62, "w": 90, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "support@lumivolt.in | National Help Desk: 1800-333-8899", "valid": True, "box": {"x": 5, "y": 68, "w": 88, "h": 6}},
        ]
    )

    # Sample 8: Pure Sweet Almond Oil (Missing Net Quantity)
    generate_packaging_image(
        filename="sample_08_almond_oil_missing_qty.jpg",
        title="VedaNaturals 100% Cold Pressed Sweet Almond Oil",
        brand="VedaNaturals Ayurveda",
        category="Personal Care & Ayurvedic Preparations",
        accent_color=(180, 83, 9),
        is_food=False,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Sweet Almond Hair and Body Oil", "valid": True, "box": {"x": 5, "y": 25, "w": 46, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "[MANDATORY NET QUANTITY DECLARATION MISSING]", "valid": False, "box": {"x": 5, "y": 31, "w": 75, "h": 6}},
            {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 399.00 (incl. of all taxes) | USP Rs. 1.99 / ml", "valid": True, "box": {"x": 5, "y": 37, "w": 88, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 01/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Best Before 36 Months from manufacturing date", "valid": True, "box": {"x": 5, "y": 50, "w": 52, "h": 6}},
            {"label": "Country of Origin", "val": "Country of Origin: India", "valid": True, "box": {"x": 5, "y": 56, "w": 36, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by Veda Organics Ayurveda Ltd, Haridwar, Uttarakhand 249401", "valid": True, "box": {"x": 5, "y": 62, "w": 90, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "care@vedanaturals.in | Contact: +91-11-2345-6789", "valid": True, "box": {"x": 5, "y": 68, "w": 85, "h": 6}},
        ]
    )

    # Sample 9: Freeze Dried Instant Coffee (Violating USP Calculation)
    generate_packaging_image(
        filename="sample_09_instant_coffee_invalid_usp.jpg",
        title="CafeAroma Premium Gold Blend Instant Coffee (200g Jar)",
        brand="CafeAroma Beverages",
        category="Packaged Beverages & Coffee Pre-packs",
        accent_color=(88, 28, 135),
        is_food=True,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Instant Soluble Coffee Powder", "valid": True, "box": {"x": 5, "y": 25, "w": 42, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Wt: 200 g", "valid": True, "box": {"x": 5, "y": 31, "w": 25, "h": 6}},
            {"label": "MRP Declared", "val": "MRP Rs. 500.00 (incl. of all taxes) | USP Rs. 5.50 / g [MISMATCHED USP: Expected 2.50]", "valid": False, "box": {"x": 5, "y": 37, "w": 92, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 02/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Best Before 18 Months", "valid": True, "box": {"x": 5, "y": 50, "w": 35, "h": 6}},
            {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 56, "w": 32, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by CafeAroma Plantation Ltd, Coorg, Karnataka 571201", "valid": True, "box": {"x": 5, "y": 62, "w": 88, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "support@cafearoma.com | Helpline: 1800-456-7890", "valid": True, "box": {"x": 5, "y": 68, "w": 85, "h": 6}},
        ]
    )

    # Sample 10: Baby Soft Wipes (100% Compliant)
    generate_packaging_image(
        filename="sample_10_baby_wipes_compliant.jpg",
        title="LittleAngels Organic Bamboo Sensitive Baby Wipes (80 Pcs)",
        brand="LittleAngels Babycare",
        category="Sanitary & Infant Hygiene Commodities",
        accent_color=(13, 148, 136),
        is_food=False,
        declarations=[
            {"label": "Generic Commodity Name", "val": "Wet Baby Cleansing Wipes", "valid": True, "box": {"x": 5, "y": 25, "w": 40, "h": 6}},
            {"label": "Net Quantity / Standard Unit", "val": "Net Qty: 80 units (Sheets)", "valid": True, "box": {"x": 5, "y": 31, "w": 42, "h": 6}},
            {"label": "MRP (incl. of all taxes) & USP", "val": "MRP Rs. 160.00 (incl. of all taxes) | USP Rs. 2.00 / Unit", "valid": True, "box": {"x": 5, "y": 37, "w": 88, "h": 6}},
            {"label": "Month & Year of Manufacture", "val": "Mfg: 01/2026", "valid": True, "box": {"x": 5, "y": 44, "w": 28, "h": 6}},
            {"label": "Best Before / Expiry Period", "val": "Best Before 24 Months from date of mfg", "valid": True, "box": {"x": 5, "y": 50, "w": 48, "h": 6}},
            {"label": "Country of Origin", "val": "Made in India", "valid": True, "box": {"x": 5, "y": 56, "w": 32, "h": 6}},
            {"label": "Manufacturer & Packer Address", "val": "Mfg by LittleAngels Hygiene Products Pvt Ltd, Pune, Maharashtra 411014", "valid": True, "box": {"x": 5, "y": 62, "w": 92, "h": 6}},
            {"label": "Consumer Care Redressal Details", "val": "help@littleangels.in | Toll Free: 1800-112-9988", "valid": True, "box": {"x": 5, "y": 68, "w": 85, "h": 6}},
        ]
    )

if __name__ == "__main__":
    generate_all_samples()

