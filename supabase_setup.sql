-- ==============================================================================
-- AnomIQ — Supabase Production & Free-Tier Optimization Setup
-- ==============================================================================
-- Designed for: 500 MB DB Limit & 5 GB Egress Tier
-- Optimizations:
--   1. pg_trgm trigram search for instant duplicate defect clustering
--   2. ON DELETE CASCADE to eliminate orphaned records
--   3. Minimal, high-cardinality indexing to prevent storage bloat
--   4. WebP URL persistence instead of binary Base64 image bloat
-- ==============================================================================

-- 1. Enable pg_trgm extension for title similarity queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Anomalies Master Table
CREATE TABLE IF NOT EXISTS anomalies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    machine_id VARCHAR(100) NOT NULL,
    production_line VARCHAR(150) NOT NULL,
    severity VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    status VARCHAR(50) DEFAULT 'OPEN' NOT NULL,     -- OPEN, INVESTIGATING, CAPA_PENDING, RESOLVED, CLOSED
    description TEXT NOT NULL,
    metric_name VARCHAR(100),
    metric_value DOUBLE PRECISION,
    threshold_value DOUBLE PRECISION,
    operator_name VARCHAR(150),
    image_url VARCHAR(500),                         -- Persist WebP CDN URL (~60 bytes), never Base64
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. CAPA Actions Table (with ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS capa_actions (
    id SERIAL PRIMARY KEY,
    anomaly_id INTEGER NOT NULL REFERENCES anomalies(id) ON DELETE CASCADE,
    root_cause TEXT NOT NULL,
    containment_action TEXT,
    corrective_action TEXT NOT NULL,
    preventive_action TEXT NOT NULL,
    ai_confidence DOUBLE PRECISION DEFAULT 90.0,
    review_status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED, IMPLEMENTED
    reviewer_notes TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Pruned Indexes (Keep only foreign keys, feed timestamp, and pg_trgm GIN)
CREATE INDEX IF NOT EXISTS idx_anomalies_detected_at ON anomalies(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_status ON anomalies(status);
CREATE INDEX IF NOT EXISTS idx_capa_anomaly_id ON capa_actions(anomaly_id);

-- GIN Trigram Index: Accelerates similarity(title, :query) > 0.4 without full table scans
CREATE INDEX IF NOT EXISTS idx_anomalies_title_trgm ON anomalies USING gin (title gin_trgm_ops);

-- ==============================================================================
-- Connection String Notice:
-- When connecting from Render to Supabase Free Tier, always use the Transaction
-- Pooler URL on port 6543 (pgbouncer=true) to prevent exhausting pool connections.
-- Example:
-- postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
-- ==============================================================================
