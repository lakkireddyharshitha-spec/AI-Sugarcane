import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.farm import Farm
from models.disease_detection import DiseaseDetection
from schemas.disease import DiseaseDetectionResponse, DatasetInspectionResponse
from services.auth_service import get_current_user
from services.disease_service import analyze_leaf_image, UPLOADS_DIR
from services.dataset_service import inspect_dataset, get_class_mapping, MAPPING_FILE
from services.alert_service import check_and_create_disease_alert
import json

router = APIRouter(prefix="/diseases", tags=["Sugarcane Disease Detection"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

@router.post("/analyze", response_model=DiseaseDetectionResponse)
async def upload_and_analyze_leaf(
    file: UploadFile = File(...),
    farm_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats are JPG, JPEG, and PNG."
        )

    # Save to uploads folder
    safe_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOADS_DIR, safe_filename)

    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:  # 15MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit (15MB)."
        )

    with open(file_path, "wb") as f:
        f.write(contents)

    # Validate farm if supplied
    farm_name = None
    if farm_id:
        farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
        if farm:
            farm_name = farm.farm_name

    # Run analysis (CNN or transparent DEMO MODE)
    analysis_res = analyze_leaf_image(file_path)

    # Save to database
    detection = DiseaseDetection(
        user_id=current_user.id,
        farm_id=farm_id,
        image_filename=safe_filename,
        image_path=f"uploads/{safe_filename}",
        disease_class=analysis_res["disease_class"],
        disease_name=analysis_res["disease_name"],
        confidence_score=analysis_res["confidence_score"],
        severity=analysis_res["severity"],
        description=analysis_res["description"],
        recommendations=analysis_res["recommendations"],
        is_demo=analysis_res["is_demo"]
    )
    db.add(detection)
    db.commit()
    db.refresh(detection)

    # Auto-generate alert if disease detected
    if farm_id and detection.disease_class > 0:
        check_and_create_disease_alert(db, current_user.id, farm_id, detection)

    return {
        "id": detection.id,
        "user_id": detection.user_id,
        "farm_id": detection.farm_id,
        "farm_name": farm_name,
        "image_filename": detection.image_filename,
        "image_path": f"/api/diseases/image/{safe_filename}",
        "disease_class": detection.disease_class,
        "disease_name": detection.disease_name,
        "confidence_score": detection.confidence_score,
        "severity": detection.severity,
        "description": detection.description,
        "recommendations": detection.recommendations,
        "is_demo": detection.is_demo,
        "created_at": detection.created_at
    }

@router.get("/image/{filename}")
def get_uploaded_image(filename: str):
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

@router.get("/history", response_model=List[DiseaseDetectionResponse])
def get_detection_history(
    farm_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DiseaseDetection).filter(DiseaseDetection.user_id == current_user.id)
    if farm_id:
        query = query.filter(DiseaseDetection.farm_id == farm_id)

    detections = query.order_by(DiseaseDetection.created_at.desc()).all()
    results = []
    for d in detections:
        f_name = d.farm.farm_name if d.farm else None
        results.append({
            "id": d.id,
            "user_id": d.user_id,
            "farm_id": d.farm_id,
            "farm_name": f_name,
            "image_filename": d.image_filename,
            "image_path": f"/api/diseases/image/{d.image_filename}",
            "disease_class": d.disease_class,
            "disease_name": d.disease_name,
            "confidence_score": d.confidence_score,
            "severity": d.severity,
            "description": d.description,
            "recommendations": d.recommendations,
            "is_demo": d.is_demo,
            "created_at": d.created_at
        })
    return results

@router.get("/dataset-status", response_model=DatasetInspectionResponse)
def get_dataset_inspection_status():
    """Inspects dataset CSV and image paths, returns real training availability and status."""
    return inspect_dataset()

@router.get("/classes")
def get_disease_classes():
    """Returns configurable class mapping for numeric labels (0..4)."""
    return get_class_mapping()

@router.put("/classes")
def update_disease_classes(classes_update: dict, current_user: User = Depends(get_current_user)):
    """Allows agronomists/users to update class mapping labels."""
    try:
        with open(MAPPING_FILE, "w", encoding="utf-8") as f:
            json.dump(classes_update, f, indent=2)
        return {"status": "success", "message": "Class mapping successfully updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
