import os
import joblib
import pandas as pd
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKSPACE_DIR = os.path.dirname(BASE_DIR)
MODEL_PATH = os.path.join(WORKSPACE_DIR, "ml_models", "rf_risk_model.joblib")

def evaluate_disease_risk(
    temperature: float,
    humidity: float,
    rainfall: float,
    soil_moisture: float,
    soil_ph: float,
    crop_age: int
) -> Dict[str, Any]:
    """
    Evaluates sugarcane disease risk using trained Random Forest model if available,
    otherwise uses an explicitly labeled Rule-Based Expert System.
    """
    contributing_factors = []
    suggestions = []

    # Factor Analysis
    if humidity >= 80:
        contributing_factors.append({
            "parameter": "Relative Humidity",
            "value": f"{humidity}%",
            "impact": "High Risk",
            "detail": "Elevated moisture creates optimal conditions for fungal spore germination (Red Rot & Smut)."
        })
        suggestions.append("Improve field ventilation, widen border furrows, and prune dead lower dry leaves (detrashing).")
    elif humidity <= 50:
        contributing_factors.append({
            "parameter": "Relative Humidity",
            "value": f"{humidity}%",
            "impact": "Low Risk",
            "detail": "Dry atmospheric conditions inhibit foliar fungal pathogens."
        })
    else:
        contributing_factors.append({
            "parameter": "Relative Humidity",
            "value": f"{humidity}%",
            "impact": "Moderate",
            "detail": "Normal ambient humidity level."
        })

    if 27 <= temperature <= 35:
        contributing_factors.append({
            "parameter": "Ambient Temperature",
            "value": f"{temperature}°C",
            "impact": "High Risk",
            "detail": "Pathogen multiplication peaks within the 27°C-35°C thermal bracket."
        })
    else:
        contributing_factors.append({
            "parameter": "Ambient Temperature",
            "value": f"{temperature}°C",
            "impact": "Normal",
            "detail": "Thermal environment outside peak pathogen acceleration range."
        })

    if soil_moisture >= 75:
        contributing_factors.append({
            "parameter": "Soil Moisture",
            "value": f"{soil_moisture}%",
            "impact": "High Risk",
            "detail": "Waterlogged or poorly drained soil suffocates root systems and accelerates vascular wilt."
        })
        suggestions.append("Open inter-row drainage trenches immediately to discharge standing water.")
    elif soil_moisture <= 30:
        contributing_factors.append({
            "parameter": "Soil Moisture",
            "value": f"{soil_moisture}%",
            "impact": "Stress Factor",
            "detail": "Water stress compromises plant immune defense against stem borers and opportunistic fungi."
        })
        suggestions.append("Schedule irrigation within 24 hours to relieve moisture deficit stress.")
    else:
        contributing_factors.append({
            "parameter": "Soil Moisture",
            "value": f"{soil_moisture}%",
            "impact": "Optimal",
            "detail": "Moisture is in the healthy zone (40-65%)."
        })

    if rainfall >= 40:
        contributing_factors.append({
            "parameter": "Rainfall",
            "value": f"{rainfall} mm",
            "impact": "High Splash Risk",
            "detail": "Heavy rain splash transports bacterial exudates and fungal conidia across adjacent stools."
        })
        suggestions.append("Refrain from inter-cultivation or machinery movement while foliage is wet to avoid spreading pathogens.")

    if soil_ph < 6.0:
        contributing_factors.append({
            "parameter": "Soil pH",
            "value": f"{soil_ph}",
            "impact": "Acidic Stress",
            "detail": "Acidic soils predispose roots to fungal infection and restrict micronutrient absorption."
        })
        suggestions.append("Apply agricultural lime or dolomite per soil test recommendations before next planting.")
    elif soil_ph > 8.0:
        contributing_factors.append({
            "parameter": "Soil pH",
            "value": f"{soil_ph}",
            "impact": "Alkaline Stress",
            "detail": "Alkaline conditions hinder phosphorus and iron uptake."
        })
        suggestions.append("Apply gypsum or farmyard manure (FYM) to balance alkaline soil.")

    if 60 <= crop_age <= 210:
        contributing_factors.append({
            "parameter": "Crop Stage",
            "value": f"{crop_age} Days",
            "impact": "Vulnerable Stage",
            "detail": "Tillering & Grand Growth are peak vegetative phases requiring vigorous monitoring."
        })
        suggestions.append("Inspect 20 random clumps weekly for early symptoms on the third leaf from the top.")

    if not suggestions:
        suggestions.append("Maintain routine field surveillance and standard irrigation schedule.")

    # Check for trained Random Forest model
    if os.path.exists(MODEL_PATH):
        try:
            saved_data = joblib.load(MODEL_PATH)
            clf = saved_data["model"]
            features = saved_data.get("features", ["temperature", "humidity", "rainfall", "soil_moisture", "soil_ph", "crop_age"])
            df_in = pd.DataFrame([[temperature, humidity, rainfall, soil_moisture, soil_ph, crop_age]], columns=features)
            pred_class = clf.predict(df_in)[0]
            probs = clf.predict_proba(df_in)[0]
            classes = list(clf.classes_)

            # Map predicted class probability as risk score
            high_idx = classes.index("High Risk") if "High Risk" in classes else 0
            med_idx = classes.index("Medium Risk") if "Medium Risk" in classes else 0
            low_idx = classes.index("Low Risk") if "Low Risk" in classes else 0

            # Compute normalized risk score (0-100)
            score = round(float(probs[high_idx] * 100.0 + probs[med_idx] * 50.0), 1)

            if pred_class == "High Risk":
                explanation = "Random Forest model predicted HIGH disease risk based on warm temperature and high humidity/moisture index."
            elif pred_class == "Medium Risk":
                explanation = "Random Forest model predicted MEDIUM disease risk. Environmental conditions require heightened vigilance."
            else:
                explanation = "Random Forest model predicted LOW disease risk. Microclimate currently poses minimal threat to crop foliage."

            return {
                "risk_level": pred_class,
                "risk_score": score,
                "risk_explanation": explanation,
                "contributing_factors": contributing_factors,
                "suggestions": suggestions,
                "model_used": "RandomForestClassifier (Trained Model - Scikit-Learn)",
                "is_demo": False
            }
        except Exception:
            pass

    # Fallback to clearly labeled Rule-Based Expert System (DEMO)
    score = 0.0
    if humidity > 75: score += 35
    elif humidity > 60: score += 15
    if 27 <= temperature <= 35: score += 25
    if soil_moisture > 75 or soil_moisture < 25: score += 20
    if rainfall > 30: score += 15
    if soil_ph < 6.0 or soil_ph > 8.0: score += 10
    score = min(100.0, score)

    if score >= 60:
        level = "High Risk"
        explanation = "Rule-based agro-climatic assessment indicates high disease risk due to compounding humidity and temperature stressors."
    elif score >= 35:
        level = "Medium Risk"
        explanation = "Rule-based agro-climatic assessment indicates moderate disease risk. Routine prophylactic monitoring advised."
    else:
        level = "Low Risk"
        explanation = "Rule-based agro-climatic assessment indicates low disease risk. Weather parameters are within optimal agronomic bounds."

    return {
        "risk_level": level,
        "risk_score": round(score, 1),
        "risk_explanation": explanation,
        "contributing_factors": contributing_factors,
        "suggestions": suggestions,
        "model_used": "Rule-Based Expert System (DEMO Mode)",
        "is_demo": True
    }
