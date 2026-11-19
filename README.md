# AI-Assisted Machine Failure Diagnosis System (AeroPulse KBS)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite_&_SQLAlchemy-003B57?style=flat&logo=sqlite)](https://www.sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade **Knowledge-Based Expert System (KBS)** and predictive maintenance platform designed to evaluate industrial sensor telemetry, identify mechanical/thermal failure root causes, explain the forward-chaining reasoning, and prescribe actionable maintenance protocols.

---

## 1. Problem Statement

Industrial machinery (CNC milling centers, hydraulic forging presses, centrifugal slurry pumps, compressors, and co-generation gas turbines) experiences continuous mechanical, electrical, and thermal stresses. Sudden component failures lead to catastrophic factory downtime, severe safety hazards, and exorbitant emergency repair costs.

While modern IoT sensors capture telemetry streams (temperatures, vibration spectra, hydraulic pressures, and motor RPM), plant operators need **instantaneous, deterministic, and explainable failure diagnoses**. Unlike opaque black-box machine learning models, this **Knowledge-Based System (KBS)** implements codified production rules derived from maintenance domain expertise to provide clear causal explanations and prioritized maintenance actions.

---

## 2. Key Features

- **Forward-Chaining Inference Mechanism**: Deterministic evaluation of qualitative working memory facts against an agenda of active production rules without stopping at the first match.
- **Multi-Failure Identification**: Simultaneously captures cascading failures (e.g., severe mechanical breakdown combined with bearing failure, overheating, and pressure loss).
- **Rule-Match Confidence Scoring**: Transparent, deterministic calculation based on condition satisfaction percentage and severity weights.
- **Inference Explanation Facility**: Inspect step-by-step reasoning traces showing ingested inputs, derived facts, evaluated rules, and causal conclusions.
- **Fleet Telemetry Monitoring**: Real-time status cards, physical gauge readouts, and operational tolerances for monitored industrial assets.
- **Interactive Knowledge Base**: Full rule registry explorer with configurable thresholds (temperature, pressure, vibration, motor speed).
- **Audit History & SQLite Persistence**: Search, filter by severity, view snapshots of past telemetry, and purge audit logs.
- **Industrial Reporting & CSV Export**: Recharts-powered failure distribution, fleet health pie charts, time-series activity trends, and one-click CSV export.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom industrial dark-slate theme and glow accents
- **Visualizations**: Recharts (Area charts, Bar charts, Donut charts)
- **Icons**: Lucide React
- **Typography**: Inter & JetBrains Mono

### Backend
- **Framework**: Python 3.13, FastAPI (Asynchronous REST API)
- **Validation**: Pydantic v2
- **Database**: SQLite with SQLAlchemy ORM (WAL mode, persistent volume mount ready)
- **Server**: Uvicorn ASGI
- **Testing**: Pytest & HTTPX TestClient

---

## 4. Production Rulebase & Heuristics

The knowledge engine evaluates the following canonical expert rules (thresholds are configurable):

| Rule ID | Name | IF (Antecedent Conditions) | THEN (Inferred Failure Cause) | Recommended Action | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RULE_001** | Thermal Overheating | `temperature > 85°C` | Thermal dissipation breakdown | Clean radiator fins, check coolant circulation | **WARNING** |
| **RULE_002** | Bearing Wear Anomaly | `vibration = HIGH` | Bearing wear or mechanical unbalance | Perform acoustic vibration analysis, lubricate bearings | **WARNING** |
| **RULE_003** | Bearing Seizure Risk | `temperature > 85°C AND vibration = HIGH` | Bearing failure / thermal seizure risk | Emergency bearing replacement; inspect shaft alignment | **CRITICAL** |
| **RULE_004** | Low Hydraulic Pressure | `pressure < 20 PSI` | Hydraulic/pneumatic circuit pressure loss | Inspect fittings for leaks; verify pump pressure seals | **WARNING** |
| **RULE_005** | Motor Speed Deficiency | `motor_speed < 500 RPM` | Motor performance problem / drive fault | Inspect VFD parameters and mechanical belt tension | **WARNING** |
| **RULE_006** | Motor Overload | `temperature > 85°C AND power > 12 kW` | Motor electrical / mechanical overload | Reduce load immediately; test winding resistance | **CRITICAL** |
| **RULE_007** | Severe Multi-Factor Breakdown | `vibration = HIGH AND temperature > 85°C AND pressure < 20 PSI` | Severe cascading mechanical breakdown | **EMERGENCY SHUTDOWN**: Overhaul pump, bearings, and powertrain | **CRITICAL** |

