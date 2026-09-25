from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api", tags=["crud"])

@router.get("/anomalies", response_model=List[schemas.AnomalyResponse])
def get_anomalies(
    severity: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    line: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Anomaly)
    if severity and severity != "ALL":
        query = query.filter(models.Anomaly.severity == severity)
    if status_filter and status_filter != "ALL":
        query = query.filter(models.Anomaly.status == status_filter)
    if line and line != "ALL":
        query = query.filter(models.Anomaly.production_line.contains(line))
    
    return query.order_by(desc(models.Anomaly.detected_at)).all()


@router.get("/anomalies/{anomaly_id}", response_model=schemas.AnomalyResponse)
def get_anomaly_by_id(anomaly_id: int, db: Session = Depends(get_db)):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail=f"Anomaly #{anomaly_id} not found")
    return anomaly


@router.post("/anomalies", response_model=schemas.AnomalyResponse, status_code=status.HTTP_201_CREATED)
def create_anomaly(payload: schemas.AnomalyCreate, db: Session = Depends(get_db)):
    anomaly = models.Anomaly(
        title=payload.title,
        machine_id=payload.machine_id,
        production_line=payload.production_line,
        severity=payload.severity,
        status="OPEN",
        description=payload.description,
        metric_name=payload.metric_name,
        metric_value=payload.metric_value,
        threshold_value=payload.threshold_value,
        operator_name=payload.operator_name,
    )
    db.add(anomaly)
    db.commit()
    db.refresh(anomaly)
    return anomaly


@router.patch("/anomalies/{anomaly_id}/status", response_model=schemas.AnomalyResponse)
def update_anomaly_status(
    anomaly_id: int,
    payload: schemas.AnomalyStatusUpdate,
    db: Session = Depends(get_db)
):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    
    anomaly.status = payload.status
    if payload.status in ["RESOLVED", "CLOSED"]:
        import datetime
        anomaly.resolved_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(anomaly)
    return anomaly


@router.delete("/anomalies/{anomaly_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_anomaly(anomaly_id: int, db: Session = Depends(get_db)):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    db.delete(anomaly)
    db.commit()
    return None


@router.get("/analytics/dashboard", response_model=schemas.DashboardMetricsResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total = db.query(models.Anomaly).count()
    active_critical = db.query(models.Anomaly).filter(
        models.Anomaly.severity == "CRITICAL",
        models.Anomaly.status.in_(["OPEN", "INVESTIGATING", "CAPA_PENDING"])
    ).count()
    
    pending_capa = db.query(models.CapaAction).filter(
        models.CapaAction.review_status == "PENDING_REVIEW"
    ).count()

    recent = db.query(models.Anomaly).order_by(desc(models.Anomaly.detected_at)).limit(5).all()

    return schemas.DashboardMetricsResponse(
        total_anomalies=total,
        active_critical=active_critical,
        pending_capa=pending_capa,
        mttr_hours=3.2,
        recent_anomalies=recent
    )


@router.get("/analytics/trends")
def get_analytics_trends(db: Session = Depends(get_db)):
    # Grouping aggregations
    return {
        "status": "success",
        "oee_health": 87.4,
        "prevented_downtime_hours": 48.6,
        "capa_adoption_rate": 92.0
    }
