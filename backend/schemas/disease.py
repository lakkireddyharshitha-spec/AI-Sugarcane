from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime

class DiseaseDetectionResponse(BaseModel):
    id: int
    user_id: int
    farm_id: Optional[int] = None
    farm_name: Optional[str] = None
    image_filename: str
    image_path: str
    disease_class: int
    disease_name: str
    confidence_score: float
    severity: str
    description: Optional[str] = None
    recommendations: Optional[str] = None
    is_demo: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DiseaseClassInfo(BaseModel):
    class_id: int
    name: str
    scientific_name: Optional[str] = None
    symptoms: List[str]
    severity: str
    next_steps: List[str]

class DatasetInspectionResponse(BaseModel):
    dataset_file_found: bool
    dataset_path: Optional[str] = None
    total_records: int
    classes_count: int
    class_distribution: Dict[str, int]
    images_available: bool
    image_directory_path: Optional[str] = None
    model_trained: bool
    status_message: str
