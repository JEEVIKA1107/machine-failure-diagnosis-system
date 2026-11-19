from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Machine, Diagnosis
from app.schemas import DashboardStatsResponse, DiagnosisListItem

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes high-level aggregated operational and diagnosis KPI statistics."""
    total_machines = db.query(Machine).count()
    healthy_machines = db.query(Machine).filter(Machine.status == "HEALTHY").count()
    warning_machines = db.query(Machine).filter(Machine.status == "WARNING").count()
    critical_machines = db.query(Machine).filter(Machine.status == "CRITICAL").count()

    total_diagnoses = db.query(Diagnosis).count()

    # Recent abnormal diagnoses (failures)
    recent_failure_records = (
        db.query(Diagnosis)
        .filter(Diagnosis.severity.in_(["WARNING", "CRITICAL"]))
        .order_by(Diagnosis.created_at.desc())
        .limit(6)
        .all()
    )

    recent_failures = [
        {
            "id": d.id,
            "machine_id": d.machine_id,
            "machine_name": d.machine_name,
            "severity": d.severity,
            "detected_failures": d.detected_failures,
            "confidence_score": d.confidence_score,
            "created_at": d.created_at.isoformat(),
        }
        for d in recent_failure_records
    ]

    recent_all = (
        db.query(Diagnosis)
        .order_by(Diagnosis.created_at.desc())
        .limit(8)
        .all()
    )

    return DashboardStatsResponse(
        total_machines=total_machines,
        healthy_machines=healthy_machines,
        warning_machines=warning_machines,
        critical_machines=critical_machines,
        total_diagnoses=total_diagnoses,
        recent_failures=recent_failures,
        recent_diagnoses=[DiagnosisListItem.model_validate(d) for d in recent_all],
    )
