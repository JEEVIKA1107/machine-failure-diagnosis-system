from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Machine, SensorReading, Diagnosis
from app.schemas import (
    DiagnoseRequest,
    DiagnoseResponse,
    DiagnosisListItem,
    DiagnosisDetailResponse,
    MatchedRuleItem,
)
from app.knowledge_engine import KnowledgeEngine, SensorReadingInput

router = APIRouter(prefix="/api", tags=["Diagnosis Engine"])


@router.post("/diagnose", response_model=DiagnoseResponse, status_code=status.HTTP_200_OK)
def run_diagnosis(payload: DiagnoseRequest, db: Session = Depends(get_db)):
    """
    Core KBS Endpoint:
    Receives machine sensor telemetry, executes forward-chaining expert rules,
    persists the diagnosis in SQLite, updates machine status, and returns
    explanations and recommendations.
    """
    # Initialize engine with custom thresholds if provided
    engine = KnowledgeEngine(thresholds=payload.custom_thresholds)

    kbs_input = SensorReadingInput(
        temperature=payload.temperature,
        vibration=payload.vibration,
        vibration_value=payload.vibration_value,
        pressure=payload.pressure,
        motor_speed=payload.motor_speed,
        power_consumption=payload.power_consumption,
    )

    # Execute inference
    inference_result = engine.infer(kbs_input)

    # Look up or resolve machine metadata
    machine_id = payload.machine_id
    machine_name = payload.machine_name
    machine_obj = None

    if machine_id:
        machine_obj = db.query(Machine).filter(Machine.id == machine_id).first()
        if machine_obj:
            machine_name = machine_obj.machine_name
            # Update machine health status based on diagnosis
            machine_obj.status = inference_result.overall_status
            machine_obj.updated_at = datetime.utcnow()

            # Record telemetry in database
            reading = SensorReading(
                machine_id=machine_id,
                temperature=payload.temperature,
                vibration=payload.vibration,
                vibration_value=payload.vibration_value,
                pressure=payload.pressure,
                motor_speed=payload.motor_speed,
                power_consumption=payload.power_consumption,
            )
            db.add(reading)

    input_snapshot = {
        "temperature": payload.temperature,
        "vibration": payload.vibration,
        "vibration_value": payload.vibration_value,
        "pressure": payload.pressure,
        "motor_speed": payload.motor_speed,
        "power_consumption": payload.power_consumption,
    }

    matched_rules_data = [
        {
            "rule_id": m.rule_id,
            "rule_name": m.rule_name,
            "condition_description": m.condition_description,
            "conclusion": m.conclusion,
            "recommendation": m.recommendation,
            "severity": m.severity,
            "trigger_facts": m.trigger_facts,
            "explanation": m.explanation,
        }
        for m in inference_result.matched_rules
    ]

    # Persist diagnosis in SQLite
    diag_record = Diagnosis(
        machine_id=machine_id,
        machine_name=machine_name,
        overall_status=inference_result.overall_status,
        severity=inference_result.overall_status,
        detected_failures=inference_result.detected_failures,
        matched_rules=matched_rules_data,
        abnormalities=inference_result.abnormalities,
        recommendations=inference_result.recommendations,
        confidence_score=inference_result.confidence_score,
        input_readings=input_snapshot,
        inference_trace=inference_result.inference_trace,
        created_at=datetime.utcnow(),
    )
    db.add(diag_record)
    db.commit()
    db.refresh(diag_record)

    return DiagnoseResponse(
        id=diag_record.id,
        machine_id=machine_id,
        machine_name=machine_name,
        overall_status=inference_result.overall_status,
        severity=inference_result.overall_status,
        detected_failures=inference_result.detected_failures,
        matched_rules=[MatchedRuleItem(**r) for r in matched_rules_data],
        abnormalities=inference_result.abnormalities,
        recommendations=inference_result.recommendations,
        confidence_score=inference_result.confidence_score,
        confidence_explanation=inference_result.confidence_explanation,
        input_readings=input_snapshot,
        inference_trace=inference_result.inference_trace,
        facts_derived=inference_result.facts_derived,
        disclaimer=inference_result.disclaimer,
        created_at=diag_record.created_at,
    )


@router.get("/diagnoses", response_model=List[DiagnosisListItem])
def list_diagnoses(
    machine_id: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Retrieve historical machine diagnoses with filtering and search options."""
    query = db.query(Diagnosis)

    if machine_id:
        query = query.filter(Diagnosis.machine_id == machine_id)
    if severity and severity.upper() != "ALL":
        query = query.filter(Diagnosis.severity == severity.upper())
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Diagnosis.machine_id.ilike(search_fmt),
                Diagnosis.machine_name.ilike(search_fmt),
                Diagnosis.overall_status.ilike(search_fmt),
            )
        )

    records = query.order_by(Diagnosis.created_at.desc()).offset(offset).limit(limit).all()
    return records


@router.get("/diagnoses/{diagnosis_id}", response_model=DiagnosisDetailResponse)
def get_diagnosis_detail(diagnosis_id: int, db: Session = Depends(get_db)):
    """Fetch complete detail, trace, and recommendations for a single diagnosis."""
    diag = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()
    if not diag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnosis with ID {diagnosis_id} not found.",
        )
    return diag


@router.delete("/diagnoses/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diagnosis(diagnosis_id: int, db: Session = Depends(get_db)):
    """Delete a specific diagnosis from the historical log."""
    diag = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()
    if not diag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnosis with ID {diagnosis_id} not found.",
        )
    db.delete(diag)
    db.commit()
    return None


@router.delete("/diagnoses", status_code=status.HTTP_200_OK)
def clear_all_diagnoses(db: Session = Depends(get_db)):
    """Purge all diagnosis history logs (maintenance only)."""
    count = db.query(Diagnosis).delete()
    db.commit()
    return {"message": f"Successfully cleared {count} diagnosis records."}
