from datetime import datetime
from typing import Optional, List, Union, Any
from pydantic import BaseModel, ConfigDict

# Facility Schemas
class FacilityCreate(BaseModel):
    name: str
    code: Optional[str] = None
    industry: Optional[str] = "AUTOMOTIVE"

class FacilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    name: str
    code: str
    industry: str
    created_at: datetime

# User & Auth Schemas
class UserSignUp(BaseModel):
    full_name: str
    email: str
    role: Optional[str] = "Facility Admin"
    active_industry: Optional[str] = "AUTOMOTIVE"
    facility_id: Optional[Any] = None
    facility_name: Optional[str] = None
    facility_code: Optional[str] = None
    facility_industry: Optional[str] = "AUTOMOTIVE"

class UserLogin(BaseModel):
    email: str
    facility_code: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    full_name: str
    email: str
    role: str
    active_industry: Optional[str] = "AUTOMOTIVE"
    facility_id: Optional[Any] = None
    facility_name: Optional[str] = None
    facility_code: Optional[str] = None

# Notification Schemas
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    facility_id: Optional[Any] = None
    user_id: Optional[Any] = None
    target_role: str
    title: str
    message: str
    type: str
    anomaly_id: Optional[Any] = None
    read_status: bool
    created_at: datetime

class NotificationReadUpdate(BaseModel):
    read_status: bool = True

# Anomaly Schemas
class AnomalyBase(BaseModel):
    title: str
    machine_id: str
    production_line: str
    machine_line: Optional[str] = None
    severity: str
    description: str
    metric_name: Optional[str] = None
    metric_value: Optional[float] = None
    threshold_value: Optional[float] = None
    operator_name: Optional[str] = None
    image_url: Optional[str] = None
    facility_id: Optional[Any] = None
    industry: Optional[str] = "AUTOMOTIVE"
    lot_or_batch_number: Optional[str] = None
    compliance_standard: Optional[str] = None

class AnomalyCreate(AnomalyBase):
    pass

class AnomalyStatusUpdate(BaseModel):
    status: str

class CapaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    anomaly_id: Any
    root_cause: str
    containment_action: Optional[str] = None
    corrective_action: str
    preventive_action: str
    regulatory_impact: Optional[str] = None
    ai_confidence: float
    review_status: str
    reviewer_notes: Optional[str] = None
    generated_at: datetime
    reviewed_at: Optional[datetime] = None

class AnomalyResponse(AnomalyBase):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    status: str
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    capas: List[CapaResponse] = []

# CAPA Schemas
class CapaReviewUpdate(BaseModel):
    review_status: str
    reviewer_notes: Optional[str] = None

class CapaUpdateRequest(BaseModel):
    root_cause: Optional[str] = None
    containment_action: Optional[str] = None
    corrective_action: Optional[str] = None
    preventive_action: Optional[str] = None
    regulatory_impact: Optional[str] = None
    review_status: Optional[str] = None
    reviewer_notes: Optional[str] = None

class CapaApplyFiveWhysRequest(BaseModel):
    anomaly_id: Any
    root_cause: str
    corrective_action: str
    preventive_action: str
    containment_action: Optional[str] = None
    regulatory_impact: Optional[str] = None
    ai_confidence: Optional[float] = 95.0

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
    facility_id: Optional[Any] = None

class DuplicateMatch(BaseModel):
    id: Any
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
    anomaly_id: Optional[Any] = None
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
