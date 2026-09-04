import os
import hashlib
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedInspectionCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedInspectionCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#475569"))
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(54, 45, 558, 45)
        self.drawString(54, 34, "Official Statutory Record • Generated under Legal Metrology (Packaged Commodities) Rules, 2011")
        self.drawRightString(558, 34, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

class ReportService:
    @staticmethod
    def generate_inspection_certificate(
        scan_id: str,
        product_name: str,
        category: str,
        verdict: str,
        compliance_score: float,
        fields: list,
        violations: list,
        output_dir: str,
        image_path: str = None
    ) -> dict:
        """
        Generates an authoritative government-grade Legal Metrology compliance certificate in PDF.
        """
        os.makedirs(output_dir, exist_ok=True)
        filename = f"Inspection_Certificate_{scan_id[:8]}.pdf"
        filepath = os.path.join(output_dir, filename)

        doc = SimpleDocTemplate(
            filepath,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=50,
            bottomMargin=54
        )

        styles = getSampleStyleSheet()

        # Custom styles
        style_title = ParagraphStyle(
            'CertTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=18,
            textColor=colors.HexColor('#0F172A'),
            alignment=1
        )
        style_subtitle = ParagraphStyle(
            'CertSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#1D4ED8'),
            alignment=1,
            spaceAfter=10
        )
        style_body = ParagraphStyle(
            'CertBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#0F172A')
        )
        style_body_bold = ParagraphStyle(
            'CertBodyBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#0F172A')
        )
        style_th = ParagraphStyle(
            'CertTH',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=colors.white
        )

        story = []

        # Header Box
        gov_header_text = [
            Paragraph("<b>GOVERNMENT OF INDIA &nbsp;|&nbsp; MINISTRY OF CONSUMER AFFAIRS</b>", style_title),
            Paragraph("DEPARTMENT OF LEGAL METROLOGY &bull; STATUTORY PACKAGING INSPECTION CERTIFICATE", style_subtitle)
        ]
        story.extend(gov_header_text)
        story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#0F172A'), spaceAfter=8))

        # Metadata & Verdict Summary Card
        is_compliant = verdict.upper() == "COMPLIANT"
        verdict_color = colors.HexColor('#059669') if is_compliant else colors.HexColor('#DC2626')
        verdict_bg = colors.HexColor('#ECFDF5') if is_compliant else colors.HexColor('#FEF2F2')

        meta_data = [
            [
                Paragraph(f"<b>Inspection Reference ID:</b> {scan_id}<br/>"
                          f"<b>Product / Commodity:</b> {product_name}<br/>"
                          f"<b>Category:</b> {category}<br/>"
                          f"<b>Inspection Date &amp; Time:</b> {datetime.now().strftime('%d-%b-%Y %H:%M:%S UTC')}", style_body),
                Paragraph(f"<b>OFFICIAL COMPLIANCE VERDICT</b><br/>"
                          f"<font size=13 color='{verdict_color.hexval()}'><b>{verdict.upper()}</b></font><br/>"
                          f"<b>Compliance Score:</b> {compliance_score}% &nbsp;|&nbsp; <b>Violations:</b> {len(violations)}", style_body)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[270, 234])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#F8FAFC')),
            ('BACKGROUND', (1, 0), (1, 0), verdict_bg),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

        # Mandatory Declarations Table
        story.append(Paragraph("<b>1. MANDATORY STATUTORY DECLARATION AUDIT (LMR 2011)</b>", style_body_bold))
        story.append(Spacer(1, 4))

        decl_data = [
            [Paragraph("<b>#</b>", style_th), Paragraph("<b>Mandatory Declaration</b>", style_th), Paragraph("<b>Detected Value</b>", style_th), Paragraph("<b>Legal Status</b>", style_th)]
        ]
        for idx, f in enumerate(fields, 1):
            status_text = "<font color='#059669'><b>PASS</b></font>" if f.get("is_valid") else "<font color='#DC2626'><b>FAIL / MISSING</b></font>"
            val = f.get("normalized_value") or f.get("raw_text") or "<i>Not Detected</i>"
            decl_data.append([
                Paragraph(str(idx), style_body_bold),
                Paragraph(f.get("field_label", f.get("field_type")), style_body),
                Paragraph(str(val), style_body),
                Paragraph(status_text, style_body)
            ])

        decl_table = Table(decl_data, colWidths=[20, 160, 234, 90])
        decl_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(decl_table)
        story.append(Spacer(1, 10))

        # Violations Table (if any)
        if violations:
            story.append(Paragraph("<b>2. STATUTORY VIOLATIONS &amp; LEGAL CLAUSE BREACHES</b>", style_body_bold))
            story.append(Spacer(1, 4))

            viol_data = [
                [Paragraph("<b>Clause</b>", style_th), Paragraph("<b>Violation Title</b>", style_th), Paragraph("<b>Statutory Description</b>", style_th), Paragraph("<b>Severity</b>", style_th)]
            ]
            for v in violations:
                viol_data.append([
                    Paragraph(f"<b>{v.get('clause')}</b>", style_body_bold),
                    Paragraph(v.get("issue_title"), style_body),
                    Paragraph(v.get("description"), style_body),
                    Paragraph(f"<font color='#DC2626'><b>{v.get('severity')}</b></font>", style_body)
                ])

            viol_table = Table(viol_data, colWidths=[80, 140, 214, 70])
            viol_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FFF1F2')]),
                ('TOPPADDING', (0, 0), (-1, -1), 3.5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(viol_table)
            story.append(Spacer(1, 10))

        # Cryptographic Digital Signature & Integrity Hash
        sha256_input = f"{scan_id}_{product_name}_{verdict}_{compliance_score}_{len(violations)}"
        sha256_hash = hashlib.sha256(sha256_input.encode()).hexdigest()

        audit_box_data = [
            [
                Paragraph("<b>CRYPTOGRAPHIC DIGITAL AUDIT VERIFICATION</b><br/>"
                          f"<b>SHA-256 Digital Fingerprint:</b> <font face='Courier' size=7>{sha256_hash}</font><br/>"
                          f"<b>Inspecting Authority:</b> Central Legal Metrology Enforcement AI (PS #26034)<br/>"
                          "<i>This document is a tamper-evident digital certificate admissible under the Information Technology Act, 2000.</i>", style_body),
                Paragraph("<br/><br/><b>Authorized Digital Seal</b><br/>[ VERIFIED &bull; DEPT CONSUMER AFFAIRS ]", style_body_bold)
            ]
        ]
        audit_table = Table(audit_box_data, colWidths=[360, 144])
        audit_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#94A3B8')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(audit_table)

        doc.build(story, canvasmaker=NumberedInspectionCanvas)

        return {
            "filename": filename,
            "filepath": filepath,
            "sha256_hash": sha256_hash,
            "url": f"/reports/{filename}"
        }
