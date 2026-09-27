from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

# Anomaly Schemas
class AnomalyBase(BaseModel):
    title: str
    machine_id: str
    production_line: str
    severity: str
    description: str
    metric_name: Optional[str] = None
    metric_value: Optional[float] = None
    threshold_value: Optional[float] = None
    operator_name: Optional[str] = None
    image_url: Optional[str] = None

class AnomalyCreate(AnomalyBase):
    pass

class AnomalyStatusUpdate(BaseModel):
    status: str

class CapaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    anomaly_id: int
    root_cause: str
    containment_action: Optional[str] = None
    corrective_action: str
    preventive_action: str
    ai_confidence: float
    review_status: str
    reviewer_notes: Optional[str] = None
    generated_at: datetime
    reviewed_at: Optional[datetime] = None

class AnomalyResponse(AnomalyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    capas: List[CapaResponse] = []

# CAPA Schemas
class CapaReviewUpdate(BaseModel):
    review_status: str
    reviewer_notes: Optional[str] = None

# Metrics & Analytics Schemas
class DashboardMetricsResponse(BaseModel):
    total_anomalies: int
    active_critical: int
    pending_capa: int
    mttr_hours: float
    recent_anomalies: List[AnomalyResponse]

# Duplicate & Recurrence Clustering Schemas
class DuplicateCheckRequest(BaseModel):
    title: str
    time_window_hours: Optional[int] = 24

class DuplicateMatch(BaseModel):
    id: int
    title: str
    machine_id: str
    production_line: str
    detected_at: datetime
    similarity_score: float
    status: str

class DuplicateCheckResponse(BaseModel):
    is_duplicate_suspected: bool
    threshold: float = 0.4
    matches: List[DuplicateMatch]

# Voice Intake Schemas
class VoiceIntakeRequest(BaseModel):
    transcript: str

class VoiceIntakeResponse(BaseModel):
    title: str
    machine_id: str
    production_line: str
    severity: str
    description: str
    metric_name: Optional[str] = "Deviation"
    metric_value: Optional[float] = None
    threshold_value: Optional[float] = None

# 5-Whys Diagnostic Copilot Schemas
class FiveWhysHistoryItem(BaseModel):
    step: int
    question: str
    answer: str

class FiveWhysStepRequest(BaseModel):
    anomaly_id: Optional[int] = None
    anomaly_title: Optional[str] = None
    machine_id: Optional[str] = None
    production_line: Optional[str] = None
    metric_name: Optional[str] = None
    metric_value: Optional[float] = None
    threshold_value: Optional[float] = None
    step: int
    history: List[FiveWhysHistoryItem] = []
    technician_input: Optional[str] = None

class FiveWhysStepResponse(BaseModel):
    current_step: int
    why_question: str
    quick_options: List[str]
    is_final_step: bool
    synthesized_root_cause: Optional[str] = ""
    suggested_corrective_action: Optional[str] = ""
    suggested_preventive_action: Optional[str] = ""
