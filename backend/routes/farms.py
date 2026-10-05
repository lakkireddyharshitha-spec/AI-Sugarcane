from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models.user import User
from models.farm import Farm
from schemas.farm import FarmCreate, FarmUpdate, FarmResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/farms", tags=["Farms"])

@router.post("/", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    farm_in: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = Farm(
        user_id=current_user.id,
        farm_name=farm_in.farm_name.strip(),
        village=farm_in.village.strip(),
        district=farm_in.district.strip(),
        farm_area=farm_in.farm_area,
        soil_type=farm_in.soil_type,
        sugarcane_variety=farm_in.sugarcane_variety,
        planting_date=farm_in.planting_date,
        irrigation_type=farm_in.irrigation_type
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.get("/", response_model=List[FarmResponse])
def get_farms(
    search: Optional[str] = Query(None, description="Search by farm name, village, or variety"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Farm).filter(Farm.user_id == current_user.id)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Farm.farm_name.ilike(s),
                Farm.village.ilike(s),
                Farm.district.ilike(s),
                Farm.sugarcane_variety.ilike(s)
            )
        )
    return query.order_by(Farm.created_at.desc()).all()

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm record not found.")
    return farm

@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: int,
    farm_update: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm record not found.")

    update_data = farm_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(farm, field, value)

    db.commit()
    db.refresh(farm)
    return farm

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm record not found.")

    db.delete(farm)
    db.commit()
    return None
