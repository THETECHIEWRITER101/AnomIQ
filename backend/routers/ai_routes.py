import datetime
from typing import List, Any, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
import models
import schemas
from services.ai_service import ai_engine

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

def run_capa_generation(anomaly_id: Any, db: Session):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == str(anomaly_id)).first()
    if not anomaly:
        # Fallback query for integer or direct ID match
        anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly record not found")

    # Query Gemini reasoning engine via ai_service with token limit & caching
    capa_data = ai_engine.generate_capa(
        title=anomaly.title,
        description=anomaly.description,
        machine_line=f"{anomaly.machine_id} ({anomaly.production_line})",
        severity=anomaly.severity
    )

    # Check if a CAPA record already exists for this anomaly
    existing_capa = db.query(models.CapaAction).filter(
        (models.CapaAction.anomaly_id == str(anomaly_id)) | (models.CapaAction.anomaly_id == anomaly_id)
    ).first()
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
def generate_capa_for_anomaly(anomaly_id: Any, db: Session = Depends(get_db)):
    """
    Expose CAPA Generation REST Endpoint.
    Passes sanitized defect details to Gemini 3.8 Flash, persists structured CAPA, and advances status to CAPA_PENDING.
    """
    return run_capa_generation(anomaly_id, db)

@router.post("/generate-capa/{anomaly_id}", response_model=schemas.CapaResponse)
def generate_capa_legacy(anomaly_id: Any, db: Session = Depends(get_db)):
    return run_capa_generation(anomaly_id, db)

@router.get("/capa-reviews", response_model=List[schemas.CapaResponse])
def get_capa_reviews(db: Session = Depends(get_db)):
    return db.query(models.CapaAction).order_by(desc(models.CapaAction.generated_at)).all()

@router.patch("/capa/{capa_id}/review", response_model=schemas.CapaResponse)
def update_capa_review(capa_id: Any, payload: schemas.CapaReviewUpdate, db: Session = Depends(get_db)):
    capa = db.query(models.CapaAction).filter(
        (models.CapaAction.id == str(capa_id)) | (models.CapaAction.id == capa_id)
    ).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA protocol not found")

    capa.review_status = payload.review_status
    if payload.reviewer_notes is not None:
        capa.reviewer_notes = payload.reviewer_notes
    capa.reviewed_at = datetime.datetime.utcnow()

    # If approved or implemented, also update parent anomaly status
    if payload.review_status in ["IMPLEMENTED", "APPROVED"]:
        anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == capa.anomaly_id).first()
        if anomaly:
            anomaly.status = "RESOLVED" if payload.review_status == "IMPLEMENTED" else "CAPA_PENDING"
            if payload.review_status == "IMPLEMENTED":
                anomaly.resolved_at = datetime.datetime.utcnow()

                # Dispatch Notification to Facility Head / Plant Manager
                try:
                    notification = models.Notification(
                        facility_id=anomaly.facility_id,
                        target_role="Facility Head / Operations Manager",
                        title=f"CAPA Process Complete: Anomaly #{anomaly.id} Resolved",
                        message=f"CAPA protocol for defect '{anomaly.title}' on {anomaly.production_line} has been verified & implemented.",
                        type="CAPA_RESOLVED",
                        anomaly_id=anomaly.id,
                        read_status=False
                    )
                    db.add(notification)
                except Exception as e:
                    print(f"Notification error: {e}")

    db.commit()
    db.refresh(capa)
    return capa

