# AnomIQ — Intelligent Manufacturing Anomaly & CAPA Platform

AnomIQ is a full-stack manufacturing intelligence platform that streamlines shopfloor anomaly detection, automates Root Cause Analysis (RCA), and accelerates Corrective and Preventive Action (CAPA) reviews.

---

## 🏭 The Problem

In high-throughput manufacturing plants, machine downtime and quality deviations directly hit operational efficiency and safety margins:

- **Slow Root Cause Analysis**: When a line trips or a sensor exceeds thresholds (e.g. bearing vibration, thermal runaway, hydraulic pressure drops), maintenance teams often spend hours manually combing through logs or applying trial-and-error fixes.
- **Disconnected CAPA Workflows**: Corrective and preventive actions are frequently tracked across scattered spreadsheets or paper logs, making compliance tracking and recurring issue prevention difficult.
- **Delayed Plant-Wide Visibility**: Operations leads lack immediate, unified visibility into cross-line failure rates, severity distributions, and resolution bottlenecks.

---

## 💡 The Solution

AnomIQ bridges real-time shopfloor telemetry with structured engineering workflows:

1. **Centralized Incident Logging**: Operators and line supervisors log equipment anomalies with precise sensor metrics, thresholds, line identifiers, and severity ratings.
2. **AI-Assisted Root Cause & CAPA Generation**: The backend integrates an AI reliability engineering engine (powered by Google Gemini with deterministic domain rule fallbacks) to perform instant 8D / 5-Why analysis, generating structured root causes, containment steps, and long-term preventive controls.
3. **Human-in-the-Loop Review & Approvals**: Quality managers review, approve, reject, or annotate proposed CAPA recommendations before implementation.
4. **Plant Analytics & Metrics**: Interactive dashboards track active incidents, resolution rates, line-by-line distribution, and severity breakdowns in real time.

---

## 🛠 Tech Stack & Monorepo Architecture

This repository is organized as a monorepo containing both the frontend client and backend services:

```
anomiq/
├── .gitignore
├── README.md
│
├── frontend/                     # React + Vite Client
│   ├── index.html
│   ├── package.json
│   ├── vercel.json               # SPA routing configuration
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src/
│       ├── main.tsx              # Application entry point
│       ├── App.tsx               # Client routes & navigation
│       ├── index.css             # Tailwind design system & tokens
│       ├── pages/
│       │   ├── Dashboard.tsx     # KPI cards, active alerts, line health
│       │   ├── Anomalies.tsx     # Incident table, filtering & logging modal
│       │   ├── CapaReview.tsx    # Manager CAPA approvals & AI actions
│       │   └── Analytics.tsx     # Recharts visual trends & breakdown
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── CreateAnomalyModal.tsx
│       │   └── ui/               # Reusable UI primitives
│       └── services/
│           └── api.ts            # Axios API client
│
└── backend/                      # FastAPI Python Service
    ├── requirements.txt
    ├── main.py                   # FastAPI app entry & CORS configuration
    ├── database.py               # Database engine & session management
    ├── models.py                 # SQLAlchemy relational schema
    ├── schemas.py                # Pydantic validation schemas
    ├── seed.py                   # Demo manufacturing dataset seeder
    └── routers/
        ├── crud_routes.py        # Anomaly CRUD & lifecycle status updates
        └── ai_routes.py          # Gemini AI CAPA generation & fallback engine
```

### Core Technologies

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Recharts, Lucide React, Axios
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL / Supabase, SQLite (local fallback), Pydantic v2
- **AI / LLM**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.5-flash`) + Industrial Reliability Rule Engine

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**
- *(Optional)* PostgreSQL or Supabase account (defaults to local SQLite if not configured)
- *(Optional)* Google Gemini API Key from Google AI Studio

---

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables:
Create a `.env` file inside `backend/`:

```env
# Database connection string (PostgreSQL/Supabase or leave blank for local SQLite)
DATABASE_URL="postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres"

# Google Gemini API key for automated CAPA analysis
GEMINI_API_KEY="your_gemini_api_key_here"

# Allowed CORS origins (comma-separated)
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

# Server Port
PORT=8000
```

Seed the database with sample manufacturing records:

```bash
python seed.py
```

Start the FastAPI development server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

In a separate terminal, navigate to the `frontend` directory:

```bash
cd frontend
```

Install Node dependencies:

```bash
npm install
```

Configure environment variables:
Create a `.env` file inside `frontend/` (or copy from `.env.example`):

```env
VITE_API_URL="http://localhost:8000"
```

Start the Vite dev server:

```bash
npm run dev
```

The web dashboard will be available at `http://localhost:5173`.

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/anomalies/` | List all anomalies with optional status/severity filters |
| `POST` | `/api/anomalies/` | Log a new machine anomaly with sensor metrics |
| `GET` | `/api/anomalies/{id}` | Retrieve anomaly details along with linked CAPA actions |
| `PATCH` | `/api/anomalies/{id}/status` | Update anomaly status (`OPEN`, `INVESTIGATING`, `RESOLVED`, `CLOSED`) |
| `POST` | `/api/ai/generate-capa/{anomaly_id}` | Generate AI root-cause analysis and CAPA recommendations |
| `PATCH` | `/api/ai/capa/{capa_id}/review` | Review & approve/reject CAPA (`APPROVED`, `REJECTED`, `IMPLEMENTED`) |
| `GET` | `/api/ai/analytics/summary` | Get aggregated plant metrics and trend distributions |

---

## 📄 License

MIT License. Built for Smart India Hackathon.
