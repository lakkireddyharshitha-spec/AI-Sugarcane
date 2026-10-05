from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
import datetime

from database import get_db
from models.user import User
from models.farm import Farm
from services.auth_service import get_current_user
from services.pdf_service import generate_farm_report_pdf

router = APIRouter(prefix="/reports", tags=["PDF Reports"])

@router.get("/download-pdf")
def download_pdf_report(
    farm_id: int = Query(..., description="ID of the farm to generate report for"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized.")

    try:
        pdf_buffer = generate_farm_report_pdf(db, current_user, farm_id)
        filename = f"CaneGuard_Report_{farm.farm_name.replace(' ', '_')}_{datetime.date.today().strftime('%Y%m%d')}.pdf"

        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")
