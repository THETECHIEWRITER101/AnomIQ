import os
import json
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
import models
import schemas
from services.ai_service import ai_engine

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

def run_capa_generation(anomaly_id: int, db: Session):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly record not found")

    # Query Gemini reasoning engine via ai_service
    capa_data = ai_engine.generate_capa(
        title=anomaly.title,
        description=anomaly.description,
        machine_line=f"{anomaly.machine_id} ({anomaly.production_line})",
        severity=anomaly.severity
    )

    # Check if a CAPA record already exists for this anomaly
    existing_capa = db.query(models.CapaAction).filter(models.CapaAction.anomaly_id == anomaly_id).first()
    if existing_capa:
        existing_capa.root_cause = capa_data.get("root_cause", "")
        existing_capa.containment_action = capa_data.get("containment_action", "")
        existing_capa.corrective_action = capa_data["corrective_action"]
        existing_capa.preventive_action = capa_data["preventive_action"]
        existing_capa.ai_confidence = capa_data.get("ai_confidence", 92.5)
        existing_capa.generated_at = datetime.datetime.utcnow()
        anomaly.status = "CAPA_PENDING"
        db.commit()
        db.refresh(existing_capa)
        return existing_capa

    # Create and persist new CAPA record
    new_capa = models.CapaAction(
        anomaly_id=anomaly.id,
        root_cause=capa_data.get("root_cause", f"Defect root cause on {anomaly.machine_id}"),
        containment_action=capa_data.get("containment_action", ""),
        corrective_action=capa_data["corrective_action"],
        preventive_action=capa_data["preventive_action"],
        ai_confidence=capa_data.get("ai_confidence", 92.5),
        review_status="PENDING_REVIEW"
    )
    anomaly.status = "CAPA_PENDING"
    db.add(new_capa)
    db.commit()
    db.refresh(new_capa)
    return new_capa

@router.post("/capa/generate/{anomaly_id}", response_model=schemas.CapaResponse, status_code=status.HTTP_201_CREATED)
def generate_capa_for_anomaly(anomaly_id: int, db: Session = Depends(get_db)):
    """
    Step 4: Expose the CAPA Generation REST Endpoint.
    Queries the reported defect, passes details to Gemini 3.8 Flash,
    persists structured CAPA into database, and advances status to CAPA_PENDING.
    """
    return run_capa_generation(anomaly_id, db)

@router.post("/generate-capa/{anomaly_id}", response_model=schemas.CapaResponse)
def generate_capa_legacy(anomaly_id: int, db: Session = Depends(get_db)):
    """
    Frontend-compatible endpoint route forwarding to CAPA generation engine.
    """
    return run_capa_generation(anomaly_id, db)


@router.get("/capa-reviews", response_model=List[schemas.CapaResponse])
def get_capa_reviews(db: Session = Depends(get_db)):
    return db.query(models.CapaAction).order_by(desc(models.CapaAction.generated_at)).all()


@router.patch("/capa/{capa_id}/review", response_model=schemas.CapaResponse)
def update_capa_review(capa_id: int, payload: schemas.CapaReviewUpdate, db: Session = Depends(get_db)):
    capa = db.query(models.CapaAction).filter(models.CapaAction.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA protocol not found")

    capa.review_status = payload.review_status
    if payload.reviewer_notes is not None:
        capa.reviewer_notes = payload.reviewer_notes
    capa.reviewed_at = datetime.datetime.utcnow()

    # If approved or implemented, also update parent anomaly status
    if payload.review_status == "IMPLEMENTED":
        anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == capa.anomaly_id).first()
        if anomaly:
            anomaly.status = "RESOLVED"
            anomaly.resolved_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(capa)
    return capa
