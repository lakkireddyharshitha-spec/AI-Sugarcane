from pydantic import BaseModel, Field
from typing import Optional
import datetime

class EnvironmentalCreate(BaseModel):
    farm_id: int
    temperature: float = Field(..., ge=-10.0, le=60.0)
    humidity: float = Field(..., ge=0.0, le=100.0)
    rainfall: float = Field(..., ge=0.0, le=1000.0)
    soil_moisture: float = Field(..., ge=0.0, le=100.0)
    soil_ph: float = Field(..., ge=3.0, le=11.0)
    crop_age: int = Field(..., ge=0, le=720)
    irrigation_status: str
    reading_date: Optional[datetime.date] = None

class EnvironmentalUpdate(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    soil_moisture: Optional[float] = None
    soil_ph: Optional[float] = None
    crop_age: Optional[int] = None
    irrigation_status: Optional[str] = None
    reading_date: Optional[datetime.date] = None

class EnvironmentalResponse(BaseModel):
    id: int
    user_id: int
    farm_id: int
    farm_name: Optional[str] = None
    temperature: float
    humidity: float
    rainfall: float
    soil_moisture: float
    soil_ph: float
    crop_age: int
    irrigation_status: str
    reading_date: datetime.date
    created_at: datetime.datetime

    class Config:
        from_attributes = True
