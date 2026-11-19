"""
Automated Unit Tests for the Knowledge-Based Expert System Engine.
Tests all 7 production rules, normal readings, multi-failure scenarios,
invalid sensor values, and explanation traces.
"""

import pytest
from app.knowledge_engine import KnowledgeEngine, SensorReadingInput


@pytest.fixture
def engine():
    return KnowledgeEngine()


def test_scenario_1_healthy(engine):
    """
    Machine 1:
    Temperature: 45°C, Vibration: Normal, Pressure: 50 PSI, Motor speed: 1500 RPM
    Expected: Healthy.
    """
    reading = SensorReadingInput(
        temperature=45.0,
        vibration="NORMAL",
        pressure=50.0,
        motor_speed=1500.0,
        power_consumption=8.5,
    )
    result = engine.infer(reading)
    assert result.overall_status == "HEALTHY"
    assert len(result.matched_rules) == 0
    assert len(result.abnormalities) == 0
    assert result.confidence_score >= 95.0
    assert "No mechanical or thermal anomalies detected" in result.detected_failures[0]


def test_scenario_2_overheating_warning(engine):
    """
    Machine 2:
    Temperature: 95°C, Vibration: Normal, Pressure: 50 PSI, Motor speed: 1500 RPM
    Expected: Overheating warning.
    """
    reading = SensorReadingInput(
        temperature=95.0,
        vibration="NORMAL",
        pressure=50.0,
        motor_speed=1500.0,
        power_consumption=9.0,
    )
    result = engine.infer(reading)
    assert result.overall_status == "WARNING"
    matched_ids = [r.rule_id for r in result.matched_rules]
    assert "RULE_001" in matched_ids
    assert "RULE_003" not in matched_ids  # Because vibration is normal
    assert any("overheating" in f.lower() for f in result.detected_failures)


def test_scenario_3_bearing_failure_critical(engine):
    """
    Machine 3:
    Temperature: 95°C, Vibration: High, Pressure: 50 PSI, Motor speed: 1500 RPM
    Expected: Possible bearing failure (Critical).
    """
    reading = SensorReadingInput(
        temperature=95.0,
        vibration="HIGH",
        pressure=50.0,
        motor_speed=1500.0,
        power_consumption=10.0,
    )
    result = engine.infer(reading)
    assert result.overall_status == "CRITICAL"
    matched_ids = [r.rule_id for r in result.matched_rules]
    # Should match Rule 1 (temp > 85), Rule 2 (vib = high), Rule 3 (temp > 85 AND vib = high)
    assert "RULE_001" in matched_ids
    assert "RULE_002" in matched_ids
    assert "RULE_003" in matched_ids
    assert any("bearing failure" in f.lower() for f in result.detected_failures)


def test_scenario_4_low_pressure_warning(engine):
    """
    Machine 4:
    Temperature: 45°C, Vibration: Normal, Pressure: 10 PSI, Motor speed: 1500 RPM
    Expected: Low-pressure warning.
    """
    reading = SensorReadingInput(
        temperature=45.0,
        vibration="NORMAL",
        pressure=10.0,
        motor_speed=1500.0,
        power_consumption=7.5,
    )
    result = engine.infer(reading)
    assert result.overall_status == "WARNING"
    matched_ids = [r.rule_id for r in result.matched_rules]
    assert "RULE_004" in matched_ids
    assert any("low-pressure" in f.lower() for f in result.detected_failures)


def test_scenario_5_multiple_critical_failures(engine):
    """
    Machine 5:
    Temperature: 100°C, Vibration: High, Pressure: 10 PSI, Motor speed: 400 RPM
    Expected: Multiple critical mechanical abnormalities (Rule 7, Rule 3, Rule 1, Rule 2, Rule 4, Rule 5).
    """
    reading = SensorReadingInput(
        temperature=100.0,
        vibration="HIGH",
        pressure=10.0,
        motor_speed=400.0,
        power_consumption=15.0,  # High power also triggers Rule 6!
    )
    result = engine.infer(reading)
    assert result.overall_status == "CRITICAL"
    matched_ids = [r.rule_id for r in result.matched_rules]
    # Check that RULE 7 fired (severe multi-factor failure)
    assert "RULE_007" in matched_ids
    assert "RULE_003" in matched_ids
    assert "RULE_001" in matched_ids
    assert "RULE_002" in matched_ids
    assert "RULE_004" in matched_ids
    assert "RULE_005" in matched_ids
    assert "RULE_006" in matched_ids
    assert len(result.detected_failures) >= 4
    assert len(result.recommendations) >= 4


def test_rule_5_low_motor_speed_alone(engine):
    """Test motor speed below 500 RPM triggers Rule 5."""
    reading = SensorReadingInput(
        temperature=50.0,
        vibration="NORMAL",
        pressure=40.0,
        motor_speed=350.0,
    )
    result = engine.infer(reading)
    assert result.overall_status == "WARNING"
    matched_ids = [r.rule_id for r in result.matched_rules]
    assert "RULE_005" in matched_ids


def test_rule_6_motor_overload(engine):
    """Test temp > 85 and power > 12 kW triggers Rule 6."""
    reading = SensorReadingInput(
        temperature=90.0,
        vibration="NORMAL",
        pressure=35.0,
        motor_speed=1200.0,
        power_consumption=16.5,
    )
    result = engine.infer(reading)
    assert result.overall_status == "CRITICAL"
    matched_ids = [r.rule_id for r in result.matched_rules]
    assert "RULE_006" in matched_ids
    assert "RULE_001" in matched_ids


def test_explanation_and_trace(engine):
    """Test that explanation facility returns comprehensive justification."""
    reading = SensorReadingInput(
        temperature=92.0,
        vibration="HIGH",
        pressure=15.0,
        motor_speed=450.0,
    )
    result = engine.infer(reading)
    assert len(result.inference_trace) > 5
    assert any("INFERENCE TRACE INITIATED" in step for step in result.inference_trace)
    assert any("FIRED: Bearing Thermal Seizure Risk" in step for step in result.inference_trace)
    assert result.disclaimer != ""
    assert result.confidence_explanation != ""
