from pydantic import BaseModel, Field
from typing import Optional
import datetime

class FarmCreate(BaseModel):
    farm_name: str = Field(..., min_length=2, max_length=120)
    village: str = Field(..., min_length=2, max_length=120)
    district: str = Field(..., min_length=2, max_length=120)
    farm_area: float = Field(..., gt=0)  # acres
    soil_type: str
    sugarcane_variety: str
    planting_date: datetime.date
    irrigation_type: str

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    farm_area: Optional[float] = None
    soil_type: Optional[str] = None
    sugarcane_variety: Optional[str] = None
    planting_date: Optional[datetime.date] = None
    irrigation_type: Optional[str] = None

class FarmResponse(BaseModel):
    id: int
    user_id: int
    farm_name: str
    village: str
    district: str
    farm_area: float
    soil_type: str
    sugarcane_variety: str
    planting_date: datetime.date
    irrigation_type: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
