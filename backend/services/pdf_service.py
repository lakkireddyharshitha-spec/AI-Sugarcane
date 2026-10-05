import os
import datetime
from io import BytesIO
from typing import Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from sqlalchemy.orm import Session
from models.user import User
from models.farm import Farm
from models.environmental import EnvironmentalReading
from models.crop_observation import CropObservation
from models.disease_detection import DiseaseDetection
from models.risk_prediction import RiskPrediction
from services.recommendation_service import generate_live_recommendations

def generate_farm_report_pdf(db: Session, user: User, farm_id: int) -> BytesIO:
    """Generate a comprehensive agricultural health and risk audit report in PDF format."""
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise ValueError("Farm not found or does not belong to user")

    # Fetch recent records
    env_readings = db.query(EnvironmentalReading).filter(
        EnvironmentalReading.farm_id == farm.id
    ).order_by(EnvironmentalReading.reading_date.desc()).limit(7).all()

    observations = db.query(CropObservation).filter(
        CropObservation.farm_id == farm.id
    ).order_by(CropObservation.observation_date.desc()).limit(7).all()

    detections = db.query(DiseaseDetection).filter(
        DiseaseDetection.farm_id == farm.id
    ).order_by(DiseaseDetection.created_at.desc()).limit(5).all()

    risks = db.query(RiskPrediction).filter(
        RiskPrediction.farm_id == farm.id
    ).order_by(RiskPrediction.created_at.desc()).limit(5).all()

    recommendations = generate_live_recommendations(db, user.id, farm.id)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom palette
    PRIMARY_COLOR = colors.HexColor("#064e3b")    # Forest dark green
    SECONDARY_COLOR = colors.HexColor("#10b981")  # Fresh emerald
    ACCENT_BG = colors.HexColor("#f0fdf4")        # Mint tint
    TEXT_DARK = colors.HexColor("#1e293b")
    BORDER_COLOR = colors.HexColor("#cbd5e1")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY_COLOR,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )

    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=PRIMARY_COLOR,
        spaceBefore=10,
        spaceAfter=6
    )

    normal_style = ParagraphStyle(
        'NormalText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=TEXT_DARK
    )

    bold_style = ParagraphStyle(
        'BoldText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=TEXT_DARK
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>CaneGuard AI</b><br/><font size=8 color='#10b981'>Sugarcane Crop Monitoring & Early Disease Prediction</font>", title_style),
            Paragraph(f"<b>REPORT DATE:</b> {datetime.date.today().strftime('%B %d, %Y')}<br/><b>REPORT ID:</b> CG-{farm.id:04d}-{datetime.date.today().strftime('%Y%m%d')}", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[340, 200])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY_COLOR, spaceBefore=4, spaceAfter=12))

    # 2. Farmer & Farm Information Tables (Two column layout)
    farmer_farm_data = [
        [
            Paragraph("<b>FARMER INFORMATION</b>", section_header_style),
            Paragraph("<b>FARM SPECIFICATIONS</b>", section_header_style)
        ],
        [
            Paragraph(
                f"<b>Name:</b> {user.full_name}<br/>"
                f"<b>Email:</b> {user.email}<br/>"
                f"<b>Phone:</b> {user.phone_number or 'Not Specified'}<br/>"
                f"<b>Registered Since:</b> {user.created_at.strftime('%Y-%m-%d')}",
                normal_style
            ),
            Paragraph(
                f"<b>Farm Name:</b> {farm.farm_name}<br/>"
                f"<b>Location:</b> {farm.village}, {farm.district}<br/>"
                f"<b>Area:</b> {farm.farm_area} Acres | <b>Soil:</b> {farm.soil_type}<br/>"
                f"<b>Variety:</b> {farm.sugarcane_variety} | <b>Irrigation:</b> {farm.irrigation_type}<br/>"
                f"<b>Planting Date:</b> {farm.planting_date.strftime('%Y-%m-%d')}",
                normal_style
            )
        ]
    ]
    info_table = Table(farmer_farm_data, colWidths=[270, 270])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,1), (0,1), colors.HexColor("#f8fafc")),
        ('BACKGROUND', (1,1), (1,1), colors.HexColor("#f8fafc")),
        ('BOX', (0,1), (0,1), 0.5, BORDER_COLOR),
        ('BOX', (1,1), (1,1), 0.5, BORDER_COLOR),
        ('PADDING', (0,1), (-1,-1), 8),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 14))

    # 3. Environmental Readings
    story.append(Paragraph("<b>Recent Environmental & Weather Observations</b>", section_header_style))
    if env_readings:
        env_headers = ["Date", "Temp (°C)", "Humidity (%)", "Rain (mm)", "Soil Moisture", "Soil pH", "Irrigation"]
        env_rows = [[Paragraph(f"<b>{h}</b>", bold_style) for h in env_headers]]
        for r in env_readings:
            env_rows.append([
                Paragraph(str(r.reading_date), normal_style),
                Paragraph(f"{r.temperature}°C", normal_style),
                Paragraph(f"{r.humidity}%", normal_style),
                Paragraph(f"{r.rainfall} mm", normal_style),
                Paragraph(f"{r.soil_moisture}%", normal_style),
                Paragraph(str(r.soil_ph), normal_style),
                Paragraph(r.irrigation_status, normal_style),
            ])
        env_table = Table(env_rows, colWidths=[70, 75, 80, 75, 80, 60, 100])
        env_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), ACCENT_BG),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(env_table)
    else:
        story.append(Paragraph("<i>No environmental readings recorded yet for this farm.</i>", normal_style))
    story.append(Spacer(1, 12))

    # 4. Disease Detection History
    story.append(Paragraph("<b>Sugarcane Leaf Disease Detection History (CNN)</b>", section_header_style))
    if detections:
        det_headers = ["Scan Date", "Diagnosis / Disease", "Severity", "Confidence", "Mode", "Action Summary"]
        det_rows = [[Paragraph(f"<b>{h}</b>", bold_style) for h in det_headers]]
        for d in detections:
            badge = "DEMO" if d.is_demo else "CNN Live"
            det_rows.append([
                Paragraph(d.created_at.strftime('%Y-%m-%d'), normal_style),
                Paragraph(f"<b>{d.disease_name}</b>", normal_style),
                Paragraph(d.severity, normal_style),
                Paragraph(f"{d.confidence_score}%", normal_style),
                Paragraph(badge, normal_style),
                Paragraph(d.recommendations[:75] + "..." if d.recommendations and len(d.recommendations) > 75 else (d.recommendations or "None"), normal_style),
            ])
        det_table = Table(det_rows, colWidths=[65, 110, 60, 65, 60, 180])
        det_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), ACCENT_BG),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
            ('ALIGN', (2,0), (4,-1), 'CENTER'),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(det_table)
    else:
        story.append(Paragraph("<i>No leaf disease scans performed for this farm yet.</i>", normal_style))
    story.append(Spacer(1, 12))

    # 5. Crop Growth & Height Observations
    story.append(Paragraph("<b>Crop Growth & Vegetative Observations</b>", section_header_style))
    if observations:
        obs_headers = ["Obs Date", "Crop Age", "Height (cm)", "Growth Stage", "Leaf Condition", "Notes"]
        obs_rows = [[Paragraph(f"<b>{h}</b>", bold_style) for h in obs_headers]]
        for o in observations:
            obs_rows.append([
                Paragraph(str(o.observation_date), normal_style),
                Paragraph(f"{o.crop_age} Days", normal_style),
                Paragraph(f"{o.plant_height} cm", normal_style),
                Paragraph(o.growth_stage, normal_style),
                Paragraph(o.leaf_condition, normal_style),
                Paragraph(o.notes or "-", normal_style),
            ])
        obs_table = Table(obs_rows, colWidths=[70, 70, 75, 105, 100, 120])
        obs_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), ACCENT_BG),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
            ('ALIGN', (1,0), (2,-1), 'CENTER'),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(obs_table)
    else:
        story.append(Paragraph("<i>No growth observations logged yet.</i>", normal_style))
    story.append(Spacer(1, 12))

    # 6. AI Agronomic Recommendations
    story.append(Paragraph("<b>Actionable Agronomic & Irrigation Recommendations</b>", section_header_style))
    if recommendations:
        for r in recommendations:
            rec_box = [
                [
                    Paragraph(f"<b>[{r['category'].upper()}] {r['title']}</b> (Priority: {r['priority']})", bold_style)
                ],
                [
                    Paragraph(f"{r['details']}<br/><font color='#64748b' size=8>Trigger Context: {r.get('source_context', 'General')}</font>", normal_style)
                ]
            ]
            t = Table(rec_box, colWidths=[540])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#fafafa")),
                ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
                ('PADDING', (0,0), (-1,-1), 5),
            ]))
            story.append(t)
            story.append(Spacer(1, 4))
    else:
        story.append(Paragraph("<i>All parameters within baseline limits. Continue regular field inspection.</i>", normal_style))

    # Footer note
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceBefore=4, spaceAfter=8))
    footer_text = (
        "<b>Notice:</b> CaneGuard AI recommendations are synthesized from mathematical agronomic models, "
        "trained Random Forest disease-risk classifiers, and image inspection heuristics. "
        "Always cross-examine severe pathogen alerts with localized agricultural university extensions."
    )
    story.append(Paragraph(footer_text, ParagraphStyle('Foot', parent=styles['Normal'], fontSize=8, leading=10, textColor=colors.HexColor("#64748b"))))

    doc.build(story)
    buffer.seek(0)
    return buffer
