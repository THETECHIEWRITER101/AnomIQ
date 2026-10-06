-- ==============================================================================
-- ANOMIQ SUPABASE POSTGRESQL FULL 8-TABLE ERD SCHEMA
-- 1. facilities       (Multi-tenant organizational plant units)
-- 2. users            (User profiles & role permissions)
-- 3. anomalies        (Shopfloor defect logs & physical sensor telemetry)
-- 4. capa_actions     (AI 5-Whys root cause & ISO 9001/IATF 16949 actions)
-- 5. capa_records     (CAPA audit record log)
-- 6. notifications    (Role-based event notifications & alerts)
-- 7. investigations   (Engineering diagnostic notes & lab telemetry)
-- 8. approvals        (Quality Manager formal sign-off audit trail)
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE UUID & TRIGRAM EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==============================================================================
-- 2. SAFE CLEANUP (CLEANS CORRUPT / ORPHAN ROWS WITHOUT ERRORS)
-- ==============================================================================
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS investigations CASCADE;
DROP TABLE IF EXISTS capa_records CASCADE;
DROP TABLE IF EXISTS capa_actions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS anomalies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

-- ==============================================================================
-- 3. CREATE FACILITIES TABLE
-- ==============================================================================
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    industry VARCHAR(100) NOT NULL DEFAULT 'AUTOMOTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. CREATE USERS TABLE
-- ==============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Facility Admin',
    active_industry VARCHAR(100) DEFAULT 'AUTOMOTIVE',
    last_login_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. CREATE ANOMALIES TABLE
-- ==============================================================================
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    machine_id VARCHAR(100) NOT NULL DEFAULT 'CNC-01',
    machine_line VARCHAR(150) DEFAULT 'Line A - Precision Machining',
    production_line VARCHAR(150) NOT NULL DEFAULT 'Line A - Precision Machining',
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    description TEXT NOT NULL,
    metric_name VARCHAR(100) DEFAULT 'Vibration',
    metric_value FLOAT8 DEFAULT 8.35,
    threshold_value FLOAT8 DEFAULT 4.5,
    operator_name VARCHAR(150),
    image_url VARCHAR(500),
    industry VARCHAR(100) DEFAULT 'AUTOMOTIVE',
    lot_or_batch_number VARCHAR(100),
    compliance_standard VARCHAR(100),
    industry_data JSONB DEFAULT '{}'::jsonb,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ==============================================================================
-- 6. CREATE CAPA ACTIONS / RECORDS TABLE
-- ==============================================================================
CREATE TABLE capa_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_id UUID NOT NULL REFERENCES anomalies(id) ON DELETE CASCADE,
    root_cause TEXT NOT NULL,
    containment_action TEXT,
    corrective_action TEXT NOT NULL,
    preventive_action TEXT NOT NULL,
    regulatory_impact TEXT,
    ai_confidence FLOAT8 DEFAULT 92.5,
    review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewer_notes TEXT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Alias table for legacy compat
CREATE TABLE capa_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_id UUID NOT NULL REFERENCES anomalies(id) ON DELETE CASCADE,
    containment_action TEXT NOT NULL,
    corrective_action TEXT NOT NULL,
    preventive_action TEXT NOT NULL,
    regulatory_impact TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. CREATE NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(100) NOT NULL DEFAULT 'Quality Assurance Engineer',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'NEW_ANOMALY',
    anomaly_id UUID REFERENCES anomalies(id) ON DELETE SET NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. CREATE INVESTIGATIONS & APPROVALS (AUDIT TRAIL)
-- ==============================================================================
CREATE TABLE investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_id UUID NOT NULL REFERENCES anomalies(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    root_cause_notes TEXT NOT NULL,
    lab_telemetry JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_id UUID NOT NULL REFERENCES anomalies(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role_at_signing VARCHAR(100) NOT NULL DEFAULT 'Facility Admin',
    industry VARCHAR(100) NOT NULL DEFAULT 'AUTOMOTIVE',
    workflow_stage VARCHAR(50) NOT NULL DEFAULT 'CAPA_APPROVAL',
    decision VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    comments TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX idx_facilities_code ON facilities(code);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_facility_id ON users(facility_id);
CREATE INDEX idx_anomalies_facility_id ON anomalies(facility_id);
CREATE INDEX idx_anomalies_detected_at ON anomalies(detected_at);
CREATE INDEX idx_notifications_facility_id ON notifications(facility_id);

-- ==============================================================================
-- 10. SEED STARTER FACILITY & ADMIN USER
-- ==============================================================================
INSERT INTO facilities (id, name, code, industry)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Apex Robotics Plant 1', 'FAC-APEX-01', 'AUTOMOTIVE');

INSERT INTO users (id, facility_id, full_name, email, role, active_industry)
VALUES ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'sarah.jenkins@anomiq.industrial', 'Facility Admin', 'AUTOMOTIVE');

-- Additional Starter Seed: Anomalies, CAPA Actions & Notifications
INSERT INTO anomalies (id, facility_id, title, machine_id, machine_line, production_line, severity, status, description, metric_name, metric_value, threshold_value, operator_name, industry, detected_at)
VALUES 
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Spindle bearing harmonic vibration spike', 'CNC-MILL-01', 'Line A - Precision Machining', 'Line A - Precision Machining', 'CRITICAL', 'CAPA_PENDING', 'High acoustic resonance detected at 3800 RPM. Spindle radial runout measured at 0.045mm exceeding 0.005mm spec.', 'Vibration RMS (mm/s)', 8.7, 4.5, 'Sarah Jenkins', 'AUTOMOTIVE', NOW() - INTERVAL '1 hour'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Main ram hydraulic manifold pressure collapse', 'PRESS-HYD-01', 'Line B - Hydraulic Press & Stamping', 'Line B - Hydraulic Press & Stamping', 'CRITICAL', 'OPEN', 'Press ton capacity decayed from 400 tons to 240 tons midway through deep-draw cycle.', 'Cylinder Pressure (bar)', 135.0, 220.0, 'Rajesh Kumar', 'AUTOMOTIVE', NOW() - INTERVAL '2 hours');

INSERT INTO capa_actions (id, anomaly_id, root_cause, containment_action, corrective_action, preventive_action, regulatory_impact, ai_confidence, review_status, reviewer_notes, generated_at)
VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Acoustic sub-harmonic resonance and bearing raceway micro-spalling due to dynamic load unbalance.', 'Immediately isolate CNC-MILL-01 and quarantine batches pending quality audit.', 'Inspect spindle runout, replace angular contact bearing set, and retorque clamp bolts.', 'Integrate continuous high-frequency vibration sensors with 5.5 mm/s automated trip interlock.', 'Ensures IATF 16949 Section 10.2 nonconformity compliance.', 94.5, 'PENDING_REVIEW', 'Reviewed by QA Lead. Action item ready for sign-off.', NOW() - INTERVAL '45 minutes');

INSERT INTO notifications (id, facility_id, user_id, target_role, title, message, type, anomaly_id, read_status, created_at)
VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Quality Assurance Engineer', 'New Anomaly Logged: Spindle bearing harmonic vibration spike', 'Operator Sarah Jenkins logged CRITICAL severity defect on Line A - Precision Machining.', 'NEW_ANOMALY', 'c0000000-0000-0000-0000-000000000001', FALSE, NOW() - INTERVAL '1 hour');
