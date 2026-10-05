from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.farm import Farm
from schemas.recommendation import RecommendationResponse
from services.auth_service import get_current_user
from services.recommendation_service import generate_live_recommendations

router = APIRouter(prefix="/recommendations", tags=["AI Agronomic Recommendations"])

@router.get("/{farm_id}")
def get_recommendations_for_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    recs = generate_live_recommendations(db, current_user.id, farm_id)
    return {
        "farm_id": farm.id,
        "farm_name": farm.farm_name,
        "sugarcane_variety": farm.sugarcane_variety,
        "recommendations": recs
    }
