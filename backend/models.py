import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    machine_id = Column(String(100), nullable=False)
    production_line = Column(String(150), nullable=False)
    severity = Column(String(50), default="MEDIUM", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), default="OPEN", nullable=False)  # OPEN, INVESTIGATING, CAPA_PENDING, RESOLVED, CLOSED
    description = Column(Text, nullable=False)
    metric_name = Column(String(100), nullable=True)
    metric_value = Column(Float, nullable=True)
    threshold_value = Column(Float, nullable=True)
    operator_name = Column(String(150), nullable=True)
    # Store WebP image CDN URL only (~60 bytes); never store Base64 in PostgreSQL
    image_url = Column(String(500), nullable=True)
    # Timestamp filter index used by main feed and pg_trgm 24h recurrence lookups
    detected_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships with ON DELETE CASCADE to prevent orphaned database records
    capas = relationship("CapaAction", back_populates="anomaly", cascade="all, delete-orphan")


class CapaAction(Base):
    __tablename__ = "capa_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    anomaly_id = Column(Integer, ForeignKey("anomalies.id", ondelete="CASCADE"), nullable=False, index=True)
    root_cause = Column(Text, nullable=False)
    containment_action = Column(Text, nullable=True)
    corrective_action = Column(Text, nullable=False)
    preventive_action = Column(Text, nullable=False)
    ai_confidence = Column(Float, default=90.0)
    review_status = Column(String(50), default="PENDING_REVIEW")  # PENDING_REVIEW, APPROVED, REJECTED, IMPLEMENTED
    reviewer_notes = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    reviewed_at = Column(DateTime, nullable=True)

    anomaly = relationship("Anomaly", back_populates="capas")
