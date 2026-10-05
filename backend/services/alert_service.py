import datetime
from sqlalchemy.orm import Session
from models.alert import Alert

def check_and_create_environmental_alerts(db: Session, user_id: int, farm_id: int, reading) -> None:
    """Check environmental reading parameters against critical thresholds and log alerts."""
    # Soil Moisture Low
    if reading.soil_moisture < 25.0:
        _create_alert_if_not_duplicate(
            db, user_id, farm_id,
            title="Severe Soil Moisture Deficit",
            category="Environmental Warning",
            severity="Critical",
            reason=f"Soil moisture dropped to {reading.soil_moisture}%, below critical wilting point.",
            recommended_action="Initiate irrigation immediately (drip or furrow) to prevent leaf rolling and internode shrinking."
        )
    # Soil Moisture High & High Humidity -> Fungal alert
    elif reading.soil_moisture > 80.0 and reading.humidity > 80.0:
        _create_alert_if_not_duplicate(
            db, user_id, farm_id,
            title="Fungal Spore Proliferation Danger",
            category="Environmental Warning",
            severity="High",
            reason=f"High soil moisture ({reading.soil_moisture}%) combined with high relative humidity ({reading.humidity}%).",
            recommended_action="Ensure drainage canals are unclogged and inspect crop canopies for early signs of red rot or smut."
        )

    # Extreme Temperature
    if reading.temperature > 40.0:
        _create_alert_if_not_duplicate(
            db, user_id, farm_id,
            title="Severe Heat Wave Stress",
            category="Environmental Warning",
            severity="High",
            reason=f"Ambient temperature reached {reading.temperature}°C, accelerating evapotranspiration.",
            recommended_action="Increase irrigation frequency and consider trash mulching between rows to conserve soil moisture."
        )

    # Soil pH imbalance
    if reading.soil_ph < 5.5:
        _create_alert_if_not_duplicate(
            db, user_id, farm_id,
            title="Acidic Soil Alert",
            category="Environmental Warning",
            severity="Medium",
            reason=f"Soil pH recorded at {reading.soil_ph}, impairing nitrogen and phosphorus availability.",
            recommended_action="Incorporate agricultural lime or wood ash as per soil analysis report before upcoming top dressing."
        )
    elif reading.soil_ph > 8.5:
        _create_alert_if_not_duplicate(
            db, user_id, farm_id,
            title="Alkaline / Saline Soil Stress",
            category="Environmental Warning",
            severity="Medium",
            reason=f"Soil pH recorded at {reading.soil_ph}, which may induce iron chlorosis in young leaves.",
            recommended_action="Apply gypsum and enrich with organic compost or green manure (dhaincha)."
        )

def check_and_create_disease_alert(db: Session, user_id: int, farm_id: int, detection) -> None:
    """Create alert when a contagious disease is identified."""
    if detection.disease_class > 0:
        severity_map = {
            "Severe": "Critical",
            "High": "High",
            "Moderate": "Medium",
            "Low": "Low"
        }
        _create_alert_if_not_duplicate(
            db, user_id, farm_id,
            title=f"Pathogen Detected: {detection.disease_name}",
            category="Disease Risk",
            severity=severity_map.get(detection.severity, "Medium"),
            reason=f"AI scan identified {detection.disease_name} with {detection.confidence_score}% confidence.",
            recommended_action=detection.recommendations or "Isolate infected plants and consult agricultural officer."
        )

def _create_alert_if_not_duplicate(db: Session, user_id: int, farm_id: int, title: str, category: str, severity: str, reason: str, recommended_action: str):
    # Avoid duplicating the same active unread alert within the last 24 hours
    since = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    existing = db.query(Alert).filter(
        Alert.user_id == user_id,
        Alert.farm_id == farm_id,
        Alert.title == title,
        Alert.created_at >= since,
        Alert.is_read == False
    ).first()

    if not existing:
        alert = Alert(
            user_id=user_id,
            farm_id=farm_id,
            title=title,
            category=category,
            severity=severity,
            reason=reason,
            recommended_action=recommended_action,
            is_read=False
        )
        db.add(alert)
        db.commit()
