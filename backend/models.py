import uuid
import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid_str():
    return str(uuid.uuid4())

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    industry = Column(String(100), default="AUTOMOTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="facility", cascade="all, delete-orphan", foreign_keys="User.facility_id")
    anomalies = relationship("Anomaly", back_populates="facility", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="facility", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    facility_id = Column(String(36), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(100), nullable=False, default="Facility Admin")
    active_industry = Column(String(100), default="AUTOMOTIVE")
    last_login_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    facility = relationship("Facility", back_populates="users", foreign_keys=[facility_id])


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    facility_id = Column(String(36), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    machine_id = Column(String(100), default="CNC-01", nullable=False)
    machine_line = Column(String(150), default="Line A - Precision Machining")
    production_line = Column(String(150), default="Line A - Precision Machining", nullable=False)
    severity = Column(String(50), default="MEDIUM", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), default="OPEN", nullable=False)  # OPEN, INVESTIGATING, CAPA_PENDING, RESOLVED, CLOSED
    description = Column(Text, nullable=False)
    metric_name = Column(String(100), default="Vibration")
    metric_value = Column(Float, default=8.35)
    threshold_value = Column(Float, default=4.5)
    operator_name = Column(String(150), nullable=True)
    image_url = Column(String(500), nullable=True)
    industry = Column(String(100), default="AUTOMOTIVE")
    lot_or_batch_number = Column(String(100), nullable=True)
    compliance_standard = Column(String(100), nullable=True)
    industry_data = Column(Text, default="{}")
    reported_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)

    facility = relationship("Facility", back_populates="anomalies")
    capas = relationship("CapaAction", back_populates="anomaly", cascade="all, delete-orphan")
    capa_records = relationship("CapaRecord", back_populates="anomaly", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="anomaly", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="anomaly", cascade="all, delete-orphan")


class CapaAction(Base):
    __tablename__ = "capa_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    anomaly_id = Column(String(36), ForeignKey("anomalies.id", ondelete="CASCADE"), nullable=False, index=True)
    root_cause = Column(Text, nullable=False)
    containment_action = Column(Text, nullable=True)
    corrective_action = Column(Text, nullable=False)
    preventive_action = Column(Text, nullable=False)
    regulatory_impact = Column(Text, nullable=True)
    ai_confidence = Column(Float, default=92.5)
    review_status = Column(String(50), default="PENDING_REVIEW")  # PENDING_REVIEW, APPROVED, REJECTED, IMPLEMENTED
    reviewer_notes = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    reviewed_at = Column(DateTime, nullable=True)

    anomaly = relationship("Anomaly", back_populates="capas")


class CapaRecord(Base):
    __tablename__ = "capa_records"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    anomaly_id = Column(String(36), ForeignKey("anomalies.id", ondelete="CASCADE"), nullable=False, index=True)
    containment_action = Column(Text, nullable=False)
    corrective_action = Column(Text, nullable=False)
    preventive_action = Column(Text, nullable=False)
    regulatory_impact = Column(Text, nullable=True)
    status = Column(String(50), default="DRAFT", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    anomaly = relationship("Anomaly", back_populates="capa_records")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    facility_id = Column(String(36), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    target_role = Column(String(100), default="Quality Assurance Engineer", nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="NEW_ANOMALY", nullable=False)  # NEW_ANOMALY, CAPA_RESOLVED, CAPA_SUBMITTED_FOR_REVIEW
    anomaly_id = Column(String(36), ForeignKey("anomalies.id", ondelete="SET NULL"), nullable=True)
    read_status = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    facility = relationship("Facility", back_populates="notifications")


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    anomaly_id = Column(String(36), ForeignKey("anomalies.id", ondelete="CASCADE"), nullable=False, index=True)
    technician_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    root_cause_notes = Column(Text, nullable=False)
    lab_telemetry = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    anomaly = relationship("Anomaly", back_populates="investigations")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    anomaly_id = Column(String(36), ForeignKey("anomalies.id", ondelete="CASCADE"), nullable=False, index=True)
    approver_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    role_at_signing = Column(String(100), default="Facility Admin", nullable=False)
    industry = Column(String(100), default="AUTOMOTIVE", nullable=False)
    workflow_stage = Column(String(50), default="CAPA_APPROVAL", nullable=False)
    decision = Column(String(50), default="APPROVED", nullable=False)
    comments = Column(Text, nullable=True)
    signed_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    anomaly = relationship("Anomaly", back_populates="approvals")
