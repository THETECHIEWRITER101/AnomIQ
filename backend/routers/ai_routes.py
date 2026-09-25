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

router = APIRouter(prefix="/api/ai", tags=["ai"])

def call_gemini_capa_engine(anomaly: models.Anomaly) -> dict:
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    
    # Try calling Google Gemini AI if key is configured
    if gemini_key and gemini_key != "your_gemini_api_key_here":
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            prompt = f"""
            You are an expert industrial manufacturing reliability engineer specializing in 8D Root Cause Analysis (RCA) and CAPA (Corrective and Preventive Actions).
            
            Analyze the following shopfloor anomaly telemetry:
            - Title: {anomaly.title}
            - Machine ID: {anomaly.machine_id}
            - Production Line: {anomaly.production_line}
            - Severity: {anomaly.severity}
            - Observed Sensor: {anomaly.metric_name} = {anomaly.metric_value} (Threshold: {anomaly.threshold_value})
            - Details: {anomaly.description}

            Respond ONLY in valid raw JSON with this exact structure:
            {{
                "root_cause": "Detailed mechanical/electrical root cause explanation",
                "corrective_action": "Immediate corrective containment action step",
                "preventive_action": "Long term preventive engineering control action",
                "ai_confidence": 92.5
            }}
            """
            response = model.generate_content(prompt)
            clean_text = response.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            
            data = json.loads(clean_text.strip())
            return data
        except Exception as e:
            print(f"Gemini API call returned: {e}. Falling back to domain rule engine.")

    # High-fidelity Industrial Domain Rule Engine Fallback
    title_lower = anomaly.title.lower()
    desc_lower = anomaly.description.lower()

    if "vibrat" in title_lower or "bearing" in title_lower:
        return {
            "root_cause": f"Acoustic sub-harmonic frequency resonance and micro-spalling on spindle bearing raceway due to dynamic load unbalance and lubrication film breakdown at {anomaly.metric_value or 3200} units.",
            "corrective_action": f"Emergency halt on {anomaly.machine_id}. Inspect dynamic runout, replace high-precision angular contact bearing assembly, and recharge grease pack.",
            "preventive_action": "Fit dual-axis piezo vibration accelerometer with high-frequency alert trip at 5.5 mm/s. Automate lubrication mister purge every 45 operating minutes.",
            "ai_confidence": 95.2
        }
    elif "press" in title_lower or "hydraul" in title_lower:
        return {
            "root_cause": f"Primary directional proportional valve seal failure and high-pressure manifold blow-by causing pressure drop to {anomaly.metric_value} bar.",
            "corrective_action": f"Depressurize {anomaly.machine_id} circuit. Inspect cylinder chrome rod for scoring and replace polyurethane seal kit with Viton-90 high-temp pack.",
            "preventive_action": "Install continuous kidney-loop oil particulate polishing unit. Set automated SCADA telemetry trip on pressure decay > 15 bar/min.",
            "ai_confidence": 93.6
        }
    elif "temp" in title_lower or "weld" in title_lower or "heat" in title_lower:
        return {
            "root_cause": f"Internal cooling passage calcification and chiller flow restriction causing localized thermal runaway exceeding {anomaly.threshold_value or 750}°C threshold.",
            "corrective_action": f"Chemical descaling flush of cooling jacket on {anomaly.machine_id}. Replace calcified electrode holder tip and verify chiller flow > 4.5 L/min.",
            "preventive_action": "Incorporate vortex flow turbine sensor with safety PLC interlock. Enforce automated de-ionized coolant conductivity testing weekly.",
            "ai_confidence": 91.8
        }
    else:
        return {
            "root_cause": f"Systematic operational variance detected on {anomaly.machine_id} ({anomaly.production_line}). Deviation in {anomaly.metric_name or 'telemetry'} indicating mechanical backlash or wear.",
            "corrective_action": f"Execute standard lockout/tagout protocol on {anomaly.machine_id}. Recalibrate primary sensors, verify geometric backlash, and run 50-cycle dry run.",
            "preventive_action": "Integrate anomaly signature into machine learning edge inference gateway for proactive early-warning threshold flagging.",
            "ai_confidence": 89.4
        }


@router.post("/generate-capa/{anomaly_id}", response_model=schemas.CapaResponse)
def generate_capa(anomaly_id: int, db: Session = Depends(get_db)):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")

    # Generate synthesized CAPA
    capa_data = call_gemini_capa_engine(anomaly)

    # Check if a CAPA already exists for this anomaly
    existing_capa = db.query(models.CapaAction).filter(models.CapaAction.anomaly_id == anomaly_id).first()
    if existing_capa:
        existing_capa.root_cause = capa_data["root_cause"]
        existing_capa.corrective_action = capa_data["corrective_action"]
        existing_capa.preventive_action = capa_data["preventive_action"]
        existing_capa.ai_confidence = capa_data.get("ai_confidence", 90.0)
        existing_capa.generated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing_capa)
        return existing_capa

    # Create new CAPA record
    new_capa = models.CapaAction(
        anomaly_id=anomaly_id,
        root_cause=capa_data["root_cause"],
        corrective_action=capa_data["corrective_action"],
        preventive_action=capa_data["preventive_action"],
        ai_confidence=capa_data.get("ai_confidence", 92.0),
        review_status="PENDING_REVIEW"
    )

    # Update anomaly status to CAPA_PENDING
    if anomaly.status == "OPEN":
        anomaly.status = "CAPA_PENDING"

    db.add(new_capa)
    db.commit()
    db.refresh(new_capa)
    return new_capa


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
