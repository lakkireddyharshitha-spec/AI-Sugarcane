from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models.farm import Farm
from models.environmental import EnvironmentalReading
from models.crop_observation import CropObservation
from models.disease_detection import DiseaseDetection
from models.recommendation import Recommendation

def generate_live_recommendations(db: Session, user_id: int, farm_id: int) -> List[Dict[str, Any]]:
    """
    Synthesize agronomic recommendations strictly rooted in the farm's recorded sensor,
    growth, and scan data.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user_id).first()
    if not farm:
        return []

    # Get latest environmental reading
    latest_env = db.query(EnvironmentalReading).filter(
        EnvironmentalReading.farm_id == farm_id,
        EnvironmentalReading.user_id == user_id
    ).order_by(EnvironmentalReading.created_at.desc()).first()

    # Get latest crop observation
    latest_obs = db.query(CropObservation).filter(
        CropObservation.farm_id == farm_id,
        CropObservation.user_id == user_id
    ).order_by(CropObservation.created_at.desc()).first()

    # Get latest disease detection
    latest_dis = db.query(DiseaseDetection).filter(
        DiseaseDetection.farm_id == farm_id,
        DiseaseDetection.user_id == user_id
    ).order_by(DiseaseDetection.created_at.desc()).first()

    recommendations = []

    # 1. Irrigation Guidance
    if latest_env:
        moisture = latest_env.soil_moisture
        rain = latest_env.rainfall
        irr_status = latest_env.irrigation_status

        if moisture < 35.0:
            if rain < 5.0:
                recommendations.append({
                    "category": "Irrigation Guidance",
                    "title": "Immediate Irrigation Required",
                    "details": f"Soil moisture is critically low at {moisture}% with minimal rainfall ({rain} mm). Operate {farm.irrigation_type.lower()} irrigation for 4-5 hours to restore root-zone field capacity.",
                    "priority": "High",
                    "source_context": f"Soil Moisture: {moisture}%, Rain: {rain}mm"
                })
            else:
                recommendations.append({
                    "category": "Irrigation Guidance",
                    "title": "Monitor Moisture After Rainfall",
                    "details": f"Recent rainfall of {rain} mm received. Delay scheduled irrigation by 24-48 hours and re-check soil moisture before turning pumps on.",
                    "priority": "Medium",
                    "source_context": f"Rainfall: {rain}mm recorded"
                })
        elif moisture > 75.0:
            recommendations.append({
                "category": "Irrigation Guidance",
                "title": "Halt Irrigation - Avoid Stagnation",
                "details": f"Soil moisture is elevated at {moisture}%. Suspend all irrigation cycles. Ensure inter-plot ditches are open to prevent anaerobic root zone conditions.",
                "priority": "High",
                "source_context": f"Soil Moisture: {moisture}%"
            })
        else:
            recommendations.append({
                "category": "Irrigation Guidance",
                "title": "Optimal Soil Hydration Maintained",
                "details": f"Soil moisture is stable at {moisture}% within the recommended 45-65% zone for sugarcane cultivar {farm.sugarcane_variety}. Maintain current irrigation cadence.",
                "priority": "Low",
                "source_context": f"Soil Moisture: {moisture}%"
            })
    else:
        recommendations.append({
            "category": "Irrigation Guidance",
            "title": "Log Environmental Reading for Irrigation Scheduling",
            "details": f"No recent soil moisture logs recorded for '{farm.farm_name}'. Enter current soil moisture and temperature to unlock precision water scheduling.",
            "priority": "Medium",
            "source_context": "Baseline pending"
        })

    # 2. Crop Monitoring Reminders
    if latest_obs:
        stage = latest_obs.growth_stage
        age = latest_obs.crop_age

        if "Tillering" in stage or age <= 120:
            recommendations.append({
                "category": "Crop Monitoring",
                "title": "Early Earthing-up and Tiller Consolidation",
                "details": f"Crop age {age} days is in the Tillering phase. Perform partial earthing-up to anchor primary tillers and apply recommended balanced nitrogen top-dressing.",
                "priority": "Medium",
                "source_context": f"Stage: {stage} ({age} days)"
            })
        elif "Grand Growth" in stage or (120 < age <= 270):
            recommendations.append({
                "category": "Crop Monitoring",
                "title": "Full Earthing-up & Propping Against Lodging",
                "details": f"At {latest_obs.plant_height} cm height in Grand Growth phase, cane stalks become susceptible to wind lodging. Complete final earthing-up and tie adjacent clumps together (trash wrap/propping).",
                "priority": "High",
                "source_context": f"Height: {latest_obs.plant_height}cm, Stage: {stage}"
            })
        elif "Ripening" in stage or age > 270:
            recommendations.append({
                "category": "Crop Monitoring",
                "title": "Maturity Index & Pre-Harvest Water Management",
                "details": f"Crop is in ripening phase ({age} days). Gradually taper off irrigation 15-20 days before harvest to facilitate sucrose accumulation and brix concentration.",
                "priority": "Medium",
                "source_context": f"Stage: {stage} ({age} days)"
            })
    else:
        recommendations.append({
            "category": "Crop Monitoring",
            "title": "Record Initial Crop Height & Stage",
            "details": "Document your first crop observation to track growth velocity against the sugarcane sigmoidal benchmark.",
            "priority": "Low",
            "source_context": "No observation records"
        })

    # 3. Environmental Precautions & Disease Prevention
    if latest_dis and latest_dis.disease_class > 0:
        recommendations.append({
            "category": "Disease Prevention",
            "title": f"Active Management for {latest_dis.disease_name}",
            "details": f"Recent leaf scan detected {latest_dis.disease_name}. Sanitation protocol: Remove severely affected leaves/stools, avoid sprinkler splash irrigation, and sanitize harvesting knives with 10% sodium hypochlorite.",
            "priority": "Urgent",
            "source_context": f"Detected: {latest_dis.disease_name} ({latest_dis.confidence_score}%)"
        })
    else:
        recommendations.append({
            "category": "Disease Prevention",
            "title": "Prophylactic Detrashing & Foliar Hygiene",
            "details": "Conduct routine removal of dried and senescent lower leaves (detrashing at 5th and 7th month) to improve air movement, reduce insect harborage, and minimize fungal humidity pockets.",
            "priority": "Low",
            "source_context": "General preventive agronomy"
        })

    return recommendations
