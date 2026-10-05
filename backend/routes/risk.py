import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.farm import Farm
from models.risk_prediction import RiskPrediction
from schemas.risk import RiskInput, RiskResponse
from services.auth_service import get_current_user
from services.risk_service import evaluate_disease_risk

router = APIRouter(prefix="/risk", tags=["AI Disease Risk Prediction"])

@router.post("/predict", response_model=RiskResponse)
def predict_disease_risk(
    risk_in: RiskInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == risk_in.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    res = evaluate_disease_risk(
        temperature=risk_in.temperature,
        humidity=risk_in.humidity,
        rainfall=risk_in.rainfall,
        soil_moisture=risk_in.soil_moisture,
        soil_ph=risk_in.soil_ph,
        crop_age=risk_in.crop_age
    )

    prediction = RiskPrediction(
        user_id=current_user.id,
        farm_id=risk_in.farm_id,
        temperature=risk_in.temperature,
        humidity=risk_in.humidity,
        rainfall=risk_in.rainfall,
        soil_moisture=risk_in.soil_moisture,
        soil_ph=risk_in.soil_ph,
        crop_age=risk_in.crop_age,
        risk_level=res["risk_level"],
        risk_score=res["risk_score"],
        risk_explanation=res["risk_explanation"],
        contributing_factors=json.dumps(res["contributing_factors"]),
        suggestions=json.dumps(res["suggestions"]),
        model_used=res["model_used"],
        is_demo=res["is_demo"]
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return {
        "id": prediction.id,
        "user_id": prediction.user_id,
        "farm_id": prediction.farm_id,
        "farm_name": farm.farm_name,
        "temperature": prediction.temperature,
        "humidity": prediction.humidity,
        "rainfall": prediction.rainfall,
        "soil_moisture": prediction.soil_moisture,
        "soil_ph": prediction.soil_ph,
        "crop_age": prediction.crop_age,
        "risk_level": prediction.risk_level,
        "risk_score": prediction.risk_score,
        "risk_explanation": prediction.risk_explanation,
        "contributing_factors": res["contributing_factors"],
        "suggestions": res["suggestions"],
        "model_used": prediction.model_used,
        "is_demo": prediction.is_demo,
        "created_at": prediction.created_at
    }

@router.get("/history", response_model=List[RiskResponse])
def get_risk_history(
    farm_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(RiskPrediction).filter(RiskPrediction.user_id == current_user.id)
    if farm_id:
        query = query.filter(RiskPrediction.farm_id == farm_id)

    predictions = query.order_by(RiskPrediction.created_at.desc()).all()
    results = []
    for p in predictions:
        try:
            factors = json.loads(p.contributing_factors)
        except Exception:
            factors = []
        try:
            suggestions = json.loads(p.suggestions)
        except Exception:
            suggestions = []

        results.append({
            "id": p.id,
            "user_id": p.user_id,
            "farm_id": p.farm_id,
            "farm_name": p.farm.farm_name if p.farm else None,
            "temperature": p.temperature,
            "humidity": p.humidity,
            "rainfall": p.rainfall,
            "soil_moisture": p.soil_moisture,
            "soil_ph": p.soil_ph,
            "crop_age": p.crop_age,
            "risk_level": p.risk_level,
            "risk_score": p.risk_score,
            "risk_explanation": p.risk_explanation,
            "contributing_factors": factors,
            "suggestions": suggestions,
            "model_used": p.model_used,
            "is_demo": p.is_demo,
            "created_at": p.created_at
        })
    return results
