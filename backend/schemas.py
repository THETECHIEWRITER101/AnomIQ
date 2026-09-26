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