@router.put("/capa/{capa_id}", response_model=schemas.CapaResponse)
def update_capa_full(capa_id: Any, payload: schemas.CapaUpdateRequest, db: Session = Depends(get_db)):
    """Allow full inline editing of CAPA actions prior to or during engineering review."""
    capa = db.query(models.CapaAction).filter(
        (models.CapaAction.id == str(capa_id)) | (models.CapaAction.id == capa_id)
    ).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA protocol not found")

    if payload.root_cause is not None:
        capa.root_cause = payload.root_cause
    if payload.containment_action is not None:
        capa.containment_action = payload.containment_action
    if payload.corrective_action is not None:
        capa.corrective_action = payload.corrective_action
    if payload.preventive_action is not None:
        capa.preventive_action = payload.preventive_action
    if payload.review_status is not None:
        capa.review_status = payload.review_status
    if payload.reviewer_notes is not None:
        capa.reviewer_notes = payload.reviewer_notes
    capa.reviewed_at = datetime.datetime.utcnow()

    if payload.review_status == "IMPLEMENTED":
        anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == capa.anomaly_id).first()
        if anomaly:
            anomaly.status = "RESOLVED"
            anomaly.resolved_at = datetime.datetime.utcnow()

            # Dispatch Notification to Facility Head / Plant Manager
            try:
                notification = models.Notification(
                    facility_id=anomaly.facility_id,
                    target_role="Facility Head / Operations Manager",
                    title=f"CAPA Process Complete: Anomaly #{anomaly.id} Resolved",
                    message=f"CAPA protocol for defect '{anomaly.title}' on {anomaly.production_line} has been verified & implemented.",
                    type="CAPA_RESOLVED",
                    anomaly_id=anomaly.id,
                    read_status=False
                )
                db.add(notification)
            except Exception as e:
                print(f"Notification error: {e}")

    db.commit()
    db.refresh(capa)
    return capa

@router.post("/5-whys/apply", response_model=schemas.CapaResponse, status_code=status.HTTP_201_CREATED)
def apply_5_whys_to_capa(payload: schemas.CapaApplyFiveWhysRequest, db: Session = Depends(get_db)):
    """Directly converts completed 5-Whys diagnostic output into an actionable CAPA record and dispatches notification to Quality Sign-off."""
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == payload.anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly record not found")

    existing_capa = db.query(models.CapaAction).filter(models.CapaAction.anomaly_id == payload.anomaly_id).first()
    if existing_capa:
        existing_capa.root_cause = payload.root_cause
        if payload.containment_action:
            existing_capa.containment_action = payload.containment_action
        existing_capa.corrective_action = payload.corrective_action
        existing_capa.preventive_action = payload.preventive_action
        existing_capa.ai_confidence = payload.ai_confidence or 95.0
        existing_capa.generated_at = datetime.datetime.utcnow()
        existing_capa.review_status = "PENDING_REVIEW"
        anomaly.status = "CAPA_PENDING"

        # Dispatch notification to Quality Manager / Sign-off Authority
        try:
            notif = models.Notification(
                facility_id=anomaly.facility_id,
                target_role="Quality Manager / Sign-off Authority",
                title=f"5-Whys CAPA Ready for Sign-Off: Anomaly #{anomaly.id}",
                message=f"QA Engineer completed 5-Whys investigation for '{anomaly.title}' on {anomaly.production_line}. Dual logs are ready for Quality sign-off and closure.",
                type="CAPA_SUBMITTED_FOR_REVIEW",
                anomaly_id=anomaly.id,
                read_status=False
            )
            db.add(notif)
        except Exception as e:
            print(f"Notification error: {e}")

        db.commit()
        db.refresh(existing_capa)
        return existing_capa

    new_capa = models.CapaAction(
        anomaly_id=anomaly.id,
        root_cause=payload.root_cause,
        containment_action=payload.containment_action or f"Isolate batch and hold {anomaly.machine_id} for maintenance.",
        corrective_action=payload.corrective_action,
        preventive_action=payload.preventive_action,
        ai_confidence=payload.ai_confidence or 95.0,
        review_status="PENDING_REVIEW"
    )
    anomaly.status = "CAPA_PENDING"
    db.add(new_capa)

    # Dispatch notification to Quality Manager / Sign-off Authority
    try:
        notif = models.Notification(
            facility_id=anomaly.facility_id,
            target_role="Quality Manager / Sign-off Authority",
            title=f"5-Whys CAPA Ready for Sign-Off: Anomaly #{anomaly.id}",
            message=f"QA Engineer completed 5-Whys investigation for '{anomaly.title}' on {anomaly.production_line}. Dual logs are ready for Quality sign-off and closure.",
            type="CAPA_SUBMITTED_FOR_REVIEW",
            anomaly_id=anomaly.id,
            read_status=False
        )
        db.add(notif)
    except Exception as e:
        print(f"Notification error: {e}")

    db.commit()
    db.refresh(new_capa)
    return new_capa


