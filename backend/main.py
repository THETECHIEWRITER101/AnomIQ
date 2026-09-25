import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import database
import models
from routers import crud_routes, ai_routes

# Initialize database schema tables
try:
    models.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"Notice: Database schema creation encountered: {e}")

app = FastAPI(
    title="AnomIQ - Industrial Anomaly Platform API",
    description="Smart India Hackathon 2026 Anomaly Detection and AI CAPA Management API",
    version="1.0.0"
)

# CORS configuration for Frontend Machine (Lenovo LOQ / Vite :5173) and local development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(crud_routes.router)
app.include_router(ai_routes.router)

@app.get("/")
def root():
    return {
        "platform": "AnomIQ SIH Anomaly Platform",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
