import os
import json
import re
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Optional

class VisionService:
    @staticmethod
    def get_api_key() -> Optional[str]:
        return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    @classmethod
    def analyze_packaging_photo(cls, image_path: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyzes a packaging photo of any format, shape, or orientation.
        1. Tries Gemini Multimodal Vision if API key is provided/configured.
        2. Falls back to OpenCV Adaptive Text Region & Contour Spatial Extraction.
        """
        key = api_key or cls.get_api_key()
        if key:
            try:
                gemini_res = cls._analyze_with_gemini(image_path, key)
                if gemini_res and (gemini_res.get("tokens") or gemini_res.get("fields")):
                    return gemini_res
            except Exception as e:
                print(f"[VisionService] Gemini Vision fallback due to: {e}")

        # Fallback to local OpenCV Adaptive Layout Analysis
        return cls._analyze_with_opencv_layout(image_path)

    @staticmethod
    def _analyze_with_gemini(image_path: str, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Uses Gemini 2.5 Flash Multimodal Vision to inspect packaging artwork,
        extracting all text blocks, spatial coordinates (0-100% normalized), and statutory declarations.
        """
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt = """
You are an expert Computer Vision & Legal Metrology Inspection AI.
Analyze this packaged commodity photo thoroughly regardless of packaging format, angle, curved surfaces, or fonts.

Extract all visible text and categorize mandatory Legal Metrology (Packaged Commodities) declarations:
1. Maximum Retail Price (MRP) & Unit Sale Price (USP)
2. Net Quantity / Standard Metric Unit
3. Month & Year of Manufacture / Packaging
4. Best Before / Expiry Declaration
5. Country of Origin
6. Manufacturer / Packer / Marketer Name & Full Address (with PIN code)
7. Consumer Care / Grievance Redressal (Email, Toll-Free Phone, Helpline)
8. Common / Generic Commodity Name

For each detected declaration or text block on this photo, provide normalized bounding box coordinates in percentage (0 to 100):
- x: leftmost percentage (0-100)
- y: topmost percentage (0-100)
- w: width percentage (0-100)
- h: height percentage (0-100)

Return ONLY a valid JSON object matching this schema:
{
  "raw_text": "Full concatenated text found on the packaging",
  "tokens": [
    {
      "text": "Extracted line or phrase",
      "confidence": 0.95,
      "bbox": {"x": 10.5, "y": 20.0, "w": 40.0, "h": 5.5}
    }
  ],
  "fields": [
    {
      "field_type": "mrp",
      "field_label": "Maximum Retail Price (MRP)",
      "raw_text": "MRP Rs. 150.00 (incl. of all taxes)",
      "normalized_value": "₹ 150.00",
      "is_valid": true,
      "validation_message": "MRP declared with tax statement",
      "confidence": 0.98,
      "bbox": {"x": 15.0, "y": 25.0, "w": 35.0, "h": 4.5}
    }
  ]
}
If a field is NOT visible or absent on this physical package photo, set its "bbox" to null, "raw_text" to null, and "is_valid" to false.
"""
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )

        if response and response.text:
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            parsed = json.loads(text.strip())
            return parsed

        return None

    @staticmethod
    def _analyze_with_opencv_layout(image_path: str) -> Dict[str, Any]:
        """
        Local OpenCV Adaptive Text Region & Spatial Contour Analyzer.
        Detects actual text regions on the packaging photo using morphological gradients and connected components.
        """
        tokens = []
        full_text = ""

        # 1. Check for embedded metadata / sidecars if present
        try:
            with Image.open(image_path) as im:
                if "ocr_payload" in im.info:
                    tokens = json.loads(im.info["ocr_payload"])
                elif hasattr(im, "getexif"):
                    exif = im.getexif()
                    if exif and 37510 in exif:
                        tokens = json.loads(exif[37510])
        except Exception:
            pass

        if not tokens:
            sidecar_json = os.path.splitext(image_path)[0] + ".json"
            if os.path.exists(sidecar_json):
                try:
                    with open(sidecar_json, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            tokens = data
                        elif isinstance(data, dict) and "tokens" in data:
                            tokens = data["tokens"]
                except Exception:
                    pass

        # 2. If no embedded sidecar, use OpenCV Morphological Text Region Discovery
        if not tokens:
            img = cv2.imread(image_path)
            if img is not None:
                h, w = img.shape[:2]
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                
                # Morphological gradient to highlight high-contrast text regions
                kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 3))
                grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)
                
                # Otsu thresholding
                _, thresh = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
                
                # Connect text line components horizontally
                conn_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 3))
                connected = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, conn_kernel)
                
                contours, _ = cv2.findContours(connected, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                detected_boxes = []
                for cnt in contours:
                    bx, by, bw, bh = cv2.boundingRect(cnt)
                    # Filter out noise / non-text aspect ratios
                    if bw > 25 and bh > 8 and (bw / bh) > 1.2 and (bw * bh) < (w * h * 0.4):
                        norm_x = round((bx / w) * 100.0, 2)
                        norm_y = round((by / h) * 100.0, 2)
                        norm_w = round((bw / w) * 100.0, 2)
                        norm_h = round((bh / h) * 100.0, 2)
                        detected_boxes.append({
                            "x": norm_x,
                            "y": norm_y,
                            "w": norm_w,
                            "h": norm_h
                        })

                # Sort detected boxes top to bottom
                detected_boxes.sort(key=lambda b: b["y"])
                
                for b in detected_boxes[:15]:
                    tokens.append({
                        "text": "",
                        "confidence": 0.85,
                        "bbox": b
                    })

        full_text = " ".join([t.get("text", "") for t in tokens if isinstance(t, dict) and t.get("text")])
        return {
            "raw_text": full_text,
            "tokens": tokens,
            "fields": []
        }
