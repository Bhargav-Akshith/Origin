import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Define Palette
COLOR_PRIMARY = colors.HexColor('#0F172A')       # Slate 900 (Navy Charcoal)
COLOR_SECONDARY = colors.HexColor('#1E293B')     # Slate 800
COLOR_ACCENT = colors.HexColor('#1D4ED8')        # Blue 700 (Engineering Blue)
COLOR_ACCENT_LIGHT = colors.HexColor('#EFF6FF')  # Blue 50
COLOR_TEXT_DARK = colors.HexColor('#0F172A')     # Slate 900
COLOR_TEXT_MUTED = colors.HexColor('#475569')    # Slate 600
COLOR_BG_LIGHT = colors.HexColor('#F8FAFC')      # Slate 50
COLOR_BORDER = colors.HexColor('#CBD5E1')        # Slate 300
COLOR_BORDER_LIGHT = colors.HexColor('#E2E8F0')  # Slate 200
COLOR_SUCCESS_BG = colors.HexColor('#ECFDF5')    # Emerald 50
COLOR_SUCCESS_TEXT = colors.HexColor('#047857')  # Emerald 700
COLOR_WARNING_BG = colors.HexColor('#FFFBEB')    # Amber 50
COLOR_WARNING_TEXT = colors.HexColor('#B45309')  # Amber 700
COLOR_DANGER_BG = colors.HexColor('#FFF1F2')     # Rose 50
COLOR_DANGER_TEXT = colors.HexColor('#BE123C')   # Rose 700
COLOR_CODE_BG = colors.HexColor('#1E293B')       # Code block dark
COLOR_CODE_TEXT = colors.HexColor('#F8FAFC')     # Code block text

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute total pages and add professional
    running headers and footers to every page (except cover).
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(COLOR_SECONDARY)

        # Header
        self.drawString(54, 752, "SIH ORIGIN — ENGINEERING EXECUTION OS")
        self.setFont("Helvetica", 7.5)
        self.setFillColor(COLOR_TEXT_MUTED)
        self.drawRightString(558, 752, "SMART INDIA HACKATHON 2026 | PS ID: 26034")

        # Header Divider
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.6)
        self.line(54, 744, 558, 744)

        # Footer Divider
        self.line(54, 48, 558, 48)

        # Footer
        self.setFont("Helvetica", 7.5)
        self.setFillColor(COLOR_TEXT_MUTED)
        self.drawString(54, 36, "Team IRIS / Origin  •  Confidential & Internal Engineering Playbook")
        self.drawRightString(558, 36, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="SIH_Origin_Engineering_Execution_OS.pdf"):
    # Target printable area: 8.5 x 11 inches (letter), margins: 54pt (0.75 in)
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=colors.white,
        spaceAfter=8
    )

    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor('#93C5FD'), # light blue
        spaceAfter=15
    )

    style_cover_meta_label = ParagraphStyle(
        'CoverMetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_TEXT_MUTED
    )

    style_cover_meta_val = ParagraphStyle(
        'CoverMetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_PRIMARY
    )

    style_h1 = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=COLOR_PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=COLOR_ACCENT,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    style_h3 = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=COLOR_SECONDARY,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_TEXT_DARK,
        spaceAfter=5
    )

    style_body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_TEXT_DARK
    )

    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=COLOR_TEXT_DARK,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=COLOR_TEXT_DARK
    )

    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.5,
        textColor=COLOR_TEXT_DARK
    )

    style_table_cell_code = ParagraphStyle(
        'TableCellCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=COLOR_PRIMARY
    )

    style_callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=COLOR_TEXT_DARK
    )

    style_callout_bold = ParagraphStyle(
        'CalloutBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_PRIMARY
    )

    style_prompt_text = ParagraphStyle(
        'PromptText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=COLOR_CODE_TEXT
    )

    story = []

    def make_section_header(num_str, title_str):
        p = Paragraph(f"<b>{num_str}. {title_str.upper()}</b>", style_h1)
        hr = HRFlowable(width="100%", thickness=1.5, color=COLOR_ACCENT, spaceBefore=2, spaceAfter=8)
        return [p, hr]

    def make_card(content_paragraphs, bg_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER):
        t = Table([[content_paragraphs]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_color),
            ('BOX', (0, 0), (-1, -1), 0.8, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 9),
            ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ]))
        return t

    def make_code_box(prompt_lines, label="ANTIGRAVITY PROMPT"):
        flowables = [
            Paragraph(f"<b>[ {label} ]</b>", ParagraphStyle('CodeH', parent=style_body, fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=colors.HexColor('#38BDF8'))),
            Spacer(1, 3)
        ]
        for line in prompt_lines:
            flowables.append(Paragraph(line, style_prompt_text))
        t = Table([[flowables]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), COLOR_CODE_BG),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#334155')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        return t

    # ==========================================
    # PAGE 1: COVER PAGE
    # ==========================================
    cover_header_table = Table([
        [
            [
                Paragraph("<b>SMART INDIA HACKATHON 2026</b>", ParagraphStyle('CoverP1', parent=style_body, fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=colors.HexColor('#60A5FA'))),
                Spacer(1, 4),
                Paragraph("SIH ORIGIN", style_cover_title),
                Paragraph("Engineering Execution OS & Architecture Blueprint", style_cover_subtitle),
                Paragraph("<b>Problem Statement ID:</b> 26034 &nbsp;|&nbsp; <b>Theme:</b> Miscellaneous / Software<br/><b>Title:</b> Software System to Check Compliance of Packaged Commodities under Legal Metrology Rules, 2011", ParagraphStyle('CoverSub', parent=style_body, fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor('#E2E8F0')))
            ]
        ]
    ], colWidths=[504])
    cover_header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_PRIMARY),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_PRIMARY),
        ('TOPPADDING', (0, 0), (-1, -1), 22),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 22),
        ('LEFTPADDING', (0, 0), (-1, -1), 18),
        ('RIGHTPADDING', (0, 0), (-1, -1), 18),
    ]))
    story.append(cover_header_table)
    story.append(Spacer(1, 15))

    # Cover Summary Box
    summary_card = make_card([
        Paragraph("<b>EXECUTIVE OPERATIONAL MANDATE</b>", style_callout_bold),
        Spacer(1, 3),
        Paragraph("This document serves as the single source of truth and practical operating system for <b>Team IRIS</b> to execute, code, integrate, test, and present the <b>SIH Origin</b> platform during the 24-Hour Smart India Hackathon. Built with <b>Google Antigravity</b> as the primary autonomous agentic engineering engine, this blueprint establishes strict phase gates, prompt sequences, data contracts, and judge-aligned demo pathways.", style_callout_text)
    ], bg_color=COLOR_ACCENT_LIGHT, border_color=COLOR_ACCENT)
    story.append(summary_card)
    story.append(Spacer(1, 15))

    # Project Metadata Table
    meta_table_data = [
        [
            Paragraph("<b>PROJECT DETAILS</b>", style_table_header),
            Paragraph("<b>TEAM IRIS SPECIFICATIONS</b>", style_table_header)
        ],
        [
            Paragraph("<b>Project Codename:</b> SIH Origin<br/><b>Event:</b> Smart India Hackathon 2026<br/><b>PS Category:</b> Software (Government Compliance)<br/><b>Target Domain:</b> Legal Metrology Enforcement<br/><b>Primary Tool:</b> Google Antigravity Agentic IDE<br/><b>Target Build Time:</b> 24 Hours (Continuous Sprint)", style_table_cell),
            Paragraph("<b>Team Leader:</b> Karthik V (RA2411056010201 - DSBS)<br/><b>Team Members:</b><br/>• Shrihan P (DSBS)<br/>• Akshith Varma A (DSBS)<br/>• Dhanush Reddy C (DSBS)<br/>• Dharshini K (DSBS)<br/>• Yashwanth Raju (CINTEL)<br/><b>Mentors:</b> Dr. T. Ragupathi &amp; Sravya A", style_table_cell)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[246, 258])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), COLOR_SECONDARY),
        ('BACKGROUND', (0, 1), (1, 1), colors.white),
        ('BOX', (0, 0), (-1, -1), 0.8, COLOR_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # Execution Pillars Box
    pillars_card = make_card([
        Paragraph("<b>CORE ENGINEERING PRINCIPLES FOR THE HACKATHON</b>", style_callout_bold),
        Spacer(1, 3),
        Paragraph("<b>1. One Signature End-to-End Flow First:</b> Never build disconnected features. Build the full loop (Image Ingestion &rarr; OCR Extraction &rarr; Rule Verification &rarr; Evidence Bounding Box Overlay &rarr; Inspection Report).", style_bullet),
        Paragraph("<b>2. Antigravity-First Modularity:</b> Never execute massive monolithic prompts. Execute atomic vertical slices (Schema &rarr; Backend Engine &rarr; Typed API &rarr; UI Components &rarr; Integration).", style_bullet),
        Paragraph("<b>3. Zero-Fail Demo Safeguards:</b> Seed deterministic backup sample data to insulate live presentations from cloud network jitter and external rate limits.", style_bullet)
    ], bg_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER)
    story.append(pillars_card)

    story.append(PageBreak())

    # ==========================================
    # PAGE 2: TABLE OF CONTENTS & EXECUTIVE SUMMARY
    # ==========================================
    story.extend(make_section_header("1", "Table of Contents & Document Architecture"))
    
    toc_data = [
        [Paragraph("<b>Sec</b>", style_table_header), Paragraph("<b>Module / Architecture Section</b>", style_table_header), Paragraph("<b>Core Focus &amp; Deliverables</b>", style_table_header), Paragraph("<b>Page</b>", style_table_header)],
        [Paragraph("2", style_table_cell_bold), Paragraph("Executive Summary &amp; Vision", style_table_cell), Paragraph("Problem statement, core value proposition, demo outcome", style_table_cell), Paragraph("2", style_table_cell)],
        [Paragraph("3", style_table_cell_bold), Paragraph("Problem Understanding &amp; Legal Metrology", style_table_cell), Paragraph("Legal Metrology Act 2011, 7 mandatory declarations, pain points", style_table_cell), Paragraph("3", style_table_cell)],
        [Paragraph("4", style_table_cell_bold), Paragraph("MVP Scope Definition &amp; Guardrails", style_table_cell), Paragraph("MoSCoW framework (Must/Should/Nice), scope anti-patterns", style_table_cell), Paragraph("4", style_table_cell)],
        [Paragraph("5", style_table_cell_bold), Paragraph("End-to-End System Architecture", style_table_cell), Paragraph("Data pipeline, OCR engine, rule validator, visual annotator", style_table_cell), Paragraph("5", style_table_cell)],
        [Paragraph("6", style_table_cell_bold), Paragraph("Production-Grade Technology Stack", style_table_cell), Paragraph("Next.js, FastAPI, PaddleOCR, PostgreSQL, Antigravity rationale", style_table_cell), Paragraph("6", style_table_cell)],
        [Paragraph("7", style_table_cell_bold), Paragraph("Application Modular Specifications", style_table_cell), Paragraph("Inputs, outputs, boundaries for Ingestion, OCR, Rules, UI", style_table_cell), Paragraph("7", style_table_cell)],
        [Paragraph("8", style_table_cell_bold), Paragraph("Database Design &amp; Data Models", style_table_cell), Paragraph("ER Diagram, schema contracts, JSON audit storage", style_table_cell), Paragraph("8", style_table_cell)],
        [Paragraph("9", style_table_cell_bold), Paragraph("REST API Contract Specification", style_table_cell), Paragraph("Typed endpoints, payloads, HTTP responses, error handling", style_table_cell), Paragraph("9", style_table_cell)],
        [Paragraph("10", style_table_cell_bold), Paragraph("Step-by-Step Development Plan", style_table_cell), Paragraph("Phase 0 to Phase 5 execution roadmap and milestones", style_table_cell), Paragraph("10", style_table_cell)],
        [Paragraph("11", style_table_cell_bold), Paragraph("24-Hour Hackathon Hour-by-Hour Timeline", style_table_cell), Paragraph("Operational sprint plan, checkpoint gates, team allocations", style_table_cell), Paragraph("11", style_table_cell)],
        [Paragraph("12", style_table_cell_bold), Paragraph("Antigravity Autonomous Playbook", style_table_cell), Paragraph("Prompt engineering checklist, sequential prompt chain 1–9", style_table_cell), Paragraph("12", style_table_cell)],
        [Paragraph("13", style_table_cell_bold), Paragraph("Verification &amp; Testing Strategy", style_table_cell), Paragraph("Unit rules test, OCR edge cases (blur, curved labels), test matrix", style_table_cell), Paragraph("13", style_table_cell)],
        [Paragraph("14", style_table_cell_bold), Paragraph("Risk Mitigation Matrix", style_table_cell), Paragraph("Failure modes, contingency fallbacks, network drop handling", style_table_cell), Paragraph("14", style_table_cell)],
        [Paragraph("15", style_table_cell_bold), Paragraph("Judge-Focused Demo Strategy &amp; Pitch Script", style_table_cell), Paragraph("3–5 min presentation structure, visual proof demonstration", style_table_cell), Paragraph("15", style_table_cell)],
        [Paragraph("16", style_table_cell_bold), Paragraph("Final Submission &amp; Rehearsal Checklist", style_table_cell), Paragraph("Interactive sign-off checklist for submission readiness", style_table_cell), Paragraph("16", style_table_cell)]
    ]
    toc_table = Table(toc_data, colWidths=[24, 160, 285, 35])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(toc_table)
    story.append(Spacer(1, 10))

    story.extend(make_section_header("2", "Executive Summary & Core Product Vision"))
    story.append(Paragraph("<b>The Challenge:</b> In India, millions of packaged consumer goods are sold daily across physical retail and e-commerce platforms. The Department of Consumer Affairs mandates strict adherence to the <i>Legal Metrology (Packaged Commodities) Rules, 2011</i>. However, compliance enforcement is currently crippled by manual inspections, slow auditing workflows, subjective errors, and inability to parse multilingual, curved, or low-contrast packaging at scale.", style_body))
    story.append(Paragraph("<b>The SIH Origin Solution:</b> SIH Origin is an intelligent, automated regulatory compliance screening platform. It ingests package label photographs or digital e-commerce assets, applies adaptive computer vision and multilingual Optical Character Recognition (OCR), extracts all mandatory declarations, validates them against a codified Legal Metrology rule engine, and generates explainable, evidence-backed compliance verdicts with visual bounding-box highlights.", style_body))
    
    story.append(make_card([
        Paragraph("<b>WHAT THE FINAL MVP MUST DEMONSTRATE TO JUDGES IN 180 SECONDS:</b>", style_callout_bold),
        Spacer(1, 2),
        Paragraph("1. <b>Live Image Ingestion:</b> Instant upload of a real-world product package (e.g. snack, beverage, cosmetic).", style_bullet),
        Paragraph("2. <b>Multilingual Text Extraction:</b> Extraction of text across English and regional Indic scripts with confidence scores.", style_bullet),
        Paragraph("3. <b>Legal Metrology Rule Verification:</b> Instant detection of mandatory declarations (MRP, Net Wt, Mfg Date, Best Before, Origin, Mfg/Packer Details, Consumer Care).", style_bullet),
        Paragraph("4. <b>Visual Evidence Overlay:</b> Interactive canvas highlighting exact package zones where violations (missing MRP, font height violation, obscured expiry) occur.", style_bullet),
        Paragraph("5. <b>Explainable Regulatory Audit Report:</b> One-click PDF audit certificate citing exact legal clauses violated with timestamps and digital hashes.", style_bullet)
    ], bg_color=COLOR_SUCCESS_BG, border_color=COLOR_SUCCESS_TEXT))

    story.append(PageBreak())

    # ==========================================
    # PAGE 3: PROBLEM UNDERSTANDING & DOMAIN DEEP DIVE
    # ==========================================
    story.extend(make_section_header("3", "Problem Understanding & Legal Metrology Framework"))
    
    story.append(Paragraph("<b>Problem Statement ID:</b> 26034 &nbsp;|&nbsp; <b>Ministry/Department:</b> Consumer Affairs, Food &amp; Public Distribution", style_h2))
    story.append(Paragraph("Under the <i>Legal Metrology (Packaged Commodities) Rules, 2011</i> and subsequent amendments, every pre-packaged commodity in India must carry specific mandatory declarations on the principal display panel. Failure to comply attracts heavy penalties, product seizures, and consumer deception risks.", style_body))
    
    story.append(Paragraph("<b>The 7 Mandatory Legal Declarations Required by Law:</b>", style_h3))
    
    mandate_data = [
        [Paragraph("<b>#</b>", style_table_header), Paragraph("<b>Mandatory Declaration</b>", style_table_header), Paragraph("<b>Legal Requirement (LMR 2011)</b>", style_table_header), Paragraph("<b>Common Violation Detected</b>", style_table_header)],
        [Paragraph("1", style_table_cell_bold), Paragraph("Name &amp; Address of Manufacturer / Packer", style_table_cell), Paragraph("Complete physical address with city, state, pincode, and country", style_table_cell), Paragraph("Incomplete address, missing customer care jurisdiction", style_table_cell)],
        [Paragraph("2", style_table_cell_bold), Paragraph("Country of Origin", style_table_cell), Paragraph("Mandatory explicit statement (e.g. 'Made in India', 'Origin: Germany')", style_table_cell), Paragraph("Omitted on imported re-packaged items", style_table_cell)],
        [Paragraph("3", style_table_cell_bold), Paragraph("Common / Generic Name of Commodity", style_table_cell), Paragraph("Clear generic description of the product on display panel", style_table_cell), Paragraph("Obscured brand fancy name without generic description", style_table_cell)],
        [Paragraph("4", style_table_cell_bold), Paragraph("Net Quantity &amp; Standard Unit", style_table_cell), Paragraph("Standard SI metric units (g, kg, ml, L) conforming to standard packing sizes", style_table_cell), Paragraph("Non-standard units (e.g. 'pack of 3' without net mass, fractional errors)", style_table_cell)],
        [Paragraph("5", style_table_cell_bold), Paragraph("Month &amp; Year of Manufacture / Packaging", style_table_cell), Paragraph("Clear MM/YYYY format for manufacturing, packaging, or import", style_table_cell), Paragraph("Unreadable dot-matrix stamp, missing packaging month", style_table_cell)],
        [Paragraph("6", style_table_cell_bold), Paragraph("Maximum Retail Price (MRP)", style_table_cell), Paragraph("Format: 'MRP Rs. XX.XX (incl. of all taxes)' with unit sale price (USP)", style_table_cell), Paragraph("Missing tax inclusion declaration, missing Unit Sale Price (USP)", style_table_cell)],
        [Paragraph("7", style_table_cell_bold), Paragraph("Consumer Care Contact Details", style_table_cell), Paragraph("Name, address, phone number, and email of redressal officer", style_table_cell), Paragraph("Missing email ID, invalid or non-responsive phone format", style_table_cell)]
    ]
    mandate_table = Table(mandate_data, colWidths=[18, 140, 186, 160])
    mandate_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(mandate_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Target Users &amp; Operational Pain Points:</b>", style_h3))
    
    pain_table_data = [
        [Paragraph("<b>Target User Persona</b>", style_table_header), Paragraph("<b>Current Manual Bottleneck</b>", style_table_header), Paragraph("<b>SIH Origin Value Metric</b>", style_table_header)],
        [
            Paragraph("<b>Legal Metrology Officers &amp; Field Inspectors</b>", style_table_cell),
            Paragraph("Must manually read fine-print labels under poor lighting, manually cross-check gazette rules, manually prepare inspection reports.", style_table_cell),
            Paragraph("Inspection time reduced from <b>15 minutes</b> to <b>under 4 seconds</b> per SKU with auto-generated legal notices.", style_table_cell)
        ],
        [
            Paragraph("<b>E-Commerce Compliance Teams</b> (Amazon, Flipkart, Blinkit)", style_table_cell),
            Paragraph("Thousands of third-party seller catalog images uploaded daily with illegal or missing declarations, risking marketplace penalties.", style_table_cell),
            Paragraph("Batch API screening of product images before catalog approval with 99.4% rule conformance verification.", style_table_cell)
        ],
        [
            Paragraph("<b>FMCG Brand Quality &amp; Packaging Engineers</b>", style_table_cell),
            Paragraph("Pre-print label design errors cost millions in recalled packaging runs and statutory fines.", style_table_cell),
            Paragraph("Pre-production packaging artwork validation simulator with instant pass/fail feedback.", style_table_cell)
        ]
    ]
    pain_table = Table(pain_table_data, colWidths=[140, 194, 170])
    pain_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(pain_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 4: MVP DEFINITION & SCOPE GUARDRAILS
    # ==========================================
    story.extend(make_section_header("4", "MVP Scope Definition & Scope Boundaries"))
    story.append(Paragraph("In a competitive hackathon sprint, <b>scope creep is the number one cause of failure</b>. We utilize the MoSCoW framework to establish ironclad boundaries between mandatory deliverables and deferred enhancements.", style_body))
    
    scope_data = [
        [Paragraph("<b>Category</b>", style_table_header), Paragraph("<b>Feature Deliverable</b>", style_table_header), Paragraph("<b>Engineering Acceptance Criteria</b>", style_table_header), Paragraph("<b>Priority</b>", style_table_header)],
        [
            Paragraph("<b>MUST HAVE</b><br/>(P0 - Core MVP)", style_table_cell_bold),
            Paragraph("• Image Ingestion (Upload &amp; Camera)<br/>• Multilingual OCR Engine<br/>• Legal Metrology Rule Engine<br/>• Interactive Visual Bounding Boxes<br/>• Compliance Verdict Dashboard<br/>• Exportable PDF Audit Report", style_table_cell),
            Paragraph("• User can drag-and-drop or upload JPG/PNG.<br/>• Extracts English &amp; Hindi text with bounding boxes.<br/>• Validates MRP, Expiry, Net Qty, Origin, Mfg.<br/>• Overlays green/red bounding boxes on package canvas.<br/>• Computes overall COMPLIANT / NON-COMPLIANT status.<br/>• Downloads formal inspection PDF report.", style_table_cell),
            Paragraph("<font color='#BE123C'><b>NON-NEGOTIABLE FOR DEMO</b></font>", style_table_cell)
        ],
        [
            Paragraph("<b>SHOULD HAVE</b><br/>(P1 - Secondary)", style_table_cell_bold),
            Paragraph("• Unit Sale Price (USP) Calculator<br/>• Image Quality Assessment (Blur/Glare)<br/>• Batch Upload for Catalog Inspection<br/>• Violation Severity Scoring (High/Med/Low)", style_table_cell),
            Paragraph("• Calculates Price per Gram/ML and checks display.<br/>• Recommends 'Retake Image' if confidence &lt; 70%.<br/>• Allows processing 3-5 images in a batch queue.<br/>• Color-coded risk matrix on dashboard.", style_table_cell),
            Paragraph("<font color='#1D4ED8'><b>IF CORE FINISHED BY HR 14</b></font>", style_table_cell)
        ],
        [
            Paragraph("<b>NICE TO HAVE</b><br/>(P2 - Stretch)", style_table_cell_bold),
            Paragraph("• Real-Time Video Camera Feed Stream<br/>• Automated Legal Notice Generator<br/>• Barcode / QR Code Cross-Verification", style_table_cell),
            Paragraph("• Live stream canvas bounding box tracking.<br/>• Auto-fills Section 39 Notice Draft with penalty.<br/>• Reads GS1 barcode and verifies registered weight.", style_table_cell),
            Paragraph("<font color='#475569'><b>PITCH AS 'ROADMAP'</b></font>", style_table_cell)
        ]
    ]
    scope_table = Table(scope_data, colWidths=[90, 160, 184, 70])
    scope_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT, colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(scope_table)
    story.append(Spacer(1, 10))

    story.append(make_card([
        Paragraph("<b>HACKATHON SCOPE ANTI-PATTERNS (WHAT NOT TO BUILD):</b>", style_callout_bold),
        Spacer(1, 2),
        Paragraph("• <b>DO NOT</b> spend hours writing custom OAuth2 enterprise SSO. Use seeded demo auth roles (Inspector / Brand Admin).", style_bullet),
        Paragraph("• <b>DO NOT</b> attempt training custom neural OCR weights from scratch during the hackathon. Use robust pre-trained OCR/Vision pipelines (PaddleOCR + Vision-Language fallback).", style_bullet),
        Paragraph("• <b>DO NOT</b> build full e-commerce scraper spiders. Mock marketplace ingestion via upload and pre-seeded realistic SKUs.", style_bullet),
        Paragraph("• <b>DO NOT</b> deploy distributed Kafka/Celery clusters unless required; in-process async background tasks in FastAPI provide instant reliability.", style_bullet)
    ], bg_color=COLOR_WARNING_BG, border_color=COLOR_WARNING_TEXT))

    story.append(PageBreak())

    # ==========================================
    # PAGE 5: SYSTEM ARCHITECTURE & DATA FLOW
    # ==========================================
    story.extend(make_section_header("5", "End-to-End System Architecture"))
    story.append(Paragraph("SIH Origin follows a decoupled, asynchronous micro-modular architecture optimized for speed, fault tolerance, and explainable AI execution.", style_body))
    
    # Visual Architecture Diagram as formatted Table
    arch_diagram_data = [
        [
            Paragraph("<b>LAYER 1: CLIENT PRESENTATION (Next.js 14 + Tailwind CSS + Lucide Icons)</b><br/>"
                      "• Multi-Image Ingestion Canvas &nbsp;|&nbsp; • Visual Bounding Box Annotator &nbsp;|&nbsp; • Live Compliance Verdict Panel<br/>"
                      "• Inspector Regulatory Dashboard &nbsp;|&nbsp; • One-Click PDF Audit Report Viewer &nbsp;|&nbsp; • Rule Simulator", style_table_cell)
        ],
        [Paragraph("<b>&darr; &nbsp; RESTful HTTPS JSON API (FastAPI Contracts with Pydantic Schema Validation)</b>", ParagraphStyle('ArchArr', parent=style_body_bold, alignment=1, textColor=COLOR_ACCENT))],
        [
            Paragraph("<b>LAYER 2: BACKEND ORCHESTRATION &amp; API GATEWAY (FastAPI + Python 3.11)</b><br/>"
                      "• Scan Ingestion Service &nbsp;|&nbsp; • Image Preprocessor &amp; Rectifier &nbsp;|&nbsp; • Audit Event Logger<br/>"
                      "• Async Pipeline Worker &nbsp;|&nbsp; • PDF Report Generator (ReportLab/WeasyPrint) &nbsp;|&nbsp; • Auth/Role Guards", style_table_cell)
        ],
        [Paragraph("<b>&darr; &nbsp; In-Memory Data Pipe &amp; ORM Data Persistence</b>", ParagraphStyle('ArchArr', parent=style_body_bold, alignment=1, textColor=COLOR_ACCENT))],
        [
            Paragraph("<b>LAYER 3: INTELLIGENCE &amp; REGULATORY COMPLIANCE ENGINE</b><br/>"
                      "<b>A. Computer Vision &amp; OCR:</b> OpenCV (Deskew, CLAHE contrast, Denoise) + PaddleOCR / Tesseract (Multilingual Text &amp; Bounding Boxes)<br/>"
                      "<b>B. Semantic Field Extractor:</b> Regex Parser + NLP Entity Resolver (Extracts MRP, Net Qty, Dates, Mfg, Origin, Consumer Care)<br/>"
                      "<b>C. Legal Metrology Rule Engine:</b> Versioned Python Rule Engine evaluating 7 core rules + Unit Sale Price (USP) equations", style_table_cell)
        ],
        [Paragraph("<b>&darr; &nbsp; Relational Integrity &amp; File Storage</b>", ParagraphStyle('ArchArr', parent=style_body_bold, alignment=1, textColor=COLOR_ACCENT))],
        [
            Paragraph("<b>LAYER 4: DATA PERSISTENCE &amp; KNOWLEDGE BASE</b><br/>"
                      "• <b>PostgreSQL / SQLite:</b> Users, Scan Sessions, Extracted Declarations, Rule Definitions, Violations, Audit Trail<br/>"
                      "• <b>Local / Cloud Storage:</b> Original Product Images, Preprocessed Images, Annotated Canvas Artifacts, Generated PDF Reports", style_table_cell)
        ]
    ]
    arch_diagram_table = Table(arch_diagram_data, colWidths=[504])
    arch_diagram_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_BG_LIGHT),
        ('BACKGROUND', (0, 2), (-1, 2), COLOR_ACCENT_LIGHT),
        ('BACKGROUND', (0, 4), (-1, 4), COLOR_SUCCESS_BG),
        ('BACKGROUND', (0, 6), (-1, 6), COLOR_BG_LIGHT),
        ('BOX', (0, 0), (-1, 0), 1, COLOR_BORDER),
        ('BOX', (0, 2), (-1, 2), 1, COLOR_ACCENT),
        ('BOX', (0, 4), (-1, 4), 1, COLOR_SUCCESS_TEXT),
        ('BOX', (0, 6), (-1, 6), 1, COLOR_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(arch_diagram_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Detailed Layer Responsibilities:</b>", style_h3))
    
    resp_data = [
        [Paragraph("<b>Subsystem</b>", style_table_header), Paragraph("<b>Core Responsibility</b>", style_table_header), Paragraph("<b>Failure Isolation &amp; Recovery</b>", style_table_header)],
        [
            Paragraph("<b>Frontend UI</b>", style_table_cell_bold),
            Paragraph("Renders upload states, displays annotated bounding boxes on canvas, streams scan progress, presents compliance cards.", style_table_cell),
            Paragraph("If backend is slow, shows shimmer loaders; retains local image state on network error.", style_table_cell)
        ],
        [
            Paragraph("<b>Backend API</b>", style_table_cell_bold),
            Paragraph("Validates file types, manages asynchronous scan lifecycle, executes rule engine, formats audit records.", style_table_cell),
            Paragraph("Pydantic strict validation prevents malformed payloads; returns typed RFC 7807 error objects.", style_table_cell)
        ],
        [
            Paragraph("<b>OCR &amp; AI Engine</b>", style_table_cell_bold),
            Paragraph("Detects text coordinates, performs multilingual tokenization, computes confidence metrics per bounding box.", style_table_cell),
            Paragraph("Multi-pass fallback: If primary OCR confidence &lt; 0.6, triggers adaptive thresholding or Gemini VLM fallback.", style_table_cell)
        ],
        [
            Paragraph("<b>Rule Engine</b>", style_table_cell_bold),
            Paragraph("Applies statutory logic: validates presence of 7 mandatory fields, calculates USP validity, verifies date formats.", style_table_cell),
            Paragraph("Deterministic rule engine ensures 100% explainability without AI hallucination risks.", style_table_cell)
        ]
    ]
    resp_table = Table(resp_data, colWidths=[90, 224, 190])
    resp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(resp_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 6: TECHNOLOGY STACK & JUSTIFICATION
    # ==========================================
    story.extend(make_section_header("6", "Production-Grade Technology Stack"))
    story.append(Paragraph("Every technology in the SIH Origin stack is chosen for maximum speed of execution during the hackathon, zero runtime friction, and rock-solid portfolio presentation.", style_body))
    
    stack_data = [
        [Paragraph("<b>Layer</b>", style_table_header), Paragraph("<b>Technology / Tool</b>", style_table_header), Paragraph("<b>Why Chosen for SIH Sprint</b>", style_table_header), Paragraph("<b>Part of System Handled</b>", style_table_header)],
        [
            Paragraph("<b>Frontend Framework</b>", style_table_cell_bold),
            Paragraph("<b>Next.js 14 / React</b><br/>(TypeScript + Vite)", style_table_cell),
            Paragraph("Instant reactivity, fast component iteration, clean modular UI architecture.", style_table_cell),
            Paragraph("Inspector UI, Image Ingestion, Visual Bounding Box Canvas, Stats Dashboard.", style_table_cell)
        ],
        [
            Paragraph("<b>Styling &amp; Design</b>", style_table_cell_bold),
            Paragraph("<b>Tailwind CSS + Lucide Icons</b>", style_table_cell),
            Paragraph("Rapid styling without writing CSS boilerplate; crisp modern engineering look.", style_table_cell),
            Paragraph("Dark/light theme, responsive cards, status badges, inspection modal.", style_table_cell)
        ],
        [
            Paragraph("<b>Backend Framework</b>", style_table_cell_bold),
            Paragraph("<b>FastAPI (Python 3.11)</b>", style_table_cell),
            Paragraph("Fastest Python web framework, automatic OpenAPI docs, native async support for AI.", style_table_cell),
            Paragraph("REST API Gateway, Background Scan Workers, Auth, Compliance Engine.", style_table_cell)
        ],
        [
            Paragraph("<b>Computer Vision</b>", style_table_cell_bold),
            Paragraph("<b>OpenCV (cv2) + PIL</b>", style_table_cell),
            Paragraph("Lightweight, instantaneous image deskewing, noise reduction, and CLAHE contrast.", style_table_cell),
            Paragraph("Image Preprocessing Pipeline, Crop Extraction, Glare Mitigation.", style_table_cell)
        ],
        [
            Paragraph("<b>OCR &amp; Extraction</b>", style_table_cell_bold),
            Paragraph("<b>PaddleOCR / Tesseract</b><br/>+ Gemini Vision Fallback", style_table_cell),
            Paragraph("State-of-the-art multilingual text detection with coordinate bounding boxes.", style_table_cell),
            Paragraph("Text Detection, Script Recognition, Bounding Box Coordinate Mapping.", style_table_cell)
        ],
        [
            Paragraph("<b>Database &amp; ORM</b>", style_table_cell_bold),
            Paragraph("<b>PostgreSQL + SQLAlchemy</b><br/>(SQLite for local instant dev)", style_table_cell),
            Paragraph("Zero-setup relational data model with JSON field support for dynamic rules.", style_table_cell),
            Paragraph("Persistence of Scans, Violations, Product Metadata, Audit Records.", style_table_cell)
        ],
        [
            Paragraph("<b>Report Engine</b>", style_table_cell_bold),
            Paragraph("<b>ReportLab / WeasyPrint</b>", style_table_cell),
            Paragraph("Generates pixel-perfect legal compliance certificates in PDF format on demand.", style_table_cell),
            Paragraph("Statutory Legal Notice &amp; Inspection Audit Report Generation.", style_table_cell)
        ],
        [
            Paragraph("<b>Primary Dev Tool</b>", style_table_cell_bold),
            Paragraph("<b>Google Antigravity</b>", style_table_cell),
            Paragraph("Full-workspace autonomous agentic coding, multi-file edits, instant verification.", style_table_cell),
            Paragraph("Automated code generation, test authoring, prompt execution, debugging.", style_table_cell)
        ]
    ]
    stack_table = Table(stack_data, colWidths=[95, 120, 150, 139])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(stack_table)
    story.append(Spacer(1, 10))

    story.append(make_card([
        Paragraph("<b>WHY THIS STACK GUARANTEES HACKATHON SUCCESS:</b>", style_callout_bold),
        Spacer(1, 2),
        Paragraph("1. <b>Zero Native C++ Compile Friction:</b> OpenCV and PaddleOCR run seamlessly in Python without painful native dependency issues.", style_bullet),
        Paragraph("2. <b>Instant Swagger UI:</b> FastAPI automatically serves interactive API documentation at `/docs`, enabling frontend-backend team parallelization from Hour 2.", style_bullet),
        Paragraph("3. <b>Dual-Mode Persistence:</b> App runs seamlessly on SQLite during disconnected hacking and switches to PostgreSQL for cloud staging via a single `.env` variable.", style_bullet)
    ], bg_color=COLOR_ACCENT_LIGHT, border_color=COLOR_ACCENT))

    story.append(PageBreak())

    # ==========================================
    # PAGE 7: APPLICATION MODULE SPECIFICATIONS
    # ==========================================
    story.extend(make_section_header("7", "Application Modular Specifications"))
    story.append(Paragraph("The system is decomposed into 6 independent, testable modules with strict interface boundaries to allow concurrent implementation.", style_body))
    
    modules_data = [
        [Paragraph("<b>Module Name &amp; Purpose</b>", style_table_header), Paragraph("<b>Inputs &amp; Preconditions</b>", style_table_header), Paragraph("<b>Outputs &amp; Data Contract</b>", style_table_header), Paragraph("<b>Dependencies</b>", style_table_header)],
        [
            Paragraph("<b>MOD-01: Ingestion &amp; Preprocessing</b><br/>Accepts packaging images, assesses sharpness, applies CLAHE contrast &amp; deskewing.", style_table_cell),
            Paragraph("• Raw image file (JPG/PNG/WEBP)<br/>• Scan metadata (category, source)", style_table_cell),
            Paragraph("• Clean preprocessed image<br/>• Quality Score (Blur/Glare index)<br/>• Dimensions (W, H)", style_table_cell),
            Paragraph("OpenCV, NumPy, Pillow", style_table_cell)
        ],
        [
            Paragraph("<b>MOD-02: Multilingual OCR Engine</b><br/>Performs character detection and recognition across English and Indic scripts.", style_table_cell),
            Paragraph("• Preprocessed image array<br/>• Target languages (en, hi, etc.)", style_table_cell),
            Paragraph("• List of detected text tokens<br/>• Bounding box coords `[x, y, w, h]`<br/>• Confidence scores `[0.0-1.0]`", style_table_cell),
            Paragraph("PaddleOCR / Tesseract", style_table_cell)
        ],
        [
            Paragraph("<b>MOD-03: Declaration Parser &amp; Extractor</b><br/>Maps raw OCR tokens to the 7 mandatory Legal Metrology declaration fields.", style_table_cell),
            Paragraph("• OCR tokens &amp; spatial coords<br/>• Product category dictionary", style_table_cell),
            Paragraph("• Structured JSON object:<br/>`mrp`, `net_qty`, `mfg_date`, `expiry_date`, `origin`, `mfg_details`, `care`", style_table_cell),
            Paragraph("Regex Engine, Pydantic", style_table_cell)
        ],
        [
            Paragraph("<b>MOD-04: Legal Metrology Rule Engine</b><br/>Evaluates extracted declarations against statutory Legal Metrology rules.", style_table_cell),
            Paragraph("• Structured declaration JSON<br/>• Packaged Commodities Ruleset 2011", style_table_cell),
            Paragraph("• Compliance Verdict (Pass/Fail)<br/>• List of Violations with Rule IDs<br/>• Severity &amp; Statutory Penalty", style_table_cell),
            Paragraph("Python Rule Engine", style_table_cell)
        ],
        [
            Paragraph("<b>MOD-05: Visual Overlay &amp; Annotator</b><br/>Draws color-coded bounding boxes on image canvas for visual explainability.", style_table_cell),
            Paragraph("• Raw image URL<br/>• Bounding boxes + Violation status", style_table_cell),
            Paragraph("• Rendered SVG/Canvas overlay<br/>• Green boxes for Compliant fields<br/>• Red boxes for Violations/Missing", style_table_cell),
            Paragraph("HTML5 Canvas / React SVG", style_table_cell)
        ],
        [
            Paragraph("<b>MOD-06: Report &amp; Audit Exporter</b><br/>Compiles compliance analysis into an official government inspection certificate.", style_table_cell),
            Paragraph("• Scan ID, Inspector ID<br/>• Violations, Image Evidence", style_table_cell),
            Paragraph("• Downloadable PDF Certificate<br/>• Digital SHA-256 Audit Hash<br/>• Formal Notice Draft", style_table_cell),
            Paragraph("ReportLab, Cryptography", style_table_cell)
        ]
    ]
    modules_table = Table(modules_data, colWidths=[130, 115, 165, 94])
    modules_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(modules_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 8: DATABASE DESIGN & DATA MODELS
    # ==========================================
    story.extend(make_section_header("8", "Database Design & Data Contracts"))
    story.append(Paragraph("The relational data model guarantees auditability, traceability, and instantaneous query performance for compliance statistics and historical investigations.", style_body))
    
    # ER Schema Table
    db_schema_data = [
        [Paragraph("<b>Entity / Table</b>", style_table_header), Paragraph("<b>Primary &amp; Foreign Keys</b>", style_table_header), Paragraph("<b>Core Attributes &amp; Data Types</b>", style_table_header), Paragraph("<b>Purpose &amp; Integrity Rules</b>", style_table_header)],
        [
            Paragraph("<b>users</b>", style_table_cell_bold),
            Paragraph("`id` (PK, UUID)", style_table_cell_code),
            Paragraph("`name` (VARCHAR), `email` (VARCHAR, UNIQUE), `role` (ENUM: inspector, brand_admin, auditor), `created_at` (TIMESTAMP)", style_table_cell),
            Paragraph("Authentication &amp; role-based access control for enforcement officers.", style_table_cell)
        ],
        [
            Paragraph("<b>scan_sessions</b>", style_table_cell_bold),
            Paragraph("`id` (PK, UUID)<br/>`user_id` (FK &rarr; users.id)", style_table_cell_code),
            Paragraph("`product_name` (VARCHAR), `category` (VARCHAR), `image_url` (VARCHAR), `status` (ENUM: pending, completed, failed), `overall_verdict` (ENUM: compliant, non_compliant), `confidence_score` (FLOAT), `created_at` (TIMESTAMP)", style_table_cell),
            Paragraph("Root entity for every packaging scan session performed.", style_table_cell)
        ],
        [
            Paragraph("<b>extracted_fields</b>", style_table_cell_bold),
            Paragraph("`id` (PK, UUID)<br/>`scan_id` (FK &rarr; scan_sessions.id)", style_table_cell_code),
            Paragraph("`field_type` (ENUM: mrp, net_quantity, mfg_date, expiry_date, country_origin, mfg_address, consumer_care), `raw_text` (TEXT), `normalized_value` (VARCHAR), `bbox` (JSONB: {x,y,w,h}), `confidence` (FLOAT)", style_table_cell),
            Paragraph("Stores extracted tokens with bounding box coordinates.", style_table_cell)
        ],
        [
            Paragraph("<b>compliance_rules</b>", style_table_cell_bold),
            Paragraph("`id` (PK, VARCHAR)", style_table_cell_code),
            Paragraph("`rule_name` (VARCHAR), `legal_clause` (VARCHAR: 'Rule 6(1)(a)'), `description` (TEXT), `is_mandatory` (BOOLEAN), `severity` (ENUM: critical, high, medium)", style_table_cell),
            Paragraph("Versioned statutory knowledge base of Legal Metrology rules.", style_table_cell)
        ],
        [
            Paragraph("<b>violations</b>", style_table_cell_bold),
            Paragraph("`id` (PK, UUID)<br/>`scan_id` (FK &rarr; scan_sessions.id)<br/>`rule_id` (FK &rarr; compliance_rules.id)", style_table_cell_code),
            Paragraph("`field_type` (VARCHAR), `violation_type` (ENUM: missing, invalid_format, unreadable, font_size_error), `description` (TEXT), `evidence_snippet` (TEXT), `created_at` (TIMESTAMP)", style_table_cell),
            Paragraph("Specific statutory breaches identified with supporting evidence.", style_table_cell)
        ],
        [
            Paragraph("<b>audit_logs</b>", style_table_cell_bold),
            Paragraph("`id` (PK, UUID)<br/>`scan_id` (FK &rarr; scan_sessions.id)", style_table_cell_code),
            Paragraph("`action` (VARCHAR), `sha256_hash` (VARCHAR), `report_url` (VARCHAR), `inspector_notes` (TEXT), `timestamp` (TIMESTAMP)", style_table_cell),
            Paragraph("Tamper-evident legal audit log for court-admissible evidence.", style_table_cell)
        ]
    ]
    db_schema_table = Table(db_schema_data, colWidths=[90, 115, 175, 124])
    db_schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(db_schema_table)
    story.append(Spacer(1, 10))

    # Entity Relationship Representation Box
    er_card = make_card([
        Paragraph("<b>ENTITY RELATIONSHIP &amp; CARDINALITY SUMMARY</b>", style_callout_bold),
        Spacer(1, 2),
        Paragraph("• <b>users (1) &rarr; (N) scan_sessions:</b> An enforcement officer performs multiple packaging scan inspections.", style_bullet),
        Paragraph("• <b>scan_sessions (1) &rarr; (N) extracted_fields:</b> Each scan parses multiple text declarations with coordinate bounding boxes.", style_bullet),
        Paragraph("• <b>scan_sessions (1) &rarr; (N) violations:</b> A non-compliant package links to one or more statutory violation events.", style_bullet),
        Paragraph("• <b>compliance_rules (1) &rarr; (N) violations:</b> Each violation references the official Legal Metrology clause broken.", style_bullet),
        Paragraph("• <b>scan_sessions (1) &rarr; (1) audit_logs:</b> Generates a cryptographic verification hash for the final legal audit certificate.", style_bullet)
    ], bg_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER)
    story.append(er_card)

    story.append(PageBreak())

    # ==========================================
    # PAGE 9: REST API DESIGN & CONTRACTS
    # ==========================================
    story.extend(make_section_header("9", "REST API Contract Specification"))
    story.append(Paragraph("All API endpoints return standard JSON payloads with HTTP status codes and typed RFC 7807 error responses.", style_body))
    
    api_data = [
        [Paragraph("<b>Endpoint</b>", style_table_header), Paragraph("<b>Method</b>", style_table_header), Paragraph("<b>Request Payload / Params</b>", style_table_header), Paragraph("<b>Success Response (200/201)</b>", style_table_header), Paragraph("<b>Purpose</b>", style_table_header)],
        [
            Paragraph("`/api/v1/auth/login`", style_table_cell_code),
            Paragraph("POST", style_table_cell_bold),
            Paragraph("`{ email, password }`", style_table_cell_code),
            Paragraph("`{ access_token, user: { id, name, role } }`", style_table_cell_code),
            Paragraph("Demo authentication &amp; role assignment.", style_table_cell)
        ],
        [
            Paragraph("`/api/v1/scans/upload`", style_table_cell_code),
            Paragraph("POST", style_table_cell_bold),
            Paragraph("`multipart/form-data: file, product_name, category`", style_table_cell_code),
            Paragraph("`{ scan_id, image_url, status: 'uploaded' }`", style_table_cell_code),
            Paragraph("Ingests package photograph and creates session.", style_table_cell)
        ],
        [
            Paragraph("`/api/v1/scans/{id}/process`", style_table_cell_code),
            Paragraph("POST", style_table_cell_bold),
            Paragraph("`{ language_hints: ['en', 'hi'] }`", style_table_cell_code),
            Paragraph("`{ scan_id, status: 'processed', ocr_token_count: 38 }`", style_table_cell_code),
            Paragraph("Triggers CV preprocessing and OCR pipeline.", style_table_cell)
        ],
        [
            Paragraph("`/api/v1/scans/{id}/evaluate`", style_table_cell_code),
            Paragraph("GET", style_table_cell_bold),
            Paragraph("Path param: `id`", style_table_cell_code),
            Paragraph("`{ scan_id, verdict: 'NON_COMPLIANT', violations: [...], fields: [...] }`", style_table_cell_code),
            Paragraph("Runs Legal Metrology rule engine on extracted data.", style_table_cell)
        ],
        [
            Paragraph("`/api/v1/scans/{id}/report`", style_table_cell_code),
            Paragraph("GET", style_table_cell_bold),
            Paragraph("Path param: `id`, query: `format=pdf`", style_table_cell_code),
            Paragraph("`application/pdf (binary stream with Content-Disposition)`", style_table_cell_code),
            Paragraph("Downloads formal PDF Legal Metrology audit certificate.", style_table_cell)
        ],
        [
            Paragraph("`/api/v1/rules`", style_table_cell_code),
            Paragraph("GET", style_table_cell_bold),
            Paragraph("Optional query: `category=food`", style_table_cell_code),
            Paragraph("`{ rules: [ { id, rule_name, legal_clause, severity } ] }`", style_table_cell_code),
            Paragraph("Fetches versioned Legal Metrology rule library.", style_table_cell)
        ],
        [
            Paragraph("`/api/v1/dashboard/metrics`", style_table_cell_code),
            Paragraph("GET", style_table_cell_bold),
            Paragraph("None", style_table_cell_code),
            Paragraph("`{ total_scans: 142, compliance_rate: 78.4, top_violations: [...] }`", style_table_cell_code),
            Paragraph("Powers inspector dashboard summary analytics.", style_table_cell)
        ]
    ]
    api_table = Table(api_data, colWidths=[120, 42, 110, 132, 100])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 10))

    # Sample JSON Schema snippet
    json_snippet = [
        '{',
        '  "scan_id": "7f8b9a12-4c2e-4b68-8721-a1b2c3d4e5f6",',
        '  "product_name": "Premium Digestive Biscuits 500g",',
        '  "overall_verdict": "NON_COMPLIANT",',
        '  "violations_count": 2,',
        '  "violations": [',
        '    { "rule_id": "LMR-06", "clause": "Rule 6(1)(e)", "field": "mrp", "issue": "Unit Sale Price (USP) Missing", "severity": "CRITICAL" },',
        '    { "rule_id": "LMR-07", "clause": "Rule 6(1)(g)", "field": "consumer_care", "issue": "Consumer Care Email Invalid", "severity": "MEDIUM" }',
        '  ],',
        '  "audit_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"',
        '}'
    ]
    story.append(make_code_box(json_snippet, label="SAMPLE API RESPONSE CONTRACT: /api/v1/scans/{id}/evaluate"))

    story.append(PageBreak())

    # ==========================================
    # PAGE 10: STEP-BY-STEP DEVELOPMENT PLAN
    # ==========================================
    story.extend(make_section_header("10", "Step-by-Step Development Plan"))
    story.append(Paragraph("Execution must proceed strictly in vertical phases. No phase may begin until its predecessor milestone is demonstrably verified.", style_body))
    
    phases_data = [
        [Paragraph("<b>Phase &amp; Sprint Timing</b>", style_table_header), Paragraph("<b>Key Engineering Deliverables</b>", style_table_header), Paragraph("<b>Antigravity AI Focus</b>", style_table_header), Paragraph("<b>Verification Gate (Milestone)</b>", style_table_header)],
        [
            Paragraph("<b>PHASE 0:<br/>Setup &amp; Skeleton</b><br/>(Hours 0 – 2)", style_table_cell_bold),
            Paragraph("• Initialize monorepo (`frontend/`, `backend/`)<br/>• Configure Python venv, FastAPI, Next.js<br/>• Set up `.env`, CORS, folder structures<br/>• Freeze data contracts and schema definitions", style_table_cell),
            Paragraph("Scaffold project directory, setup FastAPI router, setup Next.js Tailwind boilerplate.", style_table_cell),
            Paragraph("<b>M0:</b> 'Hello World' runs on `http://localhost:3000` and API docs load at `http://localhost:8000/docs`.", style_table_cell)
        ],
        [
            Paragraph("<b>PHASE 1:<br/>Data &amp; Core Engine</b><br/>(Hours 2 – 6)", style_table_cell_bold),
            Paragraph("• Build SQLAlchemy models &amp; SQLite/Postgres DB<br/>• Implement OpenCV preprocessing pipeline<br/>• Implement PaddleOCR / Tesseract extraction<br/>• Build Regex declaration parser for 7 fields", style_table_cell),
            Paragraph("Generate database schema, write CV deskew functions, implement OCR parser utility.", style_table_cell),
            Paragraph("<b>M1:</b> CLI test script processes sample image and returns clean JSON extracted fields.", style_table_cell)
        ],
        [
            Paragraph("<b>PHASE 2:<br/>Legal Rule Engine</b><br/>(Hours 6 – 10)", style_table_cell_bold),
            Paragraph("• Codify 7 Legal Metrology Rules in Python<br/>• Implement Unit Sale Price (USP) validator<br/>• Build violation scoring and evidence mapper<br/>• Implement ReportLab PDF generator", style_table_cell),
            Paragraph("Generate Legal Metrology rule engine class, write unit tests for rules, create PDF export engine.", style_table_cell),
            Paragraph("<b>M2:</b> Given extracted JSON, rule engine outputs verified verdict and generates downloadable PDF report.", style_table_cell)
        ],
        [
            Paragraph("<b>PHASE 3:<br/>Frontend &amp; Canvas</b><br/>(Hours 10 – 14)", style_table_cell_bold),
            Paragraph("• Build drag-and-drop Image Upload UI<br/>• Implement Interactive Canvas for Bounding Boxes<br/>• Build Compliance Verdict Card &amp; Badges<br/>• Build Inspector Analytics Dashboard", style_table_cell),
            Paragraph("Generate React canvas overlay component, build Tailwind dashboard cards and status pills.", style_table_cell),
            Paragraph("<b>M3:</b> Frontend successfully renders test image with color-coded bounding boxes.", style_table_cell)
        ],
        [
            Paragraph("<b>PHASE 4:<br/>Full Integration</b><br/>(Hours 14 – 18)", style_table_cell_bold),
            Paragraph("• Connect Next.js frontend to FastAPI backend<br/>• Implement loading spinners, skeleton states<br/>• Handle edge cases (blurry image, missing field)<br/>• Add confidence score meters and tooltips", style_table_cell),
            Paragraph("Write Axios/fetch API hooks, build error boundaries, wire end-to-end user state.", style_table_cell),
            Paragraph("<b>M4:</b> Uploading a real image executes full pipeline end-to-end in under 4 seconds.", style_table_cell)
        ],
        [
            Paragraph("<b>PHASE 5:<br/>Polish &amp; Demo Prep</b><br/>(Hours 18 – 24)", style_table_cell_bold),
            Paragraph("• Seed 6 curated demo product test cases<br/>• Record backup offline demo video<br/>• Finalize slide deck and rehearse 3-min pitch<br/>• Freeze GitHub repository and test deployment", style_table_cell),
            Paragraph("Seed realistic database records, write README documentation, create slide talking points.", style_table_cell),
            Paragraph("<b>M5:</b> Flawless 3-minute demo execution with zero unexpected crashes or delays.", style_table_cell)
        ]
    ]
    phases_table = Table(phases_data, colWidths=[90, 160, 120, 134])
    phases_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(phases_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 11: 24-HOUR HACKATHON TIMELINE
    # ==========================================
    story.extend(make_section_header("11", "24-Hour Hackathon Hour-by-Hour Timeline"))
    story.append(Paragraph("This tactical timeline synchronizes the entire 6-member engineering team with scheduled check-in gates and zero dead time.", style_body))
    
    timeline_data = [
        [Paragraph("<b>Sprint Block</b>", style_table_header), Paragraph("<b>Team Tracks &amp; Concrete Tasks</b>", style_table_header), Paragraph("<b>Key Checkpoint Gate</b>", style_table_header), Paragraph("<b>Risk Trigger</b>", style_table_header)],
        [
            Paragraph("<b>Hour 00 – 02<br/>(Kickoff &amp; Setup)</b>", style_table_cell_bold),
            Paragraph("• Freeze MVP scope &amp; team roles.<br/>• Scaffold monorepo with Antigravity.<br/>• Set up Git branch protection and shared `.env`.", style_table_cell),
            Paragraph("<b>GATE 1:</b> Both backend and frontend servers running cleanly on all dev machines.", style_table_cell),
            Paragraph("Scope debate &gt; 30 min.<br/><i>Action: Team Lead freezes scope.</i>", style_table_cell)
        ],
        [
            Paragraph("<b>Hour 02 – 06<br/>(Core Engines)</b>", style_table_cell_bold),
            Paragraph("• Track A: Build OpenCV preprocessor &amp; OCR parser.<br/>• Track B: Codify Legal Metrology rules in Python.<br/>• Track C: Build Next.js dashboard and upload shell.", style_table_cell),
            Paragraph("<b>GATE 2:</b> OCR extracts fields from 3 test product images in CLI.", style_table_cell),
            Paragraph("OCR installation issues.<br/><i>Action: Fall back to cloud API.</i>", style_table_cell)
        ],
        [
            Paragraph("<b>Hour 06 – 10<br/>(Rule Engine &amp; API)</b>", style_table_cell_bold),
            Paragraph("• Wire OCR output into Rule Engine.<br/>• Implement FastAPI scan endpoints.<br/>• Build PDF export generator with ReportLab.", style_table_cell),
            Paragraph("<b>GATE 3:</b> Full API pipeline executes via Swagger docs with PDF download.", style_table_cell),
            Paragraph("Complex regex stalls.<br/><i>Action: Simplify regex boundaries.</i>", style_table_cell)
        ],
        [
            Paragraph("<b>Hour 10 – 14<br/>(UI Canvas &amp; BBox)</b>", style_table_cell_bold),
            Paragraph("• Implement React SVG Bounding Box overlay canvas.<br/>• Build interactive violation drawer and filters.<br/>• Add live compliance score gauges.", style_table_cell),
            Paragraph("<b>GATE 4:</b> UI displays image with dynamic green/red bounding boxes.", style_table_cell),
            Paragraph("Canvas coordinate mismatch.<br/><i>Action: Normalize to 0-100% scale.</i>", style_table_cell)
        ],
        [
            Paragraph("<b>Hour 14 – 18<br/>(Full Integration)</b>", style_table_cell_bold),
            Paragraph("• Connect Next.js frontend to FastAPI backend.<br/>• Add loading skeletons and error toasts.<br/>• Implement batch scan preview and history table.", style_table_cell),
            Paragraph("<b>GATE 5:</b> End-to-end user upload &rarr; scan &rarr; visual verdict in browser.", style_table_cell),
            Paragraph("CORS or async block.<br/><i>Action: Simplify state store.</i>", style_table_cell)
        ],
        [
            Paragraph("<b>Hour 18 – 21<br/>(Testing &amp; Polish)</b>", style_table_cell_bold),
            Paragraph("• Seed 6 curated demo products (3 Compliant, 3 Non-Compliant).<br/>• Fix UI responsive bugs &amp; edge cases.<br/>• Record clean offline backup demo video.", style_table_cell),
            Paragraph("<b>GATE 6:</b> Zero errors on 10 consecutive test runs.", style_table_cell),
            Paragraph("New feature ideas.<br/><i>Action: STRICT CODE FREEZE.</i>", style_table_cell)
        ],
        [
            Paragraph("<b>Hour 21 – 24<br/>(Demo Rehearsal)</b>", style_table_cell_bold),
            Paragraph("• Complete presentation slide deck.<br/>• Conduct 4 timed mock pitch rehearsals (3 min pitch + 2 min Q&amp;A).<br/>• Final submission upload.", style_table_cell),
            Paragraph("<b>GATE 7:</b> Final submission verified on SIH portal.", style_table_cell),
            Paragraph("Pitch running over 4 min.<br/><i>Action: Cut intro, jump to demo.</i>", style_table_cell)
        ]
    ]
    timeline_table = Table(timeline_data, colWidths=[80, 180, 130, 114])
    timeline_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(timeline_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 12: ANTIGRAVITY DEVELOPMENT PLAYBOOK
    # ==========================================
    story.extend(make_section_header("12", "Antigravity Development Playbook & Prompt Architecture"))
    story.append(Paragraph("Google Antigravity is your primary autonomous agentic engineering engine. To achieve 10x engineering velocity without breaking architecture, follow these strict prompt rules.", style_body))
    
    story.append(Paragraph("<b>The Golden Rules of Antigravity Execution:</b>", style_h3))
    story.append(Paragraph("• <b>Never Ask for the Whole App in One Prompt:</b> Monolithic prompts lead to hallucinated imports, omitted edge cases, and incomplete files. Prompt in isolated, vertical slices.", style_bullet))
    story.append(Paragraph("• <b>Provide Exact Data Contracts in Every Prompt:</b> Always include the Pydantic model or TypeScript interface in the prompt context.", style_bullet))
    story.append(Paragraph("• <b>Test Immediately After Every Generation:</b> Run the generated module CLI or unit test before prompting the next feature.", style_bullet))
    
    story.append(Spacer(1, 5))
    story.append(Paragraph("<b>Sequential Antigravity Prompt Checklist (Execute in Exact Order):</b>", style_h2))

    # Prompts Sequence Table
    prompts_data = [
        [Paragraph("<b>Step</b>", style_table_header), Paragraph("<b>Prompt Target &amp; Directive</b>", style_table_header), Paragraph("<b>Exact Prompt Template to Give Antigravity</b>", style_table_header)],
        [
            Paragraph("<b>P-01</b>", style_table_cell_bold),
            Paragraph("<b>Project Architecture &amp; Scaffolding</b>", style_table_cell),
            Paragraph("`Create a production-grade monorepo for SIH Origin. Backend: FastAPI (Python 3.11) with routers for /auth, /scans, /rules, /dashboard. Frontend: Next.js 14 with TypeScript and Tailwind CSS. Include Dockerfile, .env.example, and strict CORS configuration.`", style_table_cell_code)
        ],
        [
            Paragraph("<b>P-02</b>", style_table_cell_bold),
            Paragraph("<b>Database Schema &amp; Models</b>", style_table_cell),
            Paragraph("`Create SQLAlchemy database models and Pydantic schemas in backend/models/ for: User, ScanSession, ExtractedField, ComplianceRule, Violation, and AuditLog. Include SQLite database initialization script and seed data for Legal Metrology Rules.`", style_table_cell_code)
        ],
        [
            Paragraph("<b>P-03</b>", style_table_cell_bold),
            Paragraph("<b>CV Preprocessor &amp; OCR</b>", style_table_cell),
            Paragraph("`Implement backend/services/ocr_service.py. Use OpenCV for CLAHE contrast enhancement and deskewing, followed by PaddleOCR / Tesseract to extract text tokens with normalized [x,y,w,h] bounding boxes and confidence scores. Include fallback handling.`", style_table_cell_code)
        ],
        [
            Paragraph("<b>P-04</b>", style_table_cell_bold),
            Paragraph("<b>Declaration Parser</b>", style_table_cell),
            Paragraph("`Build backend/services/parser_service.py to parse raw OCR tokens into structured fields: MRP, Net Quantity, Mfg Date, Expiry Date, Country of Origin, Manufacturer Address, and Consumer Care details using robust regex and fuzzy matching.`", style_table_cell_code)
        ],
        [
            Paragraph("<b>P-05</b>", style_table_cell_bold),
            Paragraph("<b>Legal Metrology Rule Engine</b>", style_table_cell),
            Paragraph("`Implement backend/services/rule_engine.py. Validate the 7 mandatory Legal Metrology declarations. Calculate Unit Sale Price (USP) conformance. Return structured verdict (COMPLIANT / NON_COMPLIANT), violation list, and statutory legal clause citations.`", style_table_cell_code)
        ],
        [
            Paragraph("<b>P-06</b>", style_table_cell_bold),
            Paragraph("<b>PDF Inspection Report Engine</b>", style_table_cell),
            Paragraph("`Create backend/services/report_service.py using ReportLab to generate a formal, government-style PDF Legal Metrology Inspection Certificate. Include QR code, SHA-256 digital hash, violation table, and image evidence snapshot.`", style_table_cell_code)
        ],
        [
            Paragraph("<b>P-07</b>", style_table_cell_bold),
            Paragraph("<b>Frontend Bounding Box Canvas</b>", style_table_cell),
            Paragraph("`Create frontend/components/ScanCanvas.tsx. Render the uploaded product image with interactive SVG/HTML5 bounding boxes. Color code: Green = Compliant, Red = Violation, Yellow = Low Confidence. Clicking a box highlights the corresponding rule violation.`", style_table_cell_code)
        ],
        [
            Paragraph("<b>P-08</b>", style_table_cell_bold),
            Paragraph("<b>Full Dashboard UI &amp; State</b>", style_table_cell),
            Paragraph("`Build the complete Next.js inspector dashboard: drag-and-drop file upload, live scan progress indicator, compliance summary scorecards, violation breakdown drawer, and 1-click PDF download button.`", style_table_cell_code)
        ],
        [
            Paragraph("<b>P-09</b>", style_table_cell_bold),
            Paragraph("<b>Demo Seeding &amp; Smoke Tests</b>", style_table_cell),
            Paragraph("`Write a Python script backend/scripts/seed_demo.py that populates the database with 6 realistic product inspection scenarios (3 compliant, 3 with blatant Legal Metrology violations) and automated smoke tests verifying all endpoints.`", style_table_cell_code)
        ]
    ]
    prompts_table = Table(prompts_data, colWidths=[35, 125, 344])
    prompts_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(prompts_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 13: TESTING STRATEGY & TEST MATRIX
    # ==========================================
    story.extend(make_section_header("13", "Testing & Verification Strategy"))
    story.append(Paragraph("Testing during the hackathon is not a post-finish luxury; it is the safety net that prevents live presentation failures.", style_body))
    
    test_matrix_data = [
        [Paragraph("<b>Test Category</b>", style_table_header), Paragraph("<b>Test Case &amp; Input Condition</b>", style_table_header), Paragraph("<b>Expected Output &amp; System Behavior</b>", style_table_header), Paragraph("<b>Pass Criteria</b>", style_table_header)],
        [
            Paragraph("<b>Happy Path (Compliant SKU)</b>", style_table_cell_bold),
            Paragraph("High-res photo of standard biscuit pack containing all 7 mandatory declarations with valid USP.", style_table_cell),
            Paragraph("All 7 fields extracted with &gt; 85% confidence; verdict = `COMPLIANT`; 0 violations logged.", style_table_cell),
            Paragraph("Green banner, PDF report generated with clean clearance certificate.", style_table_cell)
        ],
        [
            Paragraph("<b>Missing Declaration (Violation)</b>", style_table_cell_bold),
            Paragraph("Packaged snack missing 'Country of Origin' and missing Customer Care email.", style_table_cell),
            Paragraph("Extraction marks fields as `NOT_DETECTED`; verdict = `NON_COMPLIANT`; 2 violations citing Rule 6(1)(n) &amp; Rule 6(1)(k).", style_table_cell),
            Paragraph("Red bounding box overlays and statutory warning notice generated.", style_table_cell)
        ],
        [
            Paragraph("<b>Invalid MRP / Missing USP</b>", style_table_cell_bold),
            Paragraph("Product displays `MRP Rs. 150` on a 750g pack without printing Unit Sale Price (`Rs. 0.20 per g`).", style_table_cell),
            Paragraph("Rule Engine identifies missing Unit Sale Price violation under Legal Metrology Amendment Rules 2022.", style_table_cell),
            Paragraph("Flags violation with calculated expected USP value.", style_table_cell)
        ],
        [
            Paragraph("<b>Image Quality Edge Case</b>", style_table_cell_bold),
            Paragraph("Severely blurred or dark photo where OCR average confidence &lt; 0.50.", style_table_cell),
            Paragraph("System flags `LOW_CONFIDENCE_WARNING` and displays UI prompt: 'Image unclear, retake under better lighting'.", style_table_cell),
            Paragraph("Graceful UI warning without crashing or throwing 500 error.", style_table_cell)
        ],
        [
            Paragraph("<b>Bilingual / Indic Script</b>", style_table_cell_bold),
            Paragraph("Product package with Hindi text for manufacturer details (`निर्माता: ...`).", style_table_cell),
            Paragraph("Multilingual OCR parses Devanagari script and correctly resolves manufacturer entity.", style_table_cell),
            Paragraph("Correctly maps Devanagari tokens to `mfg_address` field.", style_table_cell)
        ]
    ]
    test_matrix_table = Table(test_matrix_data, colWidths=[100, 134, 150, 120])
    test_matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(test_matrix_table)
    story.append(Spacer(1, 10))

    story.append(make_card([
        Paragraph("<b>DEMO-DAY SMOKE TEST CHECKLIST (RUN 1 HOUR BEFORE JUDGING):</b>", style_callout_bold),
        Spacer(1, 2),
        Paragraph("<b>[  ]</b> Verify backend server is running on `localhost:8000` with zero memory leaks.", style_bullet),
        Paragraph("<b>[  ]</b> Verify frontend dev server is running on `localhost:3000` without uncaught console errors.", style_bullet),
        Paragraph("<b>[  ]</b> Pre-load the 6 demo product images into an easily accessible desktop folder (`/demo_assets/`).", style_bullet),
        Paragraph("<b>[  ]</b> Run 1 full end-to-end scan through the UI to warm up the OCR model caches.", style_bullet),
        Paragraph("<b>[  ]</b> Ensure browser zoom is set to 100% and dark/light contrast looks optimal on projector.", style_bullet)
    ], bg_color=COLOR_SUCCESS_BG, border_color=COLOR_SUCCESS_TEXT))

    story.append(PageBreak())

    # ==========================================
    # PAGE 14: RISKS & MITIGATION MATRIX
    # ==========================================
    story.extend(make_section_header("14", "Risks & Contingency Mitigation Matrix"))
    story.append(Paragraph("In a live hackathon environment, unforeseen technical and environmental failures happen. Every identified risk has an immediate, rehearsed mitigation fallback.", style_body))
    
    risk_data = [
        [Paragraph("<b>Identified Risk Event</b>", style_table_header), Paragraph("<b>Severity / Impact</b>", style_table_header), Paragraph("<b>Root Cause / Scenario</b>", style_table_header), Paragraph("<b>Pre-Engineered Mitigation &amp; Fallback</b>", style_table_header)],
        [
            Paragraph("<b>Local OCR Model Latency / Crash</b>", style_table_cell_bold),
            Paragraph("<font color='#BE123C'><b>HIGH</b></font><br/>Blocks live demo", style_table_cell),
            Paragraph("Local machine GPU memory exhaustion or slow CPU inference during live test.", style_table_cell),
            Paragraph("<b>Fallback:</b> Pre-configure a lightweight Gemini 1.5 Flash Vision API adapter or cached OCR response mode as a 1-click fallback in `.env`.", style_table_cell)
        ],
        [
            Paragraph("<b>Venue Wi-Fi Drop / Instability</b>", style_table_cell_bold),
            Paragraph("<font color='#BE123C'><b>CRITICAL</b></font><br/>No internet", style_table_cell),
            Paragraph("Hackathon venue Wi-Fi becomes congested during final judging hours.", style_table_cell),
            Paragraph("<b>Fallback:</b> Entire app runs 100% locally on `localhost` with SQLite and local PaddleOCR/Tesseract. Zero cloud dependencies required for live demo.", style_table_cell)
        ],
        [
            Paragraph("<b>Curved / Shiny Package Glare</b>", style_table_cell_bold),
            Paragraph("<font color='#B45309'><b>MEDIUM</b></font><br/>Low OCR accuracy", style_table_cell),
            Paragraph("Judge provides a random crinkled chip packet or glossy bottle with heavy glare.", style_table_cell),
            Paragraph("<b>Fallback:</b> OpenCV CLAHE contrast filter automatically compensates for glare; UI includes an interactive manual bounding box verification drawer.", style_table_cell)
        ],
        [
            Paragraph("<b>Uncaught Frontend React Crash</b>", style_table_cell_bold),
            Paragraph("<font color='#BE123C'><b>HIGH</b></font><br/>White screen of death", style_table_cell),
            Paragraph("Malformed JSON response from backend causes unhandled state in React canvas.", style_table_cell),
            Paragraph("<b>Fallback:</b> React Error Boundary wraps ScanCanvas component, displaying a graceful retry button rather than crashing the page.", style_table_cell)
        ],
        [
            Paragraph("<b>Time Shortage on Secondary Features</b>", style_table_cell_bold),
            Paragraph("<font color='#B45309'><b>MEDIUM</b></font><br/>Incomplete scope", style_table_cell),
            Paragraph("Team gets stuck debugging non-essential features (e.g. user authentication).", style_table_cell),
            Paragraph("<b>Fallback:</b> Enforce strict P0 scope boundaries at Hour 14. Cut all P1/P2 features and polish the core hero loop exclusively.", style_table_cell)
        ],
        [
            Paragraph("<b>Live Demo Hardware Glitch</b>", style_table_cell_bold),
            Paragraph("<font color='#BE123C'><b>CRITICAL</b></font><br/>Presentation fails", style_table_cell),
            Paragraph("Laptop battery dies or display port adapter fails during judge evaluation.", style_table_cell),
            Paragraph("<b>Fallback:</b> Pre-record a 1080p 60fps narrated video walkthrough of the complete hero flow stored locally on two separate team laptops and phones.", style_table_cell)
        ]
    ]
    risk_table = Table(risk_data, colWidths=[110, 75, 125, 194])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(risk_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 15: JUDGE-FOCUSED DEMO STRATEGY & SCRIPT
    # ==========================================
    story.extend(make_section_header("15", "Judge-Focused Demo Strategy & Pitch Script"))
    story.append(Paragraph("Judges evaluate dozens of projects in minutes. You have exactly <b>3 to 5 minutes</b> to deliver an unforgettable, high-impact demonstration.", style_body))
    
    demo_script_data = [
        [Paragraph("<b>Time Elapsed</b>", style_table_header), Paragraph("<b>Presentation Phase</b>", style_table_header), Paragraph("<b>Exact Script &amp; What to Say / Show to Judges</b>", style_table_header), Paragraph("<b>Visual Screen Action</b>", style_table_header)],
        [
            Paragraph("<b>0:00 – 0:45<br/>(45 sec)</b>", style_table_cell_bold),
            Paragraph("<b>The Hook &amp; Problem</b>", style_table_cell),
            Paragraph("<i>'Respected judges, over 500 million packaged commodities are sold daily in India. Under Legal Metrology Rules 2011, every package must declare 7 mandatory fields. Yet today, enforcement officers inspect packages manually with magnifying glasses and paper checklists—taking 15 minutes per SKU. Introducing <b>SIH Origin</b>: the automated AI compliance screening engine.'</i>", style_table_cell),
            Paragraph("Show problem slide / landing dashboard with inspection metrics.", style_table_cell)
        ],
        [
            Paragraph("<b>0:45 – 2:00<br/>(75 sec)</b>", style_table_cell_bold),
            Paragraph("<b>The Hero Live Demo</b>", style_table_cell),
            Paragraph("<i>'Watch this live. I am uploading a real FMCG product package. In under 3 seconds, SIH Origin preprocesses the image, runs multilingual OCR, and evaluates all 7 statutory declarations. Look at the canvas: green bounding boxes show compliant declarations, while this red bounding box instantly highlights a missing Unit Sale Price (USP)—violating Rule 6(1)(e).'</i>", style_table_cell),
            Paragraph("Perform live drag-and-drop upload; watch instant bounding box rendering.", style_table_cell)
        ],
        [
            Paragraph("<b>2:00 – 2:45<br/>(45 sec)</b>", style_table_cell_bold),
            Paragraph("<b>Explainability &amp; Report</b>", style_table_cell),
            Paragraph("<i>'Unlike black-box AI tools, SIH Origin provides 100% legal explainability. With one click, we generate an official, court-admissible Legal Metrology Inspection Certificate containing cryptographic SHA-256 digital verification hashes and statutory violation citations ready to issue.'</i>", style_table_cell),
            Paragraph("Click 'Download PDF Audit Certificate' and display generated PDF.", style_table_cell)
        ],
        [
            Paragraph("<b>2:45 – 3:30<br/>(45 sec)</b>", style_table_cell_bold),
            Paragraph("<b>Architecture &amp; Scale</b>", style_table_cell),
            Paragraph("<i>'Our stack uses FastAPI and Next.js, with modular OpenCV and multilingual PaddleOCR pipelines. It scales from handheld mobile inspector devices to automated high-throughput e-commerce catalog screening APIs processing 100,000 SKUs an hour.'</i>", style_table_cell),
            Paragraph("Show Architecture Diagram &amp; Batch Inspection Dashboard.", style_table_cell)
        ],
        [
            Paragraph("<b>3:30 – 5:00<br/>(90 sec)</b>", style_table_cell_bold),
            Paragraph("<b>Q&amp;A Defense</b>", style_table_cell),
            Paragraph("Address judge questions calmly with pre-rehearsed technical depth on OCR confidence thresholds, font size calculation, and gazette rule versioning.", style_table_cell),
            Paragraph("Keep live app and architecture slide open for reference.", style_table_cell)
        ]
    ]
    demo_script_table = Table(demo_script_data, colWidths=[70, 100, 214, 120])
    demo_script_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(demo_script_table)
    story.append(Spacer(1, 8))

    story.append(make_card([
        Paragraph("<b>TOP 3 JUDGE QUESTIONS &amp; BULLETPROOF ANSWERS:</b>", style_callout_bold),
        Spacer(1, 2),
        Paragraph("<b>Q1: 'What if the package is curved or the label is torn?'</b><br/><b>Answer:</b> <i>'Our OpenCV pipeline applies cylindrical unwarping and CLAHE contrast enhancement. Furthermore, our confidence scoring engine flags low-confidence tokens (&lt;70%) and triggers an instant retake prompt before false violations are logged.'</i>", style_bullet),
        Paragraph("<b>Q2: 'How do you handle regional Indian languages on local packages?'</b><br/><b>Answer:</b> <i>'We utilize PaddleOCR's multilingual models supporting Devanagari, Tamil, and Telugu scripts alongside English, ensuring compliance screening works across all Indian states.'</i>", style_bullet),
        Paragraph("<b>Q3: 'How is this different from standard OCR like Google Lens?'</b><br/><b>Answer:</b> <i>'Google Lens extracts raw text. SIH Origin is a specialized statutory compliance engine that understands Legal Metrology Law, calculates Unit Sale Prices, maps legal clauses, overlays evidence bounding boxes, and generates court-admissible audit reports.'</i>", style_bullet)
    ], bg_color=COLOR_ACCENT_LIGHT, border_color=COLOR_ACCENT))

    story.append(PageBreak())

    # ==========================================
    # PAGE 16: FINAL SUBMISSION CHECKLIST
    # ==========================================
    story.extend(make_section_header("16", "Final Submission & Hackathon Ready Checklist"))
    story.append(Paragraph("Before calling code freeze and submitting on the Smart India Hackathon portal, every item below must be verified and checked off by Team Lead and Members.", style_body))
    
    check_data = [
        [Paragraph("<b>Status</b>", style_table_header), Paragraph("<b>Verification Item &amp; Subsystem</b>", style_table_header), Paragraph("<b>Responsible Team Member</b>", style_table_header), Paragraph("<b>Verification Sign-off Criteria</b>", style_table_header)],
        [
            Paragraph("<b>[  ] READY</b>", style_table_cell_bold),
            Paragraph("<b>End-to-End Hero Flow Functional</b>", style_table_cell),
            Paragraph("Karthik V (Team Lead)", style_table_cell),
            Paragraph("Image upload &rarr; OCR &rarr; Rule check &rarr; Canvas overlay &rarr; PDF export works without a single error.", style_table_cell)
        ],
        [
            Paragraph("<b>[  ] READY</b>", style_table_cell_bold),
            Paragraph("<b>Curated Demo Test Data Loaded</b>", style_table_cell),
            Paragraph("Shrihan P &amp; Akshith Varma A", style_table_cell),
            Paragraph("6 test product images (3 compliant, 3 with distinct violations) prepared in desktop `/demo_assets/` folder.", style_table_cell)
        ],
        [
            Paragraph("<b>[  ] READY</b>", style_table_cell_bold),
            Paragraph("<b>PDF Audit Certificate Generation</b>", style_table_cell),
            Paragraph("Dhanush Reddy C", style_table_cell),
            Paragraph("PDF report downloads with clear violation details, SHA-256 digital hash, and evidence image snapshot.", style_table_cell)
        ],
        [
            Paragraph("<b>[  ] READY</b>", style_table_cell_bold),
            Paragraph("<b>Frontend UI Polish &amp; Error Boundaries</b>", style_table_cell),
            Paragraph("Dharshini K", style_table_cell),
            Paragraph("Clean dark/light theme, high contrast badges, responsive layout, zero console warnings.", style_table_cell)
        ],
        [
            Paragraph("<b>[  ] READY</b>", style_table_cell_bold),
            Paragraph("<b>GitHub Repository Clean &amp; Documented</b>", style_table_cell),
            Paragraph("Yashwanth Raju", style_table_cell),
            Paragraph("README includes project title, problem ID 26034, architecture diagram, setup instructions, and license.", style_table_cell)
        ],
        [
            Paragraph("<b>[  ] READY</b>", style_table_cell_bold),
            Paragraph("<b>Offline Demo Video Recorded</b>", style_table_cell),
            Paragraph("Shrihan P", style_table_cell),
            Paragraph("1080p screen recording of complete demo walkthrough saved locally on two laptops as a backup.", style_table_cell)
        ],
        [
            Paragraph("<b>[  ] READY</b>", style_table_cell_bold),
            Paragraph("<b>Presentation Deck Finalized</b>", style_table_cell),
            Paragraph("Team IRIS (All Members)", style_table_cell),
            Paragraph("Slide deck adheres to SIH format: Problem &rarr; Solution &rarr; Demo &rarr; Tech Stack &rarr; Scale &rarr; Impact.", style_table_cell)
        ],
        [
            Paragraph("<b>[  ] READY</b>", style_table_cell_bold),
            Paragraph("<b>Pitch Rehearsed (Timed under 3 min)</b>", style_table_cell),
            Paragraph("Karthik V &amp; Team", style_table_cell),
            Paragraph("4 mock rehearsals completed. Pitch delivered smoothly in 2 mins 45 seconds with 2 mins left for Q&amp;A.", style_table_cell)
        ]
    ]
    check_table = Table(check_data, colWidths=[70, 160, 114, 160])
    check_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(check_table)
    story.append(Spacer(1, 15))

    # Final Closing Engineering Sign-off Box
    closing_box = make_card([
        Paragraph("<b>ENGINEERING SPRINT COMMITMENT &amp; SIGN-OFF</b>", style_callout_bold),
        Spacer(1, 2),
        Paragraph("<i>'We, the engineering team of <b>SIH Origin (Team IRIS)</b>, commit to executing this Engineering OS blueprint with discipline, precision, and relentless focus during the Smart India Hackathon. We will adhere to our scope boundaries, build our signature hero loop first with Antigravity, and deliver a competition-winning regulatory compliance system.'</i>", style_callout_text),
        Spacer(1, 5),
        Paragraph("<b>Team Leader:</b> Karthik V &nbsp;&nbsp;|&nbsp;&nbsp; <b>Engineering Lead:</b> Akshith Varma A &nbsp;&nbsp;|&nbsp;&nbsp; <b>Date:</b> March 2026", ParagraphStyle('SignOff', parent=style_body, fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_PRIMARY))
    ], bg_color=COLOR_ACCENT_LIGHT, border_color=COLOR_ACCENT)
    story.append(closing_box)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == '__main__':
    output_pdf = os.path.join(os.getcwd(), "SIH_Origin_Engineering_Execution_OS.pdf")
    build_pdf(output_pdf)
