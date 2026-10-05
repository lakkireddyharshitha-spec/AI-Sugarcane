from pydantic import BaseModel
from typing import Optional
import datetime

class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    farm_id: int
    farm_name: Optional[str] = None
    category: str
    title: str
    details: str
    priority: str
    source_context: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
