from pydantic import BaseModel, Field
from typing import Optional
import datetime

class ObservationCreate(BaseModel):
    farm_id: int
    observation_date: datetime.date
    crop_age: int = Field(..., ge=0, le=720)
    plant_height: float = Field(..., ge=0.0)  # cm
    growth_stage: str
    leaf_condition: str
    notes: Optional[str] = None

class ObservationUpdate(BaseModel):
    observation_date: Optional[datetime.date] = None
    crop_age: Optional[int] = None
    plant_height: Optional[float] = None
    growth_stage: Optional[str] = None
    leaf_condition: Optional[str] = None
    notes: Optional[str] = None

class ObservationResponse(BaseModel):
    id: int
    user_id: int
    farm_id: int
    farm_name: Optional[str] = None
    observation_date: datetime.date
    crop_age: int
    plant_height: float
    growth_stage: str
    leaf_condition: str
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
