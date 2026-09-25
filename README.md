# SIH Anomaly Platform (AnomIQ)

An intelligent manufacturing anomaly detection, root-cause investigation, and AI-powered CAPA (Corrective and Preventive Action) review platform built for Smart India Hackathon.

---

## 🏗 Architecture & Machine Deployment

| Machine | Role | Directory | Key Technologies |
|---|---|---|---|
| **Machine 1 (Lenovo LOQ)** | Frontend Client | `frontend/` | React 19, Vite, TailwindCSS, TypeScript, Recharts, Lucide Icons |
| **Machine 2 (TUF)** | Backend Core & Database | `backend/` | FastAPI, SQLAlchemy, PostgreSQL / Supabase, Pydantic v2 |
| **Machine 3 (Vivobook)** | AI Agent & Analytics Engine | `backend/routers/ai_routes.py` | Google Gemini AI API, Trend Analytics |

---

## 📁 Repository Structure

```
sih-anomaly-platform/
├── .gitignore
├── README.md
│
├── frontend/                     <-- Machine 1 (Lenovo LOQ)
│   ├── index.html
│   ├── package.json
│   ├── vercel.json               (SPA fallback rule for Vercel)
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── .env                      (VITE_API_URL=http://localhost:8000)
│   └── src/
│       ├── main.tsx              (Entry point with ReactDOM.createRoot)
│       ├── App.tsx               (BrowserRouter & Routes definition)
│       ├── index.css             (Tailwind base directives)
│       ├── pages/
│       │   ├── Dashboard.tsx     (Overview metrics & recent issues)
│       │   ├── Anomalies.tsx     (Full table + Log Anomaly dialog)
│       │   ├── CapaReview.tsx    (Manager approval & AI CAPA view)
│       │   └── Analytics.tsx     (Recharts graphs)
│       ├── components/
│       │   ├── Navbar.tsx
│       │   └── CreateAnomalyModal.tsx
│       └── services/
│           └── api.ts            (Axios / fetch client using import.meta.env)
│
└── backend/                      <-- Machine 2 (TUF) & Machine 3 (Vivobook)
    ├── requirements.txt
    ├── .env                      (DATABASE_URL, GEMINI_API_KEY)
    ├── main.py                   (FastAPI entry point + CORS for :5173)
    ├── database.py               (Supabase PostgreSQL connection)
    ├── models.py                 (SQLAlchemy table models)
    ├── schemas.py                (Pydantic validation schemas)
    ├── seed.py                   (Inserts 20 manufacturing demo rows)
    └── routers/
        ├── crud_routes.py        (Standard issue logging & fetch)
        └── ai_routes.py          (Gemini CAPA generation & trend analysis)
```

---

## 🚀 Getting Started

### 1. Backend Setup (Machine 2 & Machine 3)

```bash
cd backend

# Create Virtual Environment
python -m venv venv

# Activate Virtual Environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Copy or edit .env with your PostgreSQL/Supabase database URL & Gemini API Key:
# DATABASE_URL=postgresql://user:password@host:5432/postgres
# GEMINI_API_KEY=your_gemini_api_key_here

# Seed Database with 20 Manufacturing Demo Records
python seed.py

# Launch FastAPI Server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend interactive docs available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install Dependencies
npm install

# Start Vite Development Server
npm run dev
```

Frontend UI available at: `http://localhost:5173`
