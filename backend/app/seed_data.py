from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Machine, SensorReading, Diagnosis, ExpertRuleModel
from app.knowledge_engine import KnowledgeEngine, SensorReadingInput


SAMPLE_MACHINES = [
    {
        "id": "MAC-001",
        "machine_name": "CNC Milling Center 01",
        "machine_type": "5-Axis CNC Milling",
        "location": "Precision Machining Bay A",
        "status": "HEALTHY",
        "reading": {
            "temperature": 45.0,
            "vibration": "NORMAL",
            "vibration_value": 1.2,
            "pressure": 50.0,
            "motor_speed": 1500.0,
            "power_consumption": 8.5,
        },
    },
    {
        "id": "MAC-002",
        "machine_name": "Hydraulic Forging Press 02",
        "machine_type": "Hydraulic Press 500T",
        "location": "Heavy Forging Section",
        "status": "WARNING",
        "reading": {
            "temperature": 95.0,
            "vibration": "NORMAL",
            "vibration_value": 1.8,
            "pressure": 50.0,
            "motor_speed": 1500.0,
            "power_consumption": 9.0,
        },
    },
    {
        "id": "MAC-003",
        "machine_name": "Centrifugal Slurry Pump 03",
        "machine_type": "Centrifugal Slurry Pump",
        "location": "Cooling Circulation Yard",
        "status": "CRITICAL",
        "reading": {
            "temperature": 95.0,
            "vibration": "HIGH",
            "vibration_value": 6.8,
            "pressure": 50.0,
            "motor_speed": 1500.0,
            "power_consumption": 11.2,
        },
    },
    {
        "id": "MAC-004",
        "machine_name": "Industrial Air Compressor 04",
        "machine_type": "Rotary Screw Compressor",
        "location": "Central Pneumatics Utility",
        "status": "WARNING",
        "reading": {
            "temperature": 45.0,
            "vibration": "NORMAL",
            "vibration_value": 1.1,
            "pressure": 10.0,
            "motor_speed": 1500.0,
            "power_consumption": 7.8,
        },
    },
    {
        "id": "MAC-005",
        "machine_name": "High-Pressure Gas Turbine 05",
        "machine_type": "Co-Gen Gas Turbine",
        "location": "Energy Co-generation Plant",
        "status": "CRITICAL",
        "reading": {
            "temperature": 100.0,
            "vibration": "HIGH",
            "vibration_value": 8.4,
            "pressure": 10.0,
            "motor_speed": 400.0,
            "power_consumption": 18.5,
        },
    },
]


def seed_database(db: Session):
    """
    Seeds initial machines, expert rules, and sample diagnosis history if empty.
    """
    engine = KnowledgeEngine()

    # 1. Seed Expert Rules
    existing_rules_count = db.query(ExpertRuleModel).count()
    if existing_rules_count == 0:
        for rule in engine.rules:
            rule_entry = ExpertRuleModel(
                id=rule.rule_id,
                rule_name=rule.rule_name,
                conditions=rule.condition_description,
                conclusion=rule.conclusion,
                recommendation=rule.recommendation,
                severity=rule.severity,
                priority=rule.priority,
                is_active=True,
                created_at=datetime.utcnow() - timedelta(days=30),
            )
            db.add(rule_entry)
        db.commit()

    # 2. Seed Machines & Sensor Readings
    existing_machines = db.query(Machine).count()
    if existing_machines == 0:
        for m_data in SAMPLE_MACHINES:
            machine = Machine(
                id=m_data["id"],
                machine_name=m_data["machine_name"],
                machine_type=m_data["machine_type"],
                location=m_data["location"],
                status=m_data["status"],
                created_at=datetime.utcnow() - timedelta(days=15),
            )
            db.add(machine)
            db.flush()

            # Add sensor reading
            r_data = m_data["reading"]
            reading = SensorReading(
                machine_id=machine.id,
                temperature=r_data["temperature"],
                vibration=r_data["vibration"],
                vibration_value=r_data["vibration_value"],
                pressure=r_data["pressure"],
                motor_speed=r_data["motor_speed"],
                power_consumption=r_data["power_consumption"],
                recorded_at=datetime.utcnow() - timedelta(minutes=10),
            )
            db.add(reading)

            # Run real KBS inference to generate initial diagnosis history
            kbs_input = SensorReadingInput(
                temperature=r_data["temperature"],
                vibration=r_data["vibration"],
                vibration_value=r_data["vibration_value"],
                pressure=r_data["pressure"],
                motor_speed=r_data["motor_speed"],
                power_consumption=r_data["power_consumption"],
            )
            diagnosis_res = engine.infer(kbs_input)

            diag = Diagnosis(
                machine_id=machine.id,
                machine_name=machine.machine_name,
                overall_status=diagnosis_res.overall_status,
                severity=diagnosis_res.overall_status,
                detected_failures=diagnosis_res.detected_failures,
                matched_rules=[m.model_dump() for m in diagnosis_res.matched_rules],
                abnormalities=diagnosis_res.abnormalities,
                recommendations=diagnosis_res.recommendations,
                confidence_score=diagnosis_res.confidence_score,
                input_readings=r_data,
                inference_trace=diagnosis_res.inference_trace,
                created_at=datetime.utcnow() - timedelta(minutes=5),
            )
            db.add(diag)

        db.commit()
