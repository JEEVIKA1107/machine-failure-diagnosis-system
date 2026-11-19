import os
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal, get_db
from app.seed_data import seed_database
from app.routes import machines, diagnose, rules, dashboard, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)

    # Seed initial machines and expert rules
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="AI-Assisted Machine Failure Diagnosis System API",
    description=(
        "Production REST API and Knowledge-Based System (KBS) for automated industrial machine "
        "fault diagnosis, forward-chaining rule evaluation, and proactive maintenance planning."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
frontend_env = os.getenv("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
if frontend_env:
    allowed_origins.append(frontend_env.strip().rstrip("/"))

# Allow wildcard origins in development or when explicitly requested
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENVIRONMENT") != "strict_production" else allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(machines.router)
app.include_router(diagnose.router)
app.include_router(rules.router)
app.include_router(dashboard.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "system": "AI-Assisted Machine Failure Diagnosis KBS API",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "docs": "/docs",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for Render/uptime monitoring."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"error: {str(exc)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "environment": os.getenv("ENVIRONMENT", "development"),
        "timestamp": datetime.now().isoformat(),
    }
