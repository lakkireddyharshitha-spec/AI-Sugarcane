import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.farm import Farm
from models.environmental import EnvironmentalReading
from schemas.environmental import EnvironmentalCreate, EnvironmentalUpdate, EnvironmentalResponse
from services.auth_service import get_current_user
from services.alert_service import check_and_create_environmental_alerts

router = APIRouter(prefix="/environmental", tags=["Environmental Monitoring"])

@router.post("/", response_model=EnvironmentalResponse, status_code=status.HTTP_201_CREATED)
def add_reading(
    reading_in: EnvironmentalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == reading_in.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")

    r_date = reading_in.reading_date or datetime.date.today()

    reading = EnvironmentalReading(
        user_id=current_user.id,
        farm_id=reading_in.farm_id,
        temperature=reading_in.temperature,
        humidity=reading_in.humidity,
        rainfall=reading_in.rainfall,
        soil_moisture=reading_in.soil_moisture,
        soil_ph=reading_in.soil_ph,
        crop_age=reading_in.crop_age,
        irrigation_status=reading_in.irrigation_status,
        reading_date=r_date
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # Check for environmental warning thresholds and trigger alerts
    check_and_create_environmental_alerts(db, current_user.id, farm.id, reading)

    return {
        **reading.__dict__,
        "farm_name": farm.farm_name
    }

@router.get("/", response_model=List[EnvironmentalResponse])
def get_readings(
    farm_id: Optional[int] = Query(None),
    start_date: Optional[datetime.date] = Query(None),
    end_date: Optional[datetime.date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(EnvironmentalReading).filter(EnvironmentalReading.user_id == current_user.id)
    if farm_id:
        query = query.filter(EnvironmentalReading.farm_id == farm_id)
    if start_date:
        query = query.filter(EnvironmentalReading.reading_date >= start_date)
    if end_date:
        query = query.filter(EnvironmentalReading.reading_date <= end_date)

    readings = query.order_by(EnvironmentalReading.reading_date.desc(), EnvironmentalReading.id.desc()).all()
    results = []
    for r in readings:
        results.append({
            **r.__dict__,
            "farm_name": r.farm.farm_name if r.farm else None
        })
    return results

@router.get("/charts/{farm_id}")
def get_chart_data(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns chronological data for Recharts line charts."""
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    readings = db.query(EnvironmentalReading).filter(
        EnvironmentalReading.farm_id == farm_id,
        EnvironmentalReading.user_id == current_user.id
    ).order_by(EnvironmentalReading.reading_date.asc()).limit(30).all()

    return [
        {
            "id": r.id,
            "date": str(r.reading_date),
            "temperature": r.temperature,
            "humidity": r.humidity,
            "rainfall": r.rainfall,
            "soil_moisture": r.soil_moisture,
            "soil_ph": r.soil_ph,
            "crop_age": r.crop_age,
            "irrigation_status": r.irrigation_status
        }
        for r in readings
    ]

@router.put("/{reading_id}", response_model=EnvironmentalResponse)
def update_reading(
    reading_id: int,
    reading_up: EnvironmentalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reading = db.query(EnvironmentalReading).filter(
        EnvironmentalReading.id == reading_id,
        EnvironmentalReading.user_id == current_user.id
    ).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")

    update_data = reading_up.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reading, field, value)

    db.commit()
    db.refresh(reading)
    return {
        **reading.__dict__,
        "farm_name": reading.farm.farm_name if reading.farm else None
    }

@router.delete("/{reading_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reading(
    reading_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reading = db.query(EnvironmentalReading).filter(
        EnvironmentalReading.id == reading_id,
        EnvironmentalReading.user_id == current_user.id
    ).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")

    db.delete(reading)
    db.commit()
    return None