*Note: In accordance with industrial standards, these rules are illustrative and configurable via the Knowledge Base tab to match specific OEM equipment handbooks and ISO 10816 standards.*

---

## 5. System Architecture & Forward Chaining Flow

```
[ Sensor Telemetry Stream ]
  (Temp, Vibration, Pressure, Speed, Power)
                 │
                 ▼
[ Input Validation & Bounds Check ]
                 │
                 ▼
[ Fact Abstraction Module ]
  Converts quantitative telemetry -> Symbolic facts
  (e.g., HIGH_TEMPERATURE, HIGH_VIBRATION, LOW_PRESSURE)
                 │
                 ▼
[ Forward-Chaining Inference Engine ]
  Evaluates all active production rules against working memory facts
                 │
                 ▼
[ Conflict Resolution & Accumulation ]
  Ranks multiple simultaneous matches by operational severity:
  CRITICAL > WARNING > HEALTHY
                 │
                 ▼
[ Explanation Facility & Synthesis ]
  Generates causal justifications, deterministic confidence score,
  and prescribed maintenance protocols
                 │
                 ▼
[ SQLite Persistence & REST API ] ──────► [ React Industrial Dashboard ]
```

---

## 6. Project Directory Structure

```
AI-ASSISTED MACHINE FAILURE DIAGNOSIS SYSTEM-KE/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, lifespan, routes
│   │   ├── database.py          # SQLAlchemy engine, session, SQLite config
│   │   ├── models.py            # Machine, SensorReading, Diagnosis, ExpertRule
│   │   ├── schemas.py           # Pydantic v2 validation models
│   │   ├── seed_data.py         # 5 sample machines, benchmark telemetry
│   │   ├── knowledge_engine.py  # Forward-chaining KBS inference engine
│   │   └── routes/
│   │       ├── machines.py      # Fleet CRUD & telemetry endpoints
│   │       ├── diagnose.py      # Core KBS diagnosis & history endpoints
│   │       ├── rules.py         # Knowledge base & threshold endpoints
│   │       ├── dashboard.py     # High-level operational stats
│   │       └── reports.py       # Analytics & CSV export endpoint
│   ├── tests/
│   │   ├── test_knowledge_engine.py  # Unit tests for all rules & benchmarks
│   │   └── test_api.py               # Integration tests for all endpoints
│   ├── pytest.ini
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI controls
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx    # Industrial sidebar, navigation & telemetry status
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # KPI stats, health breakdown, live charts
│   │   │   ├── MachineMonitoring.jsx # Fleet cards, live sensors & modal
│   │   │   ├── DiagnoseMachine.jsx   # Interactive diagnostic terminal & presets
│   │   │   ├── KnowledgeBase.jsx     # Production rules & threshold configurator
│   │   │   ├── DiagnosisHistory.jsx  # SQLite audit table, search & details
│   │   │   ├── Reports.jsx           # Recharts failure distribution & CSV export
│   │   │   └── AboutProject.jsx      # Architecture, KBS vs ML comparison
│   │   ├── services/
│   │   │   └── api.js           # REST API client
│   │   ├── App.jsx              # Main tab routing & machine prefill state
│   │   ├── main.jsx             # React DOM entry
│   │   └── index.css            # Tailwind & industrial theme styles
│   ├── package.json
│   ├── vite.config.js           # Vite dev proxy configuration
│   ├── tailwind.config.js       # Custom industrial palette
│   └── vercel.json              # Vercel SPA routing rewrites
│
├── .env.example                 # Environment variables template
├── .gitignore
├── render.yaml                  # Render Blueprint with persistent disk config
└── README.md
```

---

## 7. Local Installation & Setup

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ and npm
- Git

### A. Clone the Repository
```bash
git clone https://github.com/JEEVIKA1107/machine-failure-diagnosis-system.git
cd machine-failure-diagnosis-system
```

### B. Backend Setup
1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the automated test suite:
   ```bash
   pytest
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Root: `http://127.0.0.1:8000`
   - Interactive Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc Documentation: `http://127.0.0.1:8000/redoc`

### C. Frontend Setup
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web application at `http://localhost:5173`.

---

## 8. Five Benchmark Scenarios

The system includes pre-configured benchmark scenarios for immediate evaluation:

