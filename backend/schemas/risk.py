from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import datetime

class RiskInput(BaseModel):
    farm_id: int
    temperature: float = Field(..., ge=-10.0, le=60.0)
    humidity: float = Field(..., ge=0.0, le=100.0)
    rainfall: float = Field(..., ge=0.0, le=1000.0)
    soil_moisture: float = Field(..., ge=0.0, le=100.0)
    soil_ph: float = Field(..., ge=3.0, le=11.0)
    crop_age: int = Field(..., ge=0, le=720)

class RiskResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    farm_id: int
    farm_name: Optional[str] = None
    temperature: float
    humidity: float
    rainfall: float
    soil_moisture: float
    soil_ph: float
    crop_age: int
    risk_level: str  # Low Risk, Medium Risk, High Risk
    risk_score: float
    risk_explanation: str
    contributing_factors: List[Dict[str, Any]]
    suggestions: List[str]
    model_used: str
    is_demo: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
