import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

import database
import models
from routers import crud_routes, ai_routes, notification_routes

# Initialize database schema tables
try:
    models.Base.metadata.create_all(bind=database.engine)
    # Perform non-destructive column additions for legacy SQLite/PG schemas
    with database.engine.begin() as conn:
        for stmt in [
            "ALTER TABLE anomalies ADD COLUMN image_url VARCHAR(500)",
            "ALTER TABLE anomalies ADD COLUMN machine_line VARCHAR(150)",
            "ALTER TABLE anomalies ADD COLUMN industry VARCHAR(100)",
            "ALTER TABLE anomalies ADD COLUMN lot_or_batch_number VARCHAR(100)",
            "ALTER TABLE anomalies ADD COLUMN compliance_standard VARCHAR(100)",
            "ALTER TABLE anomalies ADD COLUMN reported_by VARCHAR(36)",
            "ALTER TABLE users ADD COLUMN active_industry VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP",
            "ALTER TABLE users ADD COLUMN updated_at TIMESTAMP",
            "ALTER TABLE capa_actions ADD COLUMN regulatory_impact TEXT",
        ]:
            try:
                conn.execute(text(stmt))
            except Exception:
                pass
except Exception as e:
    print(f"Notice: Database schema initialization encountered: {e}")

app = FastAPI(
    title="AnomIQ - Industrial Anomaly Platform API",
    description="Sistec Innovation Hackathon (SIH) 2026 Anomaly Detection and AI CAPA Management API",
    version="1.0.0"
)

# Parse origins from env, defaulting to local development URLs
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app",  # Permits all local ports & Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(crud_routes.router)
app.include_router(ai_routes.router)
app.include_router(notification_routes.router)

@app.get("/")
def root():
    return {
        "platform": "AnomIQ Sistec Innovation Hackathon (SIH) Anomaly Platform",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "uptime": "active",
        "service": "anomiq-backend"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
