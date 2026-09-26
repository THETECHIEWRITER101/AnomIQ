# AnomIQ — Intelligent Manufacturing Anomaly & CAPA Platform

AnomIQ is a full-stack manufacturing intelligence platform that streamlines shopfloor anomaly detection, automates Root Cause Analysis (RCA), and accelerates Corrective and Preventive Action (CAPA) reviews using AI and deterministic reliability engineering rules.

---

## 🏭 The Problem

In high-throughput manufacturing plants, equipment downtime and quality deviations directly compromise operational efficiency, yield, and safety:

- **Slow Root Cause Analysis**: When a production line trips or a sensor exceeds safe operating thresholds (e.g. bearing vibration spikes, thermal runaway, hydraulic pressure drops), maintenance teams spend critical hours combing through raw logs or applying trial-and-error fixes.
- **Disconnected CAPA Workflows**: Corrective and preventive actions are frequently tracked across scattered spreadsheets or paper logs, making compliance tracking and recurring issue prevention difficult.
- **Delayed Plant-Wide Visibility**: Plant managers and reliability leads lack immediate, unified visibility into cross-line failure rates, MTTR (Mean Time to Resolution), and open incident bottlenecks.

---

## 💡 The Solution

AnomIQ bridges real-time shopfloor telemetry with structured 8D reliability engineering workflows:

1. **Centralized Incident Logging**: Line operators easily log equipment anomalies with precise sensor metrics, thresholds, machine IDs, production lines, and severity levels.
2. **AI-Powered Root Cause & CAPA Synthesis**: Integrated with **Google Gemini (`gemini-3.8-flash`)** alongside an industrial domain rule fallback, AnomIQ instantly generates structured 5-Why root cause analyses, immediate containment steps, and long-term preventive actions.
3. **Human-in-the-Loop Quality Approvals**: Quality engineers and plant managers review, approve, reject, or annotate proposed CAPA recommendations before implementation.
4. **Plant Analytics & Operational Health**: Interactive visual dashboards track active critical incidents, resolution trends, line health distributions, and severity breakdowns in real time.

---

## 🛠 Tech Stack & Architecture

Organized as a clean monorepo separating frontend presentation and backend intelligence:

```
AnomIQ/
├── README.md                      # Platform documentation
├── .gitignore                     # Git exclusion rules
│
├── frontend/                      # React 19 + Vite Single Page Application
│   ├── vercel.json                # Vercel deployment & SPA rewrites
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src/
│       ├── App.tsx                # Client application router
│       ├── pages/                 # Dashboard, Anomalies, CAPA Review & Analytics
│       └── services/api.ts        # Axios API client with dynamic backend url
│
└── backend/                       # FastAPI Python Microservice
    ├── requirements.txt           # Python dependencies
    ├── main.py                    # FastAPI server entry point & CORS configuration
    ├── database.py                # Database connection & SQLAlchemy engine
    ├── models.py                  # Database relational schema (Anomalies & CAPAs)
    ├── schemas.py                 # Pydantic data validation schemas
    ├── seed.py                    # Sample dataset seeder
    └── routers/
        ├── crud_routes.py         # Anomaly CRUD & status updates
        └── ai_routes.py           # Gemini 3.8 Flash AI engine & CAPA synthesis
```

### Core Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, Axios
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL / Supabase, SQLite (Local Fallback), Pydantic v2
- **AI & LLM**: Google Gemini API (`gemini-3.8-flash` via `google-genai` & `google-generativeai`) + Industrial Reliability Engine
- **Hosting / Cloud Ready**: Vercel (Frontend), Render (Backend), Supabase (Database)

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**
- *(Optional)* Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
- *(Optional)* Supabase / PostgreSQL database URI (defaults to local SQLite if unspecified)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up backend environment variables in `backend/.env`:
   ```env
   # Database (Leave as local postgres/sqlite or paste your Supabase URI)
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

   # Google Gemini API key for automated CAPA analysis
   GEMINI_API_KEY="your_gemini_api_key_here"

   # Allowed CORS origins
   CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

   # Server Port
   PORT=8000
   ```

5. *(Optional)* Run the Gemini API verification smoke test:
   ```bash
   python -c "import os; from dotenv import load_dotenv; from google import genai; load_dotenv(); client = genai.Client(api_key=os.getenv('GEMINI_API_KEY')); print(client.models.generate_content(model='gemini-3.8-flash', contents='Say ready').text)"
   ```

6. Seed sample manufacturing anomaly data:
   ```bash
   python seed.py
   ```

7. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - Server Base URL: `http://localhost:8000`
   - Interactive Swagger API Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment variables in `frontend/.env`:
   ```env
   VITE_API_URL="http://localhost:8000"
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/anomalies/` | Fetch all logged anomalies (filterable by line, status, severity) |
| `POST` | `/api/anomalies/` | Log a new equipment anomaly with telemetry |
| `GET` | `/api/anomalies/{id}` | Get detailed record for a specific anomaly and linked CAPA |
| `PATCH` | `/api/anomalies/{id}/status` | Update anomaly status (`OPEN`, `INVESTIGATING`, `RESOLVED`, `CLOSED`) |
| `DELETE`| `/api/anomalies/{id}` | Delete an anomaly record |
| `POST` | `/api/ai/capa/generate/{anomaly_id}` | Synthesize AI 8D Root Cause Analysis & CAPA recommendations (HTTP 201) |
| `POST` | `/api/ai/generate-capa/{anomaly_id}` | Legacy compatible route for CAPA generation |
| `GET` | `/api/ai/capa-reviews` | Fetch pending/reviewed CAPA action items |
| `PATCH` | `/api/ai/capa/{capa_id}/review` | Review & approve/reject CAPA (`APPROVED`, `REJECTED`, `IMPLEMENTED`) |
| `GET` | `/api/analytics/dashboard` | Retrieve high-level KPI card metrics and active alerts |
| `GET` | `/api/analytics/trends` | Fetch trend distributions for Recharts visual graphs |

---

## ☁️ Deployment Guide

### Deployment Overview
- **Database (Supabase)**: Paste your Supabase PostgreSQL URI into `DATABASE_URL` on Render/Local `.env`.
- **Backend (Render)**: Deploy `backend/` directory as a Web Service. Set start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`. The backend includes dynamic `CORS_ORIGINS` support and wildcard regex matching (`https://.*\.vercel\.app`) for all Vercel preview and production deployments.
- **Frontend (Vercel)**: Deploy `frontend/` directory to Vercel. Set `VITE_API_URL` to your live Render API URL.

---

## 📄 License

Distributed under the **MIT License**. Built for Sistec Innovation Hackathon (SIH) Manufacturing Intelligence Challenge.

