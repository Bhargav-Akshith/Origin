# 🏛️ National Legal Metrology Enforcement System (NLMES)
### SIH Origin — Automated Regulatory Compliance & Packaging Verification Platform
**Smart India Hackathon 2026 | Problem Statement ID: #26034**  
**Governing Authority:** Ministry of Consumer Affairs, Food & Public Distribution — Department of Legal Metrology, Government of India  
**Governing Legislation:** *Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011 (with Amendments)*

---

## 📌 Executive Summary
**NLMES (SIH Origin)** is a full-stack, automated computer vision and regulatory enforcement platform designed for central and state Legal Metrology inspectors. It automates the inspection of physical consumer product packaging, e-commerce catalog artwork, and digital pre-packs to verify compliance with mandatory statutory declarations.

---

## ✨ Key Features
- **🔍 7 Mandatory Statutory Declarations Optical Extraction**:
  1. Complete Name & Address of Manufacturer / Packer / Importer (Rule 6(1)(a))
  2. Generic or Common Name of the Commodity (Rule 6(1)(b))
  3. Net Quantity in Standard Metric Units / SI Units (Rule 6(1)(c) & Rule 11/12)
  4. Month and Year of Manufacture / Pre-packing / Import (Rule 6(1)(d))
  5. Best Before / Expiry Period for Consumer Safety
  6. Maximum Retail Price (MRP) `incl. of all taxes` and Unit Sale Price (`USP Rs. / g | kg | ml | l | unit`) (Rule 6(1)(e))
  7. Consumer Grievance Redressal Officer details (Name, Address, Phone, Email) (Rule 6(1)(k))
  8. Country of Origin declaration for domestic and imported commodities (Rule 6(1)(n))

- **📐 Computer Vision & Spatial Bounding Box Locator**:
  - Interactive bounding-box overlays locating declarations on physical packaging artwork.
  - Green (PASS) and Red (VIOLATION) spatial markers with click-to-isolate inspection.

- **📷 Live WebRTC Camera Scanner**:
  - Live browser/mobile camera viewfinder with optical reticle and scan line guideline.
  - One-click snapshot capture and instant compliance verification.
  - Support for multi-lens front / back camera switching.

- **🇮🇳 Bilingual National Portal (English / हिन्दी)**:
  - Full interface and statutory terminology translation between English and Hindi.

- **📜 Tamper-Evident Inspection Certificates**:
  - Downloadable PDF compliance certificates with SHA-256 digital cryptographic hash and Section 39 legal notice generation.

- **🧪 10 Benchmark Reference Packaging Samples**:
  - Pre-generated test packaging samples covering Food, Personal Care, Electronics, Household Chemicals, and Agricultural Commodities.

---

## 🏗️ System Architecture

```
SIH-PLAN/
├── backend/                        # FastAPI Python 3.10+ Backend
│   ├── database.py                 # SQLite / SQLAlchemy Engine & Session
│   ├── models.py                   # ORM Models (ScanSession, ExtractedField, Violation, ComplianceRule, AuditLog)
│   ├── schemas.py                  # Pydantic v2 Validation Schemas
│   ├── main.py                     # REST API Endpoints & Static Asset Handlers
│   ├── services/
│   │   ├── image_service.py        # OpenCV Contrast, Deskewing, Noise Reduction & Quality Scoring
│   │   ├── ocr_service.py          # Multilingual OCR Engine & Bounding Box Extractor
│   │   ├── parser_service.py       # Regex & NLP Statutory Rule Extractors
│   │   ├── rule_engine.py          # Legal Metrology Rules 2011 Deterministic Validator & USP Math
│   │   └── report_service.py       # ReportLab PDF Inspection Certificate Generator with SHA-256 Hash
│   ├── scripts/
│   │   ├── seed_demo.py            # Benchmark SKU Seed Script
│   │   ├── test_system.py          # Integration Test Suite
│   │   └── generate_sample_images.py # Packaging Sample & Sidecar Generator
│   └── demo_assets/                # Reference Commodity Label Images
│
├── frontend/                       # Vite + React 18 + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GovHeader.tsx       # Official Government Header & EN/HI Language Toggle
│   │   │   ├── MetricsBar.tsx      # Dashboard KPI Counters & Compliance Rates
│   │   │   ├── UploadZone.tsx      # Drag-and-drop Ingestion & Benchmark Selector
│   │   │   ├── CameraScannerModal.tsx # WebRTC Live Viewfinder Camera Scanner
│   │   │   ├── ScanCanvas.tsx      # Spatial Bounding Box Packaging Viewer
│   │   │   ├── ComplianceCard.tsx  # Verdict Banner, Score & PDF Certificate Action
│   │   │   ├── RulesTable.tsx      # Statutory Declarations Breakdown Table
│   │   │   └── ViolationsList.tsx  # Section 39 Legal Notices & Breaches
│   │   ├── i18n/
│   │   │   └── translations.ts     # Complete English & Hindi Localization Dictionary
│   │   ├── types.ts                # TypeScript Interfaces & Data Contracts
│   │   ├── App.tsx                 # Main Application Workspace
│   │   └── main.tsx                # React Entry Point
│   └── package.json
│
├── test_sample_images/             # 10 High-Resolution Test Packaging Photos & Sidecars
├── SIH_Origin_Engineering_Execution_OS.pdf # 16-Page Hackathon Execution Blueprint PDF
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt # or install fastapi uvicorn sqlalchemy pydantic pillow reportlab opencv-python requests
python scripts/seed_demo.py
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- Swagger API Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Application Portal: `http://127.0.0.1:5173/`

---

## 🧪 Automated Testing
Run the comprehensive backend integration test suite:
```bash
python backend/scripts/test_system.py
```

---

## ⚖️ Legal & Compliance Framework
- **The Legal Metrology Act, 2009 (No. 1 of 2010)**
- **Legal Metrology (Packaged Commodities) Rules, 2011 (G.S.R. 202(E))**
- **Legal Metrology (Packaged Commodities) Amendment Rules, 2021 (G.S.R. 779(E))** — Mandatory Unit Sale Price (USP) implementation.
