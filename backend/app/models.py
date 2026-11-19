from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Machine(Base):
    __tablename__ = "machines"

    id = Column(String(50), primary_key=True, index=True)
    machine_name = Column(String(100), nullable=False)
    machine_type = Column(String(100), nullable=False)
    location = Column(String(100), default="Main Production Bay")
    status = Column(String(20), default="HEALTHY")  # HEALTHY, WARNING, CRITICAL, OFFLINE
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sensor_readings = relationship("SensorReading", back_populates="machine", cascade="all, delete-orphan", order_by="desc(SensorReading.recorded_at)")
    diagnoses = relationship("Diagnosis", back_populates="machine", cascade="all, delete-orphan", order_by="desc(Diagnosis.created_at)")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    machine_id = Column(String(50), ForeignKey("machines.id"), nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    vibration = Column(String(20), nullable=False)  # "NORMAL", "HIGH", "CRITICAL"
    vibration_value = Column(Float, nullable=True)  # in mm/s or g
    pressure = Column(Float, nullable=False)        # in PSI
    motor_speed = Column(Float, nullable=False)     # in RPM
    power_consumption = Column(Float, nullable=True) # in kW
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    machine = relationship("Machine", back_populates="sensor_readings")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    machine_id = Column(String(50), ForeignKey("machines.id"), nullable=True, index=True)
    machine_name = Column(String(100), nullable=True)
    overall_status = Column(String(20), nullable=False)  # "HEALTHY", "WARNING", "CRITICAL"
    severity = Column(String(20), nullable=False)        # "HEALTHY", "WARNING", "CRITICAL"
    detected_failures = Column(JSON, nullable=False)     # List of failure strings
    matched_rules = Column(JSON, nullable=False)         # List of matched rule detail dicts
    abnormalities = Column(JSON, nullable=False)         # List of abnormality strings
    recommendations = Column(JSON, nullable=False)       # List of recommendation strings
    confidence_score = Column(Float, nullable=False)     # 0.0 to 100.0%
    input_readings = Column(JSON, nullable=False)        # Snapshot of input sensor readings
    inference_trace = Column(JSON, nullable=True)        # Forward-chaining inference trace log
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    machine = relationship("Machine", back_populates="diagnoses")


class ExpertRuleModel(Base):
    __tablename__ = "expert_rules"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "RULE_001"
    rule_name = Column(String(150), nullable=False)
    conditions = Column(String(255), nullable=False)
    conclusion = Column(String(255), nullable=False)
    recommendation = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)          # "HEALTHY", "WARNING", "CRITICAL"
    priority = Column(Integer, default=50)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
