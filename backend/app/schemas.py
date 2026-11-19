from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# ==================== SENSOR READING SCHEMAS ====================

class SensorReadingBase(BaseModel):
    temperature: float = Field(..., description="Operating temperature in Celsius (°C)")
    vibration: str = Field(..., description="Vibration qualitative category (NORMAL, HIGH, CRITICAL)")
    vibration_value: Optional[float] = Field(None, description="Optional raw vibration measurement in mm/s or g")
    pressure: float = Field(..., description="System pressure in PSI")
    motor_speed: float = Field(..., description="Rotational motor speed in RPM")
    power_consumption: Optional[float] = Field(None, description="Power usage in kW")


class SensorReadingCreate(SensorReadingBase):
    machine_id: str


class SensorReadingResponse(SensorReadingBase):
    id: int
    machine_id: str
    recorded_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ==================== MACHINE SCHEMAS ====================

class MachineBase(BaseModel):
    id: str = Field(..., description="Unique machine identifier, e.g. 'MAC-001'")
    machine_name: str = Field(..., description="Human-readable machine name, e.g. 'CNC Milling Center'")
    machine_type: str = Field(..., description="Machine category, e.g. 'Milling Machine', 'Hydraulic Press'")
    location: Optional[str] = "Main Production Bay"


class MachineCreate(MachineBase):
    status: Optional[str] = "HEALTHY"


class MachineUpdate(BaseModel):
    machine_name: Optional[str] = None
    machine_type: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class MachineResponse(MachineBase):
    status: str
    created_at: datetime
    updated_at: datetime
    latest_reading: Optional[SensorReadingResponse] = None
    model_config = ConfigDict(from_attributes=True)


# ==================== DIAGNOSIS SCHEMAS ====================

class DiagnoseRequest(BaseModel):
    machine_id: Optional[str] = Field("MAC-001", description="Machine identifier")
    machine_name: Optional[str] = Field("Industrial Equipment", description="Machine name")
    temperature: float = Field(..., description="Operating temperature in °C", ge=-50, le=300)
    vibration: str = Field(..., description="Vibration level: NORMAL, HIGH, or CRITICAL")
    vibration_value: Optional[float] = Field(None, description="Measured vibration in mm/s")
    pressure: float = Field(..., description="Pressure in PSI", ge=0, le=1000)
    motor_speed: float = Field(..., description="Motor speed in RPM", ge=0, le=10000)
    power_consumption: Optional[float] = Field(None, description="Power consumption in kW", ge=0, le=500)
    custom_thresholds: Optional[Dict[str, float]] = Field(None, description="Optional custom threshold overrides")


class MatchedRuleItem(BaseModel):
    rule_id: str
    rule_name: str
    condition_description: str
    conclusion: str
    recommendation: str
    severity: str
    trigger_facts: List[str]
    explanation: str


class DiagnoseResponse(BaseModel):
    id: Optional[int] = None
    machine_id: Optional[str] = None
    machine_name: Optional[str] = None
    overall_status: str
    severity: str
    detected_failures: List[str]
    matched_rules: List[MatchedRuleItem]
    abnormalities: List[str]
    recommendations: List[str]
    confidence_score: float
    confidence_explanation: str
    input_readings: Dict[str, Any]
    inference_trace: List[str]
    facts_derived: List[str]
    disclaimer: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DiagnosisListItem(BaseModel):
    id: int
    machine_id: Optional[str] = None
    machine_name: Optional[str] = None
    overall_status: str
    severity: str
    detected_failures: List[str]
    confidence_score: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DiagnosisDetailResponse(BaseModel):
    id: int
    machine_id: Optional[str] = None
    machine_name: Optional[str] = None
    overall_status: str
    severity: str
    detected_failures: List[str]
    matched_rules: List[Any]
    abnormalities: List[str]
    recommendations: List[str]
    confidence_score: float
    input_readings: Dict[str, Any]
    inference_trace: Optional[List[str]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ==================== EXPERT RULE SCHEMAS ====================

class RuleResponse(BaseModel):
    id: str
    rule_name: str
    conditions: str
    conclusion: str
    recommendation: str
    severity: str
    priority: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class RuleUpdate(BaseModel):
    rule_name: Optional[str] = None
    conditions: Optional[str] = None
    conclusion: Optional[str] = None
    recommendation: Optional[str] = None
    severity: Optional[str] = None
    is_active: Optional[bool] = None


# ==================== DASHBOARD & REPORT SCHEMAS ====================

class DashboardStatsResponse(BaseModel):
    total_machines: int
    healthy_machines: int
    warning_machines: int
    critical_machines: int
    total_diagnoses: int
    recent_failures: List[Dict[str, Any]]
    recent_diagnoses: List[DiagnosisListItem]


class ReportsResponse(BaseModel):
    total_diagnoses: int
    health_distribution: Dict[str, int]
    common_failures: List[Dict[str, Any]]
    severity_distribution: List[Dict[str, Any]]
    diagnosis_trends: List[Dict[str, Any]]
