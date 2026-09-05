import re
from typing import List, Dict, Any, Optional

class DeclarationParserService:
    @staticmethod
    def parse_declarations(
        tokens: List[Dict[str, Any]],
        raw_full_text: Optional[str] = None,
        pre_extracted_fields: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Extracts and normalizes the mandatory Legal Metrology declarations from OCR tokens or Vision fields.
        Robust against varying packaging formats, layouts, fonts, and multi-line phrasing.
        """
        if not raw_full_text:
            raw_full_text = " ".join([t.get("text", "") for t in tokens if isinstance(t, dict)])

        # If high-fidelity pre-extracted fields from Gemini Vision are available, use and refine them
        if pre_extracted_fields and len(pre_extracted_fields) > 0:
            refined = []
            field_types_present = set()
            for f in pre_extracted_fields:
                ft = f.get("field_type")
                if ft:
                    field_types_present.add(ft)
                    refined.append(f)
            
            # Ensure all 8 standard statutory categories exist
            standard_types = [
                ("mrp", "Maximum Retail Price (MRP)", DeclarationParserService._extract_mrp),
                ("net_quantity", "Net Quantity / Standard Metric Unit", DeclarationParserService._extract_net_quantity),
                ("mfg_date", "Month & Year of Manufacture / Packaging", DeclarationParserService._extract_mfg_date),
                ("expiry_date", "Best Before / Expiry Declaration", DeclarationParserService._extract_expiry),
                ("country_origin", "Country of Origin", DeclarationParserService._extract_origin),
                ("mfg_address", "Manufacturer / Packer Name & Address", DeclarationParserService._extract_mfg_address),
                ("consumer_care", "Consumer Care Redressal Details", DeclarationParserService._extract_consumer_care),
                ("generic_name", "Generic Commodity / Common Name", DeclarationParserService._extract_generic_name),
            ]
            for st_type, st_label, extract_fn in standard_types:
                if st_type not in field_types_present:
                    fallback_field = extract_fn(raw_full_text, tokens)
                    refined.append(fallback_field)
            return refined

        extracted = []

        # 1. Maximum Retail Price (MRP) & Unit Sale Price (USP)
        extracted.append(DeclarationParserService._extract_mrp(raw_full_text, tokens))

        # 2. Net Quantity
        extracted.append(DeclarationParserService._extract_net_quantity(raw_full_text, tokens))

        # 3. Month & Year of Manufacture / Packaging
        extracted.append(DeclarationParserService._extract_mfg_date(raw_full_text, tokens))

        # 4. Best Before / Expiry Date
        extracted.append(DeclarationParserService._extract_expiry(raw_full_text, tokens))

        # 5. Country of Origin
        extracted.append(DeclarationParserService._extract_origin(raw_full_text, tokens))

        # 6. Manufacturer / Packer Address
        extracted.append(DeclarationParserService._extract_mfg_address(raw_full_text, tokens))

        # 7. Consumer Care Details
        extracted.append(DeclarationParserService._extract_consumer_care(raw_full_text, tokens))

        # 8. Common / Generic Name
        extracted.append(DeclarationParserService._extract_generic_name(raw_full_text, tokens))

        return extracted

    @classmethod
    def parse_all_declarations(
        cls,
        text: Optional[str] = None,
        tokens: Optional[List[Dict[str, Any]]] = None,
        image_width: int = 800,
        image_height: int = 600,
        **kwargs
    ) -> List[Dict[str, Any]]:
        tokens_list = tokens or []
        return cls.parse_declarations(tokens=tokens_list, raw_full_text=text)

    @classmethod
    def fuse_multi_image_declarations(
        cls,
        images_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Fuses statutory declarations extracted across multiple packaging angles/photos (Front, Back, Side).
        Selects highest confidence / valid detection for each statutory field and associates the originating image_index.
        """
        if not images_data:
            return cls.parse_declarations([], "")

        all_fields_by_type: Dict[str, List[Dict[str, Any]]] = {}

        for img_idx, img_item in enumerate(images_data):
            tokens = img_item.get("tokens", [])
            text = img_item.get("text") or " ".join([t.get("text", "") for t in tokens if isinstance(t, dict)])
            img_url = img_item.get("image_url")
            pre_fields = img_item.get("fields", [])
            
            parsed_list = cls.parse_declarations(tokens, text, pre_extracted_fields=pre_fields)
            for f in parsed_list:
                f_type = f.get("field_type")
                if not f_type:
                    continue
                f["image_index"] = img_idx
                f["image_url"] = img_url
                if f_type not in all_fields_by_type:
                    all_fields_by_type[f_type] = []
                all_fields_by_type[f_type].append(f)

        fused: List[Dict[str, Any]] = []
        for f_type, candidates in all_fields_by_type.items():
            valid_candidates = [c for c in candidates if c.get("is_valid") and c.get("normalized_value")]
            if valid_candidates:
                best = max(valid_candidates, key=lambda x: x.get("confidence", 0.0))
            else:
                best = max(candidates, key=lambda x: x.get("confidence", 0.0))
            fused.append(best)

        return fused

    @staticmethod
    def _find_matching_bbox(tokens: List[Dict[str, Any]], match_text: str) -> Optional[dict]:
        if not match_text or not tokens:
            return None
        words = [w.lower() for w in re.split(r'\W+', match_text) if len(w) > 2]
        if not words:
            return None
            
        # Exact substring or word overlap match with token text
        for token in tokens:
            t_text = token.get("text", "").lower()
            if not t_text:
                continue
            if match_text.lower() in t_text or any(w in t_text for w in words):
                if "bbox" in token and token["bbox"]:
                    return token["bbox"]
        
        return None

    @staticmethod
    def _extract_mrp(text: str, tokens: List[Dict[str, Any]]) -> dict:
        if not text:
            return DeclarationParserService._empty_field("mrp", "Maximum Retail Price (MRP)", "Mandatory MRP declaration not detected on package")

        mrp_regex = r'(?:MRP|M\.R\.P\.?|MAX\.?\s*RETAIL\s*PRICE|Rs\.?|₹|INR)\s*[:\.]?\s*(\d+(?:\.\d{1,2})?)'
        match = re.search(mrp_regex, text, re.IGNORECASE)
        has_tax = bool(re.search(r'incl(?:usive)?\.?\s*(?:of)?\s*all\s*taxes|incl\.?\s*taxes', text, re.IGNORECASE))
        has_usp = bool(re.search(r'(?:USP|Unit\s*Sale\s*Price|per\s*(?:g|kg|ml|l|unit|piece|N)|\/\s*(?:g|kg|ml|l|unit|piece|N))\s*[:\.]?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)', text, re.IGNORECASE))

        if match:
            val = match.group(1)
            raw = match.group(0)
            bbox = DeclarationParserService._find_matching_bbox(tokens, raw) or DeclarationParserService._find_matching_bbox(tokens, "mrp")
            is_valid = has_tax and float(val) > 0
            
            val_msg = "MRP declaration valid with tax statement"
            if not has_tax:
                val_msg = "MRP declared but missing mandatory '(incl. of all taxes)' statement (Rule 6(1)(e))"
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
        return DeclarationParserService._empty_field("mrp", "Maximum Retail Price (MRP)", "Mandatory MRP declaration not detected on package")

    @staticmethod
    def _extract_net_quantity(text: str, tokens: List[Dict[str, Any]]) -> dict:
        if not text:
            return DeclarationParserService._empty_field("net_quantity", "Net Quantity / Standard Metric Unit", "Mandatory Net Quantity not detected")

        qty_regex = r'(?:Net\s*(?:Wt\.?|Weight|Qty\.?|Quantity|Vol\.?|Volume)|NET\s*MASS|Weight|Quantity)\s*[:\.]?\s*(\d+(?:\.\d{1,2})?)\s*(g|kg|ml|l|ltr|gm|grams|pieces|units|tablets|capsules|N)\b'
        match = re.search(qty_regex, text, re.IGNORECASE)
        if not match:
            # Standalone quantity pattern e.g. "500 g", "1.5 kg", "250 ml"
            match = re.search(r'\b(\d+(?:\.\d{1,2})?)\s*(g|kg|ml|l|ltr|gm|grams|pieces|units|N)\b', text, re.IGNORECASE)

        if match:
            num, unit = match.group(1), match.group(2).lower()
            raw = match.group(0)
            bbox = DeclarationParserService._find_matching_bbox(tokens, raw) or DeclarationParserService._find_matching_bbox(tokens, "net")
            return {
                "field_type": "net_quantity",
                "field_label": "Net Quantity / Standard Metric Unit",
                "raw_text": raw,
                "normalized_value": f"{num} {unit}",
                "bbox": bbox,
                "confidence": 0.96,
                "is_valid": True,
                "validation_message": f"Conforms to SI metric standard ({num} {unit})"
            }
        return DeclarationParserService._empty_field("net_quantity", "Net Quantity / Standard Metric Unit", "Mandatory Net Quantity not detected or non-standard unit")

    @staticmethod
    def _extract_mfg_date(text: str, tokens: List[Dict[str, Any]]) -> dict:
        if not text:
            return DeclarationParserService._empty_field("mfg_date", "Month & Year of Manufacture / Packaging", "Manufacturing date missing")

        mfg_regex = r'(?:Mfg\.?|Manufactured|Pkd\.?|Packed|Pkg\.?|Packaging|Date\s*of\s*(?:Mfg|Packaging|Packing))\s*[:\.]?\s*(\d{1,2}[\/\.-]\d{2,4}|\b[A-Za-z]{3,9}\s*\d{2,4}\b|\d{2}\/\d{2})'
        match = re.search(mfg_regex, text, re.IGNORECASE)

        if match:
            val = match.group(1)
            raw = match.group(0)
            bbox = DeclarationParserService._find_matching_bbox(tokens, raw) or DeclarationParserService._find_matching_bbox(tokens, "mfg")
            return {
                "field_type": "mfg_date",
                "field_label": "Month & Year of Manufacture / Packaging",
                "raw_text": raw,
                "normalized_value": val,
                "bbox": bbox,
                "confidence": 0.92,
                "is_valid": True,
                "validation_message": f"Manufacturing/packaging date declared ({val})"
            }
        return DeclarationParserService._empty_field("mfg_date", "Month & Year of Manufacture / Packaging", "Manufacturing or packaging date is missing (Rule 6(1)(d))")

    @staticmethod
    def _extract_expiry(text: str, tokens: List[Dict[str, Any]]) -> dict:
        if not text:
            return DeclarationParserService._empty_field("expiry_date", "Best Before / Expiry Declaration", "Expiry period or Best Before omitted")

        exp_regex = r'(?:Best\s*Before|Expiry|Exp\.?\s*Date|Use\s*by|Valid\s*for)\s*[:\.]?\s*(\d+\s*(?:months|days|years)|\d{1,2}[\/\.-]\d{2,4}|\b[A-Za-z]{3,9}\s*\d{2,4}\b)'
        match = re.search(exp_regex, text, re.IGNORECASE)

        if match:
            raw = match.group(0)
            bbox = DeclarationParserService._find_matching_bbox(tokens, raw) or DeclarationParserService._find_matching_bbox(tokens, "before")
            return {
                "field_type": "expiry_date",
                "field_label": "Best Before / Expiry Declaration",
                "raw_text": raw,
                "normalized_value": match.group(1),
                "bbox": bbox,
                "confidence": 0.91,
                "is_valid": True,
                "validation_message": "Consumer expiration/best before period clearly stated"
            }
        return DeclarationParserService._empty_field("expiry_date", "Best Before / Expiry Declaration", "Expiry period or Best Before statement omitted")

    @staticmethod
    def _extract_origin(text: str, tokens: List[Dict[str, Any]]) -> dict:
        if not text:
            return DeclarationParserService._empty_field("country_origin", "Country of Origin", "Country of Origin declaration missing (Rule 6(1)(n))")

        origin_regex = r'(?:Country\s*of\s*Origin|Made\s*in|Product\s*of|Origin)\s*[:\.]?\s*([A-Za-z\s]{3,30})'
        match = re.search(origin_regex, text, re.IGNORECASE)

        if match:
            country = match.group(1).strip().split("\n")[0][:30]
            raw = match.group(0)
            bbox = DeclarationParserService._find_matching_bbox(tokens, raw) or DeclarationParserService._find_matching_bbox(tokens, "origin")
            return {
                "field_type": "country_origin",
                "field_label": "Country of Origin",
                "raw_text": raw,
                "normalized_value": country,
                "bbox": bbox,
                "confidence": 0.95,
                "is_valid": True,
                "validation_message": f"Country of origin explicitly declared ({country})"
            }
        return DeclarationParserService._empty_field("country_origin", "Country of Origin", "Country of Origin declaration missing (Violates Rule 6(1)(n))")

    @staticmethod
    def _extract_mfg_address(text: str, tokens: List[Dict[str, Any]]) -> dict:
        if not text:
            return DeclarationParserService._empty_field("mfg_address", "Manufacturer / Packer Name & Address", "Manufacturer/Packer identity or address missing")

        mfg_addr_regex = r'(?:Mfg\s*by|Manufactured\s*by|Packed\s*by|Marketed\s*by|Produced\s*by)\s*[:\.]?\s*([A-Za-z0-9\s,\.-]{12,120})'
        match = re.search(mfg_addr_regex, text, re.IGNORECASE)

        if match:
            addr = match.group(1).strip()
            raw = match.group(0)
            bbox = DeclarationParserService._find_matching_bbox(tokens, raw) or DeclarationParserService._find_matching_bbox(tokens, "mfg")
            return {
                "field_type": "mfg_address",
                "field_label": "Manufacturer / Packer Name & Address",
                "raw_text": raw,
                "normalized_value": addr,
                "bbox": bbox,
                "confidence": 0.90,
                "is_valid": True,
                "validation_message": "Manufacturer name and physical address identified"
            }
        return DeclarationParserService._empty_field("mfg_address", "Manufacturer / Packer Name & Address", "Manufacturer/Packer identity or physical address missing (Rule 6(1)(a)/(b))")

    @staticmethod
    def _extract_consumer_care(text: str, tokens: List[Dict[str, Any]]) -> dict:
        if not text:
            return DeclarationParserService._empty_field("consumer_care", "Consumer Care Redressal Details", "Consumer grievance redressal contacts missing (Rule 6(1)(k))")

        email_match = re.search(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', text)
        phone_match = re.search(r'(?:1800[-\s]?\d{3}[-\s]?\d{3,4}|\b\d{10}\b|\+91[-\s]?\d{10})', text)
        care_header = bool(re.search(r'(?:Consumer\s*Care|Customer\s*Care|Feedback|Helpline|Grievance)', text, re.IGNORECASE))

        if email_match or phone_match or care_header:
            email_val = email_match.group(0) if email_match else "Missing Email"
            phone_val = phone_match.group(0) if phone_match else "Missing Phone"
            is_valid = bool(email_match and phone_match)
            bbox = DeclarationParserService._find_matching_bbox(tokens, "care") or (email_match and DeclarationParserService._find_matching_bbox(tokens, email_val))
            return {
                "field_type": "consumer_care",
                "field_label": "Consumer Care Redressal Details",
                "raw_text": f"Email: {email_val}, Phone: {phone_val}",
                "normalized_value": f"{email_val} | {phone_val}",
                "bbox": bbox,
                "confidence": 0.93 if is_valid else 0.65,
                "is_valid": is_valid,
                "validation_message": "Full consumer care redressal officer details verified" if is_valid else "Incomplete consumer care details (both Phone & Email required under Rule 6(1)(k))"
            }
        return DeclarationParserService._empty_field("consumer_care", "Consumer Care Redressal Details", "Consumer grievance redressal contacts missing (Violates Rule 6(1)(k))")

    @staticmethod
    def _extract_generic_name(text: str, tokens: List[Dict[str, Any]]) -> dict:
        if not text:
            return DeclarationParserService._empty_field("generic_name", "Generic Commodity / Common Name", "Generic commodity description omitted")

        generic_keywords = [
            "biscuit", "cookies", "chips", "oil", "soap", "shampoo", "juice", "tea", "coffee", "rice",
            "wheat", "flour", "snack", "water", "beverage", "lotion", "cream", "detergent", "toothpaste",
            "atta", "dal", "pulses", "spices", "masala", "salt", "sugar", "noodles", "pasta", "butter"
        ]
        found = [kw for kw in generic_keywords if kw in text.lower()]
        
        if found:
            bbox = DeclarationParserService._find_matching_bbox(tokens, found[0])
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
        return DeclarationParserService._empty_field("generic_name", "Generic Commodity / Common Name", "Common / Generic description of commodity not clearly printed (Rule 6(1)(c))")

    @staticmethod
    def _empty_field(field_type: str, label: str, validation_msg: str) -> dict:
        return {
            "field_type": field_type,
            "field_label": label,
            "raw_text": None,
            "normalized_value": None,
            "bbox": None,
            "confidence": 0.0,
            "is_valid": False,
            "validation_message": validation_msg
        }