@router.post("/capa/{capa_id}/sign-off", response_model=schemas.CapaResponse)
def sign_off_capa_report(capa_id: Any, payload: schemas.CapaReviewUpdate, db: Session = Depends(get_db)):
    """
    Dedicated endpoint for Quality Manager / Sign-off Authority.
    Reviews dual logs (operator log + 5-whys CAPA report), signs off, and closes the incident.
    """
    capa = db.query(models.CapaAction).filter(models.CapaAction.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA protocol not found")

    capa.review_status = "IMPLEMENTED"
    if payload.reviewer_notes:
        capa.reviewer_notes = payload.reviewer_notes
    capa.reviewed_at = datetime.datetime.utcnow()

    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == capa.anomaly_id).first()
    if anomaly:
        anomaly.status = "RESOLVED"
        anomaly.resolved_at = datetime.datetime.utcnow()

        # Resolution notification to Plant operations & Facility Head
        try:
            notif = models.Notification(
                facility_id=anomaly.facility_id,
                target_role="ALL",
                title=f"Incident Closed: Anomaly #{anomaly.id} Signed-Off",
                message=f"Quality Sign-off complete for '{anomaly.title}'. 5-Whys root cause and CAPA successfully verified & closed.",
                type="CAPA_RESOLVED",
                anomaly_id=anomaly.id,
                read_status=False
            )
            db.add(notif)
        except Exception as e:
            print(f"Notification error: {e}")

    db.commit()
    db.refresh(capa)
    return capa


@router.post("/voice-intake", response_model=schemas.VoiceIntakeResponse)
def parse_voice_intake(payload: schemas.VoiceIntakeRequest):
    """
    Zero-Cost Voice-to-Defect Intake (Floor Mode).
    Transcribes operator speech directly on the frontend using Web Speech API,
    then parses with Gemini Flash into structured ticket attributes.
    """
    parsed = ai_engine.parse_voice_intake(payload.transcript)
    return schemas.VoiceIntakeResponse(
        title=parsed.get("component", "Anomaly") + ": " + parsed.get("symptom", "Reported Defect")[:60],
        machine_id=parsed.get("component", "MACHINE-01"),
        production_line=parsed.get("line", "Line A - Precision Machining"),
        severity=parsed.get("suggested_severity", "HIGH"),
        description=parsed.get("symptom", payload.transcript),
        metric_name=parsed.get("metric_name", "Deviation"),
        metric_value=parsed.get("metric_value", 1.0),
        threshold_value=0.5
    )


@router.post("/5-whys/step", response_model=schemas.FiveWhysStepResponse)
def process_5_whys_step(payload: schemas.FiveWhysStepRequest, db: Session = Depends(get_db)):
    """
    Interactive '5-Whys' Diagnostic Copilot.
    Prompts technician step-by-step through the 5-Whys root-cause tree with telemetry-aware quick-response chips.
    """
    anomaly_info = {
        "title": payload.anomaly_title or "Machine Deviation",
        "machine_id": payload.machine_id or "Equipment",
        "production_line": payload.production_line or "Plant Floor",
        "metric_name": payload.metric_name,
        "metric_value": payload.metric_value,
        "threshold_value": payload.threshold_value,
    }

    if payload.anomaly_id:
        anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == payload.anomaly_id).first()
        if anomaly:
            anomaly_info["title"] = anomaly.title
            anomaly_info["machine_id"] = anomaly.machine_id
            anomaly_info["production_line"] = anomaly.production_line
            anomaly_info["metric_name"] = anomaly.metric_name
            anomaly_info["metric_value"] = anomaly.metric_value
            anomaly_info["threshold_value"] = anomaly.threshold_value

    history_dicts = [{"step": h.step, "question": h.question, "answer": h.answer} for h in payload.history]

    result = ai_engine.generate_5_whys_step(
        anomaly_info=anomaly_info,
        step=payload.step,
        history=history_dicts,
        technician_input=payload.technician_input
    )

    return schemas.FiveWhysStepResponse(
        current_step=result.get("current_step", payload.step),
        why_question=result.get("why_question", f"Why did this occur at Step {payload.step}?"),
        quick_options=result.get("quick_options", []),
        is_final_step=result.get("is_final_step", False),
        synthesized_root_cause=result.get("synthesized_root_cause", ""),
        suggested_corrective_action=result.get("suggested_corrective_action", ""),
        suggested_preventive_action=result.get("suggested_preventive_action", "")
    )
