import csv
import io
from collections import Counter
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Machine, Diagnosis
from app.schemas import ReportsResponse

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])


@router.get("", response_model=ReportsResponse)
def get_reports_data(db: Session = Depends(get_db)):
    """Computes comprehensive aggregated analytics for reporting and Recharts visualization."""
    total_diagnoses = db.query(Diagnosis).count()

    # Machine health distribution
    healthy_machines = db.query(Machine).filter(Machine.status == "HEALTHY").count()
    warning_machines = db.query(Machine).filter(Machine.status == "WARNING").count()
    critical_machines = db.query(Machine).filter(Machine.status == "CRITICAL").count()

    health_dist = {
        "HEALTHY": healthy_machines,
        "WARNING": warning_machines,
        "CRITICAL": critical_machines,
    }

    # Fetch all diagnoses to analyze patterns
    all_diagnoses = db.query(Diagnosis).order_by(Diagnosis.created_at.asc()).all()

    # Failure counts
    failure_counter = Counter()
    severity_counter = Counter({"HEALTHY": 0, "WARNING": 0, "CRITICAL": 0})
    date_counter = Counter()

    for d in all_diagnoses:
        severity_counter[d.severity] += 1
        d_date = d.created_at.strftime("%Y-%m-%d")
        date_counter[d_date] += 1

        if d.detected_failures:
            for f in d.detected_failures:
                # Group standard failure keys
                f_clean = f
                if "overheating" in f.lower():
                    f_clean = "Thermal Overheating"
                elif "bearing failure" in f.lower():
                    f_clean = "Bearing Failure"
                elif "bearing damage" in f.lower():
                    f_clean = "Bearing Wear / Imbalance"
                elif "low-pressure" in f.lower():
                    f_clean = "Low Hydraulic / Pneumatic Pressure"
                elif "performance problem" in f.lower() or "motor speed" in f.lower():
                    f_clean = "Motor Speed Deficiency"
                elif "motor overload" in f.lower():
                    f_clean = "Motor Electrical Overload"
                elif "severe mechanical" in f.lower():
                    f_clean = "Severe Multi-Factor Breakdown"
                elif "optimal" in f.lower() or "no mechanical" in f.lower():
                    f_clean = "Normal Optimal Operation"

                failure_counter[f_clean] += 1

    common_failures = [
        {"failure": name, "count": count}
        for name, count in failure_counter.most_common(10)
    ]

    severity_dist = [
        {"severity": "Healthy", "count": severity_counter["HEALTHY"], "color": "#10B981"},
        {"severity": "Warning", "count": severity_counter["WARNING"], "color": "#F59E0B"},
        {"severity": "Critical", "count": severity_counter["CRITICAL"], "color": "#EF4444"},
    ]

    diagnosis_trends = [
        {"date": d_str, "diagnoses": count}
        for d_str, count in sorted(date_counter.items())
    ]
    if not diagnosis_trends:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        diagnosis_trends = [{"date": today_str, "diagnoses": total_diagnoses}]

    return ReportsResponse(
        total_diagnoses=total_diagnoses,
        health_distribution=health_dist,
        common_failures=common_failures,
        severity_distribution=severity_dist,
        diagnosis_trends=diagnosis_trends,
    )


@router.get("/export-csv")
def export_diagnoses_csv(db: Session = Depends(get_db)):
    """Generates and downloads a complete CSV export of all diagnosis history."""
    diagnoses = db.query(Diagnosis).order_by(Diagnosis.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # CSV Header
    writer.writerow([
        "Diagnosis ID",
        "Timestamp (UTC)",
        "Machine ID",
        "Machine Name",
        "Overall Status",
        "Confidence Score (%)",
        "Temperature (°C)",
        "Vibration",
        "Pressure (PSI)",
        "Motor Speed (RPM)",
        "Power (kW)",
        "Detected Failures",
        "Recommendations",
    ])

    for d in diagnoses:
        readings = d.input_readings or {}
        failures_str = "; ".join(d.detected_failures) if d.detected_failures else "None"
        recs_str = "; ".join(d.recommendations) if d.recommendations else "None"

        writer.writerow([
            d.id,
            d.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            d.machine_id or "N/A",
            d.machine_name or "N/A",
            d.overall_status,
            f"{d.confidence_score:.1f}",
            readings.get("temperature", ""),
            readings.get("vibration", ""),
            readings.get("pressure", ""),
            readings.get("motor_speed", ""),
            readings.get("power_consumption", ""),
            failures_str,
            recs_str,
        ])

    output.seek(0)
    filename = f"machine_diagnoses_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
