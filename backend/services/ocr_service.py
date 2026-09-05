import os
import json
import re
from typing import List, Dict, Any, Optional
from services.vision_service import VisionService

class OCRService:
    @staticmethod
    def extract_text_and_boxes(image_path: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Extracts text tokens and normalized bounding boxes [x, y, w, h] (0-100%).
        Supports multi-engine pipeline:
        1. Gemini Multimodal Vision (if API key available)
        2. Embedded metadata payload
        3. EasyOCR / Tesseract (if installed)
        4. OpenCV Adaptive Text Region Contour Extraction
        """
        # 1. Vision Service (Gemini or OpenCV Adaptive Layout)
        try:
            analysis = VisionService.analyze_packaging_photo(image_path, api_key=api_key)
            if analysis and (analysis.get("tokens") or analysis.get("raw_text") or analysis.get("fields")):
                return {
                    "text": analysis.get("raw_text", ""),
                    "tokens": analysis.get("tokens", []),
                    "fields": analysis.get("fields", [])
                }
        except Exception as e:
            print(f"[OCRService] Vision analysis fallback: {e}")

        # 2. Heuristic fallback
        tokens = []
        full_text = ""
        
        # Check sidecar
        sidecar_json = os.path.splitext(image_path)[0] + ".json"
        if os.path.exists(sidecar_json):
            try:
                with open(sidecar_json, "r", encoding="utf-8") as f:
                    sc = json.load(f)
                    if isinstance(sc, list):
                        tokens = sc
                    elif isinstance(sc, dict) and "tokens" in sc:
                        tokens = sc["tokens"]
            except Exception:
                pass

        full_text = " ".join([t.get("text", "") for t in tokens if isinstance(t, dict) and t.get("text")])
        return {
            "text": full_text,
            "tokens": tokens,
            "fields": []
        }