1. **Machine 1 (CNC Milling Center 01)**:
   - Readings: Temp `45°C`, Vibration `NORMAL`, Pressure `50 PSI`, Speed `1500 RPM`
   - Outcome: **HEALTHY** (Optimal operation across all sensors).
2. **Machine 2 (Hydraulic Forging Press 02)**:
   - Readings: Temp `95°C`, Vibration `NORMAL`, Pressure `50 PSI`, Speed `1500 RPM`
   - Outcome: **WARNING** (Fires Rule 1: Thermal Overheating).
3. **Machine 3 (Centrifugal Slurry Pump 03)**:
   - Readings: Temp `95°C`, Vibration `HIGH`, Pressure `50 PSI`, Speed `1500 RPM`
   - Outcome: **CRITICAL** (Fires Rule 1, 2, and 3: Bearing Seizure Risk).
4. **Machine 4 (Industrial Air Compressor 04)**:
   - Readings: Temp `45°C`, Vibration `NORMAL`, Pressure `10 PSI`, Speed `1500 RPM`
   - Outcome: **WARNING** (Fires Rule 4: Low-Pressure Problem).
5. **Machine 5 (High-Pressure Gas Turbine 05)**:
   - Readings: Temp `100°C`, Vibration `HIGH`, Pressure `10 PSI`, Speed `400 RPM`, Power `18.5 kW`
   - Outcome: **CRITICAL** (Fires Rule 7, 3, 6, 1, 2, 4, 5: Severe Multi-Factor Breakdown).

---

## 9. API Reference

### Health & Monitoring
- `GET /api/health` - System health, database connectivity status, and environment.
- `GET /api/dashboard/stats` - High-level metrics, machine counts, and recent alert logs.
- `GET /api/reports` - Aggregated failure distributions, trends, and severity counts.
- `GET /api/reports/export-csv` - Download complete CSV audit log.

### Machine Fleet Management
- `GET /api/machines` - List all monitored machines with latest sensor readings.
- `POST /api/machines` - Register new industrial equipment.
- `GET /api/machines/{id}` - Machine details, historical sensor timeline, and past diagnoses.
- `PUT /api/machines/{id}` - Update equipment parameters or operational status.
- `DELETE /api/machines/{id}` - Remove machine and cascade-delete associated logs.

### Knowledge-Based Diagnosis
- `POST /api/diagnose` - Core KBS endpoint. Evaluates sensor telemetry, asserts facts, fires rules, calculates confidence score, and returns explanations and recommendations.
- `GET /api/diagnoses` - Filter historical diagnoses by `machine_id`, `severity`, or search query.
- `GET /api/diagnoses/{id}` - Detailed diagnosis record with sensor snapshot and inference trace.
- `DELETE /api/diagnoses/{id}` - Remove a specific diagnosis entry from SQLite.

### Knowledge Base & Rule Management
- `GET /api/rules` - View active production rules and condition descriptions.
- `GET /api/rules/thresholds` - Retrieve active sensor threshold limits.
- `POST /api/rules/thresholds` - Dynamically adjust operational limits in memory.

---

## 10. Deployment Guide

### A. Backend Deployment (Render)
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Select your repository. Render automatically reads `render.yaml`.
4. Render mounts a persistent disk (`kbs-sqlite-storage` at `/opt/render/project/src/backend/data`) to prevent data loss across restarts.
5. Set the `FRONTEND_URL` environment variable to your deployed Vercel URL.

> **Production Storage Notice**: On Render, SQLite must be backed by a persistent disk mount. If using Render's free tier without disks, SQLite is ephemeral on container sleep. For large multi-region enterprise deployments, connecting a managed PostgreSQL database via `DATABASE_URL=postgresql://...` is recommended.

### B. Frontend Deployment (Vercel)
1. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and import your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com`
6. Deploy! Vercel handles automated preview and production deployments.

---

## 11. Automated Testing

The backend includes a comprehensive pytest suite covering all expert rules, single faults, cascading failures, sensor validation limits, and REST API integration.

```bash
# Run tests with coverage summary
pytest backend/tests/ -v
```

Output:
```
backend/tests/test_api.py ..........                                     [ 55%]
backend/tests/test_knowledge_engine.py ........                          [100%]
======================= 18 passed in 1.04s =======================
```

---

## 12. License & Author

Developed by **JEEVIKA S** (`jeevikasenthilkumars@gmail.com`).
Released under the [MIT License](LICENSE).
