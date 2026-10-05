from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.user import User
from models.farm import Farm
from models.disease_detection import DiseaseDetection
from models.environmental import EnvironmentalReading
from models.crop_observation import CropObservation
from models.risk_prediction import RiskPrediction
from models.alert import Alert
from services.auth_service import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboard Aggregates"])

@router.get("/summary")
def get_dashboard_summary(
    farm_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Base queries filtered by user
    farm_query = db.query(Farm).filter(Farm.user_id == current_user.id)
    det_query = db.query(DiseaseDetection).filter(DiseaseDetection.user_id == current_user.id)
    obs_query = db.query(CropObservation).filter(CropObservation.user_id == current_user.id)
    risk_query = db.query(RiskPrediction).filter(RiskPrediction.user_id == current_user.id)
    env_query = db.query(EnvironmentalReading).filter(EnvironmentalReading.user_id == current_user.id)

    total_farms = farm_query.count()

    if farm_id:
        det_query = det_query.filter(DiseaseDetection.farm_id == farm_id)
        obs_query = obs_query.filter(CropObservation.farm_id == farm_id)
        risk_query = risk_query.filter(RiskPrediction.farm_id == farm_id)
        env_query = env_query.filter(EnvironmentalReading.farm_id == farm_id)

    total_analyses = det_query.count()
    total_observations = obs_query.count()

    # Calculate Healthy Crop Status (%)
    if total_analyses > 0:
        healthy_count = det_query.filter(DiseaseDetection.disease_class == 0).count()
        healthy_pct = round((healthy_count / total_analyses) * 100.0, 1)
    else:
        healthy_pct = 100.0

    # Current Disease Risk level from latest risk prediction or heuristic
    latest_risk = risk_query.order_by(RiskPrediction.created_at.desc()).first()
    current_risk_level = latest_risk.risk_level if latest_risk else "Low Risk"
    current_risk_score = latest_risk.risk_score if latest_risk else 15.0

    # Risk Distribution for Pie Chart
    high_risks = risk_query.filter(RiskPrediction.risk_level == "High Risk").count()
    med_risks = risk_query.filter(RiskPrediction.risk_level == "Medium Risk").count()
    low_risks = risk_query.filter(RiskPrediction.risk_level == "Low Risk").count()

    risk_distribution = [
        {"name": "Low Risk", "value": low_risks, "color": "#10b981"},
        {"name": "Medium Risk", "value": med_risks, "color": "#f59e0b"},
        {"name": "High Risk", "value": high_risks, "color": "#ef4444"}
    ]

    # Disease Classification Breakdown
    detections_by_class = (
        db.query(DiseaseDetection.disease_name, func.count(DiseaseDetection.id))
        .filter(DiseaseDetection.user_id == current_user.id)
        .group_by(DiseaseDetection.disease_name)
        .all()
    )
    disease_distribution = [
        {"disease": name, "count": count}
        for name, count in detections_by_class
    ]

    # Recent activities (combine latest detections, readings, observations)
    activities = []
    for d in det_query.order_by(DiseaseDetection.created_at.desc()).limit(3).all():
        activities.append({
            "type": "scan",
            "title": f"Leaf Scan: {d.disease_name}",
            "description": f"Confidence: {d.confidence_score}% ({'DEMO' if d.is_demo else 'CNN Live'})",
            "timestamp": d.created_at.strftime("%Y-%m-%d %H:%M"),
            "badge": "Scan"
        })
    for e in env_query.order_by(EnvironmentalReading.created_at.desc()).limit(3).all():
        activities.append({
            "type": "environmental",
            "title": f"Sensor Log: {e.temperature}°C, {e.humidity}% RH",
            "description": f"Moisture: {e.soil_moisture}%, Rain: {e.rainfall}mm",
            "timestamp": e.created_at.strftime("%Y-%m-%d %H:%M"),
            "badge": "Sensor"
        })
    for o in obs_query.order_by(CropObservation.created_at.desc()).limit(3).all():
        activities.append({
            "type": "growth",
            "title": f"Growth Obs: {o.plant_height} cm",
            "description": f"Stage: {o.growth_stage}, Age: {o.crop_age}d",
            "timestamp": o.created_at.strftime("%Y-%m-%d %H:%M"),
            "badge": "Growth"
        })

    activities.sort(key=lambda x: x["timestamp"], reverse=True)

    # Farm-wise stats for analytics table
    farms = farm_query.all()
    farm_wise_stats = []
    for f in farms:
        f_scans = db.query(DiseaseDetection).filter(DiseaseDetection.farm_id == f.id).count()
        f_obs = db.query(CropObservation).filter(CropObservation.farm_id == f.id).count()
        f_env = db.query(EnvironmentalReading).filter(EnvironmentalReading.farm_id == f.id).order_by(EnvironmentalReading.created_at.desc()).first()
        f_risk = db.query(RiskPrediction).filter(RiskPrediction.farm_id == f.id).order_by(RiskPrediction.created_at.desc()).first()

        farm_wise_stats.append({
            "farm_id": f.id,
            "farm_name": f.farm_name,
            "village": f.village,
            "variety": f.sugarcane_variety,
            "area": f.farm_area,
            "scans_count": f_scans,
            "observations_count": f_obs,
            "latest_moisture": f"{f_env.soil_moisture}%" if f_env else "N/A",
            "current_risk": f_risk.risk_level if f_risk else "Low Risk"
        })

    return {
        "total_farms": total_farms,
        "total_disease_analyses": total_analyses,
        "healthy_crop_percentage": healthy_pct,
        "current_disease_risk": current_risk_level,
        "current_risk_score": current_risk_score,
        "total_observations": total_observations,
        "risk_distribution": risk_distribution,
        "disease_distribution": disease_distribution,
        "recent_activities": activities[:6],
        "farm_wise_stats": farm_wise_stats
    }
