from pydantic import BaseModel
from typing import Optional
import datetime

class AlertCreate(BaseModel):
    farm_id: Optional[int] = None
    title: str
    category: str
    severity: str
    reason: str
    recommended_action: str

class AlertResponse(BaseModel):
    id: int
    user_id: int
    farm_id: Optional[int] = None
    farm_name: Optional[str] = None
    title: str
    category: str
    severity: str
    reason: str
    recommended_action: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
