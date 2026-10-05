from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.farm import Farm
from models.crop_observation import CropObservation
from schemas.crop_observation import ObservationCreate, ObservationUpdate, ObservationResponse
from services.auth_service import get_current_user
from services.growth_service import analyze_growth_trend
from ml_models.lstm_growth_model import SugarcaneLSTMForecastPipeline

router = APIRouter(prefix="/growth", tags=["Crop Growth Monitoring"])

lstm_pipeline = SugarcaneLSTMForecastPipeline()

@router.post("/", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
def add_observation(
    obs_in: ObservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == obs_in.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    obs = CropObservation(
        user_id=current_user.id,
        farm_id=obs_in.farm_id,
        observation_date=obs_in.observation_date,
        crop_age=obs_in.crop_age,
        plant_height=obs_in.plant_height,
        growth_stage=obs_in.growth_stage,
        leaf_condition=obs_in.leaf_condition,
        notes=obs_in.notes
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)

    return {
        **obs.__dict__,
        "farm_name": farm.farm_name
    }

@router.get("/", response_model=List[ObservationResponse])
def get_observations(
    farm_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CropObservation).filter(CropObservation.user_id == current_user.id)
    if farm_id:
        query = query.filter(CropObservation.farm_id == farm_id)

    records = query.order_by(CropObservation.observation_date.desc()).all()
    return [
        {
            **r.__dict__,
            "farm_name": r.farm.farm_name if r.farm else None
        }
        for r in records
    ]

@router.get("/trends/{farm_id}")
def get_growth_trends(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    observations = db.query(CropObservation).filter(
        CropObservation.farm_id == farm_id,
        CropObservation.user_id == current_user.id
    ).order_by(CropObservation.crop_age.asc()).all()

    obs_dicts = [
        {
            "id": o.id,
            "observation_date": str(o.observation_date),
            "crop_age": o.crop_age,
            "plant_height": o.plant_height,
            "growth_stage": o.growth_stage,
            "leaf_condition": o.leaf_condition,
            "notes": o.notes
        }
        for o in observations
    ]

    trend_analysis = analyze_growth_trend(obs_dicts)
    lstm_status = lstm_pipeline.get_status()

    return {
        "farm_name": farm.farm_name,
        "total_observations": len(observations),
        "trend_summary": trend_analysis,
        "lstm_forecast_status": lstm_status
    }

@router.put("/{obs_id}", response_model=ObservationResponse)
def update_observation(
    obs_id: int,
    obs_up: ObservationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    obs = db.query(CropObservation).filter(
        CropObservation.id == obs_id,
        CropObservation.user_id == current_user.id
    ).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Observation record not found")

    update_data = obs_up.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(obs, field, value)

    db.commit()
    db.refresh(obs)
    return {
        **obs.__dict__,
        "farm_name": obs.farm.farm_name if obs.farm else None
    }

@router.delete("/{obs_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_observation(
    obs_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    obs = db.query(CropObservation).filter(
        CropObservation.id == obs_id,
        CropObservation.user_id == current_user.id
    ).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")

    db.delete(obs)
    db.commit()
    return None
