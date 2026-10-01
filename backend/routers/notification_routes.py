from typing import Optional, List, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from dependencies import get_current_facility
import models
import schemas

# Router for notification alerts and messaging
router = APIRouter(tags=["Notifications"])

def filter_by_facility(query, model_col, facility_id: Any):
    """Helper to filter SQLAlchemy queries by facility_id regardless of whether it's integer, string, or UUID."""
    if facility_id is None:
        return query
    fac_str = str(facility_id).strip()
    if not fac_str or fac_str.lower() in ("null", "undefined", "none", "0"):
        return query
    try:
        val = int(fac_str)
        return query.filter((model_col == val) | (model_col == fac_str))
    except ValueError:
        return query.filter(model_col == fac_str)

@router.get("/api/notifications", response_model=List[schemas.NotificationResponse])
@router.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(
    user_role: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    user_id: Optional[Any] = Query(None),
    db: Session = Depends(get_db),
    facility_id: Optional[Any] = Depends(get_current_facility)
):
    """
    Retrieve real-time notifications for the notification alert dashboard and header dropdown.
    Routes alerts by targeted plant role (Quality Engineer vs Facility Head/Lead), or broadcast to 'ALL'.
    """
    query = db.query(models.Notification)
    query = filter_by_facility(query, models.Notification.facility_id, facility_id)

    target_role = user_role or role
    if isinstance(target_role, str) and target_role.strip():
        role_str = target_role.strip()
        query = query.filter(
            (models.Notification.target_role == role_str) |
            (models.Notification.target_role == "ALL") |
            (models.Notification.target_role.ilike(f"%{role_str}%"))
        )
    if user_id is not None and str(user_id).strip() != "":
        query = query.filter(
            (models.Notification.user_id == user_id) | (models.Notification.user_id.is_(None))
        )

    return query.order_by(desc(models.Notification.created_at)).limit(50).all()

@router.patch("/api/notifications/{notification_id}/read", response_model=schemas.NotificationResponse)
@router.patch("/notifications/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_as_read(
    notification_id: Any,
    payload: Optional[schemas.NotificationReadUpdate] = None,
    db: Session = Depends(get_db)
):
    """Mark an individual notification alert as read or unread."""
    notification = db.query(models.Notification).filter(
        (models.Notification.id == str(notification_id)) | (models.Notification.id == notification_id)
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    new_status = payload.read_status if payload is not None else True
    notification.read_status = new_status
    db.commit()
    db.refresh(notification)
    return notification

@router.post("/api/notifications/clear-all")
@router.post("/notifications/clear-all")
def clear_all_notifications(
    db: Session = Depends(get_db),
    facility_id: Optional[Any] = Depends(get_current_facility)
):
    """Bulk mark all notifications for a facility or user as read."""
    query = db.query(models.Notification)
    query = filter_by_facility(query, models.Notification.facility_id, facility_id)
    query.update({models.Notification.read_status: True}, synchronize_session=False)
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}
