from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Machine, SensorReading, Diagnosis
from app.schemas import (
    MachineResponse,
    MachineCreate,
    MachineUpdate,
    SensorReadingBase,
    SensorReadingCreate,
    SensorReadingResponse,
)

router = APIRouter(prefix="/api/machines", tags=["Machines"])


@router.get("", response_model=List[MachineResponse])
def get_machines(db: Session = Depends(get_db)):
    """Fetch all registered machines along with their most recent sensor telemetry."""
    machines = db.query(Machine).order_by(Machine.id.asc()).all()
    results = []
    for m in machines:
        latest = (
            db.query(SensorReading)
            .filter(SensorReading.machine_id == m.id)
            .order_by(SensorReading.recorded_at.desc())
            .first()
        )
        res = MachineResponse(
            id=m.id,
            machine_name=m.machine_name,
            machine_type=m.machine_type,
            location=m.location,
            status=m.status,
            created_at=m.created_at,
            updated_at=m.updated_at,
            latest_reading=SensorReadingResponse.model_validate(latest) if latest else None,
        )
        results.append(res)
    return results


@router.post("", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(payload: MachineCreate, db: Session = Depends(get_db)):
    """Register a new industrial machine unit."""
    existing = db.query(Machine).filter(Machine.id == payload.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Machine with ID '{payload.id}' already exists.",
        )
    machine = Machine(
        id=payload.id,
        machine_name=payload.machine_name,
        machine_type=payload.machine_type,
        location=payload.location or "Main Production Bay",
        status=payload.status or "HEALTHY",
    )
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return MachineResponse(
        id=machine.id,
        machine_name=machine.machine_name,
        machine_type=machine.machine_type,
        location=machine.location,
        status=machine.status,
        created_at=machine.created_at,
        updated_at=machine.updated_at,
        latest_reading=None,
    )


@router.get("/{machine_id}")
def get_machine_detail(machine_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed machine configuration, sensor timeline, and past diagnoses."""
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine '{machine_id}' not found.")

    readings = (
        db.query(SensorReading)
        .filter(SensorReading.machine_id == machine_id)
        .order_by(SensorReading.recorded_at.desc())
        .limit(20)
        .all()
    )

    diagnoses = (
        db.query(Diagnosis)
        .filter(Diagnosis.machine_id == machine_id)
        .order_by(Diagnosis.created_at.desc())
        .limit(10)
        .all()
    )

    latest_reading = readings[0] if readings else None

    return {
        "id": machine.id,
        "machine_name": machine.machine_name,
        "machine_type": machine.machine_type,
        "location": machine.location,
        "status": machine.status,
        "created_at": machine.created_at,
        "updated_at": machine.updated_at,
        "latest_reading": SensorReadingResponse.model_validate(latest_reading) if latest_reading else None,
        "sensor_history": [SensorReadingResponse.model_validate(r) for r in readings],
        "diagnosis_history_count": len(diagnoses),
    }


@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine(machine_id: str, payload: MachineUpdate, db: Session = Depends(get_db)):
    """Update machine properties or operational status."""
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine '{machine_id}' not found.")

    if payload.machine_name is not None:
        machine.machine_name = payload.machine_name
    if payload.machine_type is not None:
        machine.machine_type = payload.machine_type
    if payload.location is not None:
        machine.location = payload.location
    if payload.status is not None:
        machine.status = payload.status

    db.commit()
    db.refresh(machine)

    latest = (
        db.query(SensorReading)
        .filter(SensorReading.machine_id == machine.id)
        .order_by(SensorReading.recorded_at.desc())
        .first()
    )
    return MachineResponse(
        id=machine.id,
        machine_name=machine.machine_name,
        machine_type=machine.machine_type,
        location=machine.location,
        status=machine.status,
        created_at=machine.created_at,
        updated_at=machine.updated_at,
        latest_reading=SensorReadingResponse.model_validate(latest) if latest else None,
    )


@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine(machine_id: str, db: Session = Depends(get_db)):
    """Delete a machine and its associated readings and diagnoses."""
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine '{machine_id}' not found.")
    db.delete(machine)
    db.commit()
    return None


@router.post("/{machine_id}/readings", response_model=SensorReadingResponse, status_code=status.HTTP_201_CREATED)
def record_sensor_reading(machine_id: str, payload: SensorReadingBase, db: Session = Depends(get_db)):
    """Append a fresh sensor reading stream for the specified machine."""
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine '{machine_id}' not found.")

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
    db.commit()
    db.refresh(reading)
    return reading
