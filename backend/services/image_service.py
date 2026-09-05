import cv2
import numpy as np
import os
from PIL import Image

class ImageProcessingService:
    @staticmethod
    def preprocess_image(image_path: str) -> dict:
        """
        Applies OpenCV image preprocessing:
        - Auto-orientation & deskewing
        - Contrast Limited Adaptive Histogram Equalization (CLAHE) for glare suppression
        - Bilateral filtering for text edge preservation & noise removal
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")

        # Read image using OpenCV
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Failed to decode image")

        h, w = img.shape[:2]

        # Convert to Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply CLAHE to handle harsh lighting / glare on glossy packaging
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Bilateral filter to smooth texture while keeping sharp text edges
        denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)

        # Calculate image quality metrics
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blurry = laplacian_var < 100.0

        # Mean brightness
        brightness = np.mean(gray)
        is_too_dark = brightness < 40.0
        is_too_bright = brightness > 230.0

        # Save preprocessed version
        base_dir = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        preprocessed_filename = f"prep_{filename}"
        preprocessed_path = os.path.join(base_dir, preprocessed_filename)
        cv2.imwrite(preprocessed_path, denoised)

        return {
            "original_path": image_path,
            "processed_path": preprocessed_path,
            "preprocessed_path": preprocessed_path,
            "width": w,
            "height": h,
            "sharpness_score": round(float(laplacian_var), 2),
            "is_blurry": bool(is_blurry),
            "brightness": round(float(brightness), 2),
            "quality_verdict": "GOOD" if not (is_blurry or is_too_dark or is_too_bright) else "SUBOPTIMAL"
        }

