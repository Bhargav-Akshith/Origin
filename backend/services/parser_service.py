import re
from typing import List, Dict, Any, Optional

class DeclarationParserService:
    @staticmethod
    def parse_declarations(tokens: List[Dict[str, Any]], raw_full_text: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Extracts and normalizes the 7 mandatory Legal Metrology fields from OCR tokens.
        """
        if not raw_full_text:
            raw_full_text = " ".join([t.get("text", "") for t in tokens])

        extracted = []

        # 1. Maximum Retail Price (MRP) & Unit Sale Price (USP)
        mrp_field = DeclarationParserService._extract_mrp(raw_full_text, tokens)
        extracted.append(mrp_field)

        # 2. Net Quantity
        qty_field = DeclarationParserService._extract_net_quantity(raw_full_text, tokens)
        extracted.append(qty_field)

        # 3. Month & Year of Manufacture / Packaging
        mfg_field = DeclarationParserService._extract_mfg_date(raw_full_text, tokens)
        extracted.append(mfg_field)

        # 4. Best Before / Expiry Date
        exp_field = DeclarationParserService._extract_expiry(raw_full_text, tokens)
        extracted.append(exp_field)

        # 5. Country of Origin
        origin_field = DeclarationParserService._extract_origin(raw_full_text, tokens)
        extracted.append(origin_field)

        # 6. Manufacturer / Packer Address
        mfg_addr_field = DeclarationParserService._extract_mfg_address(raw_full_text, tokens)
        extracted.append(mfg_addr_field)

        # 7. Consumer Care Details
        care_field = DeclarationParserService._extract_consumer_care(raw_full_text, tokens)
        extracted.append(care_field)

        # 8. Common / Generic Name
        generic_field = DeclarationParserService._extract_generic_name(raw_full_text, tokens)
        extracted.append(generic_field)

        return extracted

    @staticmethod
    def _find_matching_bbox(tokens: List[Dict[str, Any]], match_text: str, default_box: dict) -> dict:
        if not match_text or not tokens:
            return default_box
        words = match_text.lower().split()
        for token in tokens:
            t_text = token.get("text", "").lower()
            if any(w in t_text for w in words if len(w) > 2):
                return token.get("bbox", default_box)
        return default_box

    @staticmethod
    def _extract_mrp(text: str, tokens: List[Dict[str, Any]]) -> dict:
        # Matches formats like: MRP Rs. 150.00 (incl. of all taxes), MRP ₹99, Rs 240
        mrp_regex = r'(?:MRP|M\.R\.P\.?|MAX\.?\s*RETAIL\s*PRICE|Rs\.?|₹)\s*[:\.]?\s*(\d+(?:\.\d{1,2})?)'
        match = re.search(mrp_regex, text, re.IGNORECASE)
        has_tax = bool(re.search(r'incl(?:usive)?\.?\s*(?:of)?\s*all\s*taxes', text, re.IGNORECASE))
        has_usp = bool(re.search(r'(?:USP|Unit\s*Sale\s*Price|per\s*(?:g|kg|ml|l|unit)|\/\s*(?:g|kg|ml|l|unit))\s*[:\.]?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)', text, re.IGNORECASE))

        if match:
            val = match.group(1)
            raw = match.group(0)
            bbox = DeclarationParserService._find_matching_bbox(tokens, "mrp", {"x": 62, "y": 68, "w": 32, "h": 10})
            is_valid = has_tax and float(val) > 0
            
            val_msg = "MRP declaration valid with tax statement"
            if not has_tax:
                val_msg = "MRP declared but missing mandatory '(incl. of all taxes)' phrase"
            elif not has_usp:
                val_msg = "MRP valid; recommended to verify Unit Sale Price (USP)"

            return {
                "field_type": "mrp",
                "field_label": "Maximum Retail Price (MRP)",
                "raw_text": raw + (" (incl. of all taxes)" if has_tax else ""),
                "normalized_value": f"₹ {val}",
                "bbox": bbox,
                "confidence": 0.94 if has_tax else 0.78,
                "is_valid": is_valid,
                "validation_message": val_msg
            }
        return {
            "field_type": "mrp",
            "field_label": "Maximum Retail Price (MRP)",
            "raw_text": None,
            "normalized_value": None,
            "bbox": {"x": 60, "y": 65, "w": 34, "h": 12},
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": "Mandatory MRP declaration not detected on package"
        }

    @staticmethod
    def _extract_net_quantity(text: str, tokens: List[Dict[str, Any]]) -> dict:
        qty_regex = r'(?:Net\s*(?:Wt\.?|Weight|Qty\.?|Quantity)|NET\s*MASS)\s*[:\.]?\s*(\d+(?:\.\d{1,2})?)\s*(g|kg|ml|l|ltr|gm|grams|pieces|units|N)\b'
        match = re.search(qty_regex, text, re.IGNORECASE)

        if match:
            num, unit = match.group(1), match.group(2).lower()
            bbox = DeclarationParserService._find_matching_bbox(tokens, "net", {"x": 12, "y": 68, "w": 28, "h": 9})
            return {
                "field_type": "net_quantity",
                "field_label": "Net Quantity / Standard Metric Unit",
                "raw_text": match.group(0),
                "normalized_value": f"{num} {unit}",
                "bbox": bbox,
                "confidence": 0.96,
                "is_valid": True,
                "validation_message": f"Conforms to SI metric standard ({num} {unit})"
            }
        return {
            "field_type": "net_quantity",
            "field_label": "Net Quantity / Standard Metric Unit",
            "raw_text": None,
            "normalized_value": None,
            "bbox": {"x": 10, "y": 65, "w": 30, "h": 10},
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": "Mandatory Net Quantity not detected or non-standard metric unit"
        }

    @staticmethod
    def _extract_mfg_date(text: str, tokens: List[Dict[str, Any]]) -> dict:
        mfg_regex = r'(?:Mfg\.?|Manufactured|Pkd\.?|Packed|Pkg\.?|Packaging|Date\s*of\s*(?:Mfg|Packaging))\s*[:\.]?\s*(\d{1,2}[\/\.-]\d{2,4}|\b[A-Za-z]{3,9}\s*\d{2,4}\b)'
        match = re.search(mfg_regex, text, re.IGNORECASE)

        if match:
            val = match.group(1)
            bbox = DeclarationParserService._find_matching_bbox(tokens, "mfg", {"x": 62, "y": 80, "w": 32, "h": 8})
            return {
                "field_type": "mfg_date",
                "field_label": "Month & Year of Manufacture / Packaging",
                "raw_text": match.group(0),
                "normalized_value": val,
                "bbox": bbox,
                "confidence": 0.92,
                "is_valid": True,
                "validation_message": "Manufacturing date is declared in valid format"
            }
        return {
            "field_type": "mfg_date",
            "field_label": "Month & Year of Manufacture / Packaging",
            "raw_text": None,
            "normalized_value": None,
            "bbox": {"x": 60, "y": 78, "w": 34, "h": 10},
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": "Manufacturing or packaging date is missing"
        }

    @staticmethod
    def _extract_expiry(text: str, tokens: List[Dict[str, Any]]) -> dict:
        exp_regex = r'(?:Best\s*Before|Expiry|Exp\.?\s*Date|Use\s*by)\s*[:\.]?\s*(\d+\s*(?:months|days|years)|\d{1,2}[\/\.-]\d{2,4})'
        match = re.search(exp_regex, text, re.IGNORECASE)

        if match:
            bbox = DeclarationParserService._find_matching_bbox(tokens, "before", {"x": 62, "y": 89, "w": 32, "h": 7})
            return {
                "field_type": "expiry_date",
                "field_label": "Best Before / Expiry Declaration",
                "raw_text": match.group(0),
                "normalized_value": match.group(1),
                "bbox": bbox,
                "confidence": 0.91,
                "is_valid": True,
                "validation_message": "Consumer expiration/best before period clearly stated"
            }
        return {
            "field_type": "expiry_date",
            "field_label": "Best Before / Expiry Declaration",
            "raw_text": None,
            "normalized_value": None,
            "bbox": {"x": 60, "y": 88, "w": 34, "h": 9},
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": "Expiry period or Best Before statement omitted"
        }

    @staticmethod
    def _extract_origin(text: str, tokens: List[Dict[str, Any]]) -> dict:
        origin_regex = r'(?:Country\s*of\s*Origin|Made\s*in|Product\s*of)\s*[:\.]?\s*([A-Za-z\s]+)'
        match = re.search(origin_regex, text, re.IGNORECASE)

        if match:
            country = match.group(1).strip().split("\n")[0][:30]
            bbox = DeclarationParserService._find_matching_bbox(tokens, "origin", {"x": 12, "y": 79, "w": 35, "h": 7})
            return {
                "field_type": "country_origin",
                "field_label": "Country of Origin",
                "raw_text": match.group(0),
                "normalized_value": country,
                "bbox": bbox,
                "confidence": 0.95,
                "is_valid": True,
                "validation_message": f"Country of origin explicitly declared ({country})"
            }
        return {
            "field_type": "country_origin",
            "field_label": "Country of Origin",
            "raw_text": None,
            "normalized_value": None,
            "bbox": {"x": 10, "y": 77, "w": 38, "h": 9},
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": "Country of Origin declaration missing (Violates Rule 6(1)(n))"
        }

    @staticmethod
    def _extract_mfg_address(text: str, tokens: List[Dict[str, Any]]) -> dict:
        mfg_addr_regex = r'(?:Mfg\s*by|Manufactured\s*by|Packed\s*by|Marketed\s*by)\s*[:\.]?\s*([A-Za-z0-9\s,\.-]{15,100})'
        match = re.search(mfg_addr_regex, text, re.IGNORECASE)
        has_pin = bool(re.search(r'\b\d{6}\b', text))

        if match:
            addr = match.group(1).strip()
            bbox = DeclarationParserService._find_matching_bbox(tokens, "mfg", {"x": 12, "y": 15, "w": 40, "h": 14})
            return {
                "field_type": "mfg_address",
                "field_label": "Manufacturer / Packer Name & Address",
                "raw_text": match.group(0),
                "normalized_value": addr,
                "bbox": bbox,
                "confidence": 0.90,
                "is_valid": True,
                "validation_message": "Manufacturer name and physical address identified"
            }
        return {
            "field_type": "mfg_address",
            "field_label": "Manufacturer / Packer Name & Address",
            "raw_text": None,
            "normalized_value": None,
            "bbox": {"x": 10, "y": 12, "w": 45, "h": 16},
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": "Manufacturer/Packer identity or physical address missing"
        }

    @staticmethod
    def _extract_consumer_care(text: str, tokens: List[Dict[str, Any]]) -> dict:
        email_match = re.search(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', text)
        phone_match = re.search(r'(?:1800[-\s]?\d{3}[-\s]?\d{3,4}|\b\d{10}\b|\+91[-\s]?\d{10})', text)
        care_header = bool(re.search(r'(?:Consumer\s*Care|Customer\s*Care|Feedback|Helpline)', text, re.IGNORECASE))

        if email_match or phone_match or care_header:
            email_val = email_match.group(0) if email_match else "Missing Email"
            phone_val = phone_match.group(0) if phone_match else "Missing Phone"
            is_valid = bool(email_match and phone_match)
            bbox = DeclarationParserService._find_matching_bbox(tokens, "care", {"x": 12, "y": 88, "w": 38, "h": 9})
            return {
                "field_type": "consumer_care",
                "field_label": "Consumer Care Redressal Details",
                "raw_text": f"Email: {email_val}, Phone: {phone_val}",
                "normalized_value": f"{email_val} | {phone_val}",
                "bbox": bbox,
                "confidence": 0.93 if is_valid else 0.65,
                "is_valid": is_valid,
                "validation_message": "Full consumer care redressal officer details verified" if is_valid else "Incomplete consumer care details (both Phone & Email required)"
            }
        return {
            "field_type": "consumer_care",
            "field_label": "Consumer Care Redressal Details",
            "raw_text": None,
            "normalized_value": None,
            "bbox": {"x": 10, "y": 86, "w": 40, "h": 11},
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": "Consumer grievance redressal contacts missing (Violates Rule 6(1)(k))"
        }

    @staticmethod
    def _extract_generic_name(text: str, tokens: List[Dict[str, Any]]) -> dict:
        # Check if generic name / commodity description exists
        generic_keywords = ["biscuit", "cookies", "chips", "oil", "soap", "shampoo", "juice", "tea", "coffee", "rice", "wheat", "flour", "snack", "water", "beverage"]
        found = [kw for kw in generic_keywords if kw in text.lower()]
        
        if found:
            bbox = DeclarationParserService._find_matching_bbox(tokens, found[0], {"x": 12, "y": 8, "w": 40, "h": 8})
            return {
                "field_type": "generic_name",
                "field_label": "Generic Commodity / Common Name",
                "raw_text": found[0].upper(),
                "normalized_value": found[0].capitalize(),
                "bbox": bbox,
                "confidence": 0.88,
                "is_valid": True,
                "validation_message": f"Generic product classification declared ({found[0].capitalize()})"
            }
        return {
            "field_type": "generic_name",
            "field_label": "Generic Commodity / Common Name",
            "raw_text": None,
            "normalized_value": None,
            "bbox": {"x": 10, "y": 6, "w": 42, "h": 9},
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": "Common / Generic description of commodity not clearly printed"
        }
