from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.alert import Alert
from schemas.alert import AlertResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts"])

@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    is_read: Optional[bool] = Query(None),
    farm_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    if category:
        query = query.filter(Alert.category == category)
    if severity:
        query = query.filter(Alert.severity == severity)
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)
    if farm_id:
        query = query.filter(Alert.farm_id == farm_id)

    alerts = query.order_by(Alert.created_at.desc()).all()
    return [
        {
            **a.__dict__,
            "farm_name": a.farm.farm_name if a.farm else None
        }
        for a in alerts
    ]

@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Alert).filter(Alert.user_id == current_user.id, Alert.is_read == False).count()
    return {"unread_count": count}

@router.patch("/{alert_id}/read")
def mark_alert_read(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"status": "success", "alert_id": alert_id, "is_read": True}

@router.post("/mark-all-read")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Alert).filter(Alert.user_id == current_user.id, Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All alerts marked as read"}
