"""
Knowledge-Based System (KBS) for Machine Failure Diagnosis.

This module implements a forward-chaining inference engine with an explanation facility
and rule-match confidence scoring. It operates on IF-THEN production rules representing
expert industrial maintenance knowledge.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class SensorReadingInput(BaseModel):
    temperature: float = Field(..., description="Operating temperature in Celsius (°C)")
    vibration: str = Field(..., description="Vibration level: 'NORMAL', 'HIGH', or numeric string")
    vibration_value: Optional[float] = Field(None, description="Optional raw vibration amplitude (mm/s or g)")
    pressure: float = Field(..., description="Pressure in PSI")
    motor_speed: float = Field(..., description="Motor rotation speed in RPM")
    power_consumption: Optional[float] = Field(None, description="Power consumption in kW (optional)")


class ExpertRule(BaseModel):
    rule_id: str
    rule_name: str
    condition_description: str
    conclusion: str
    recommendation: str
    severity: str  # "CRITICAL", "WARNING", "HEALTHY"
    priority: int  # Higher priority rules evaluated first / ranked higher


class MatchedRuleDetail(BaseModel):
    rule_id: str
    rule_name: str
    condition_description: str
    conclusion: str
    recommendation: str
    severity: str
    trigger_facts: List[str]
    explanation: str


class DiagnosisResult(BaseModel):
    overall_status: str  # "HEALTHY", "WARNING", "CRITICAL"
    detected_failures: List[str]
    matched_rules: List[MatchedRuleDetail]
    abnormalities: List[str]
    recommendations: List[str]
    confidence_score: float  # Transparent rule-match confidence percentage (0-100%)
    confidence_explanation: str
    inference_trace: List[str]
    facts_derived: List[str]
    disclaimer: str


# Default Configurable Thresholds (can be tuned per equipment OEM specifications)
DEFAULT_THRESHOLDS = {
    "TEMP_HIGH_CELSIUS": 85.0,
    "TEMP_CRITICAL_CELSIUS": 105.0,
    "VIBRATION_HIGH_MMS": 4.5,
    "PRESSURE_LOW_PSI": 20.0,
    "MOTOR_SPEED_LOW_RPM": 500.0,
    "POWER_HIGH_KW": 12.0,
}


class KnowledgeEngine:
    """
    Forward-chaining inference engine for machine failure diagnosis.
    """

    def __init__(self, thresholds: Optional[Dict[str, float]] = None):
        self.thresholds = dict(DEFAULT_THRESHOLDS)
        if thresholds:
            self.thresholds.update(thresholds)
        self.rules = self._initialize_expert_rules()

    def _initialize_expert_rules(self) -> List[ExpertRule]:
        """
        Defines the canonical expert maintenance production rules.
        """
        t_high = self.thresholds["TEMP_HIGH_CELSIUS"]
        p_low = self.thresholds["PRESSURE_LOW_PSI"]
        s_low = self.thresholds["MOTOR_SPEED_LOW_RPM"]
        pw_high = self.thresholds["POWER_HIGH_KW"]

        return [
            # RULE 7: Highest complexity composite critical rule
            ExpertRule(
                rule_id="RULE_007",
                rule_name="Severe Multi-Factor Mechanical Failure",
                condition_description=f"vibration = HIGH AND temperature > {t_high}°C AND pressure < {p_low} PSI",
                conclusion="Severe mechanical breakdown imminent. Multiple critical subsystems failing simultaneously.",
                recommendation="EMERGENCY SHUTDOWN: Immediately halt machine operations. Dispatch emergency maintenance team to inspect bearing assembly, hydraulic pump casing, and drive alignment before restarting.",
                severity="CRITICAL",
                priority=100,
            ),
            # RULE 3: Composite critical rule
            ExpertRule(
                rule_id="RULE_003",
                rule_name="Bearing Thermal Seizure Risk",
                condition_description=f"temperature > {t_high}°C AND vibration = HIGH",
                conclusion="Possible bearing failure / rapid bearing degradation with thermal seizure risk.",
                recommendation="Halt machine operation. Inspect bearing races and rolling elements for micro-spalling or lack of lubrication. Verify shaft alignment and replace worn bearings.",
                severity="CRITICAL",
                priority=90,
            ),
            # RULE 6: Overload critical rule
            ExpertRule(
                rule_id="RULE_006",
                rule_name="Motor Electrical / Mechanical Overload",
                condition_description=f"temperature > {t_high}°C AND power consumption > {pw_high} kW (HIGH)",
                conclusion="Possible motor overload. Stator or rotor experiencing excessive electromagnetic and thermal stress.",
                recommendation="Reduce driven mechanical load immediately. Inspect motor winding resistance, check thermal overload relays, and verify ventilation fans are operational.",
                severity="CRITICAL",
                priority=85,
            ),
            # RULE 1: Thermal warning
            ExpertRule(
                rule_id="RULE_001",
                rule_name="Thermal System Overheating",
                condition_description=f"temperature > {t_high}°C",
                conclusion="Possible overheating in thermal dissipation or cooling subsystem.",
                recommendation="Inspect cooling system, verify coolant fluid levels, clean radiator fins, and test cooling fan operation.",
                severity="WARNING",
                priority=70,
            ),
            # RULE 2: Mechanical vibration warning
            ExpertRule(
                rule_id="RULE_002",
                rule_name="Bearing Wear & Vibration Anomaly",
                condition_description="vibration = HIGH",
                conclusion="Possible bearing damage or mechanical imbalance.",
                recommendation="Conduct spectral acoustic vibration analysis, replenish bearing grease/lubricant, and check mounting bolt torque.",
                severity="WARNING",
                priority=65,
            ),
            # RULE 4: Hydraulic/Pneumatic pressure warning
            ExpertRule(
                rule_id="RULE_004",
                rule_name="Low Hydraulic / Pneumatic Pressure",
                condition_description=f"pressure < {p_low} PSI",
                conclusion="Possible low-pressure problem in hydraulic/pneumatic circuit.",
                recommendation="Check fluid levels, inspect supply pipes and fittings for micro-leaks, verify pressure regulator settings, and test hydraulic pump seals.",
                severity="WARNING",
                priority=60,
            ),
            # RULE 5: Motor rotation speed warning
            ExpertRule(
                rule_id="RULE_005",
                rule_name="Motor Speed Performance Deficiency",
                condition_description=f"motor speed < {s_low} RPM",
                conclusion="Possible motor performance problem or mechanical binding.",
                recommendation="Examine Variable Frequency Drive (VFD) output parameters, test supply voltage symmetry, and check mechanical coupling for slipping or binding.",
                severity="WARNING",
                priority=55,
            ),
        ]

    def validate_inputs(self, reading: SensorReadingInput) -> List[str]:
        """
        Validates telemetry values against physical operational boundaries.
        Returns a list of validation warnings or errors if any.
        """
        issues = []
        if reading.temperature < -50 or reading.temperature > 300:
            issues.append(f"Temperature value ({reading.temperature}°C) is outside physical sensor bounds (-50 to 300°C).")
        if reading.pressure < 0 or reading.pressure > 1000:
            issues.append(f"Pressure value ({reading.pressure} PSI) is outside expected gauge limits (0 to 1000 PSI).")
        if reading.motor_speed < 0 or reading.motor_speed > 10000:
            issues.append(f"Motor speed ({reading.motor_speed} RPM) is outside normal range (0 to 10000 RPM).")
        if reading.power_consumption is not None and (reading.power_consumption < 0 or reading.power_consumption > 500):
            issues.append(f"Power consumption ({reading.power_consumption} kW) is outside valid limits (0 to 500 kW).")
        return issues

    def derive_facts(self, reading: SensorReadingInput) -> Dict[str, Any]:
        """
        Converts quantitative and qualitative sensor readings into symbolic facts
        for working memory.
        """
        facts: Dict[str, Any] = {}
        fact_names: List[str] = []
        abnormalities: List[str] = []

        t_high = self.thresholds["TEMP_HIGH_CELSIUS"]
        p_low = self.thresholds["PRESSURE_LOW_PSI"]
        s_low = self.thresholds["MOTOR_SPEED_LOW_RPM"]
        pw_high = self.thresholds["POWER_HIGH_KW"]
        v_high_mms = self.thresholds["VIBRATION_HIGH_MMS"]

        # 1. Temperature evaluation
        if reading.temperature > t_high:
            facts["HIGH_TEMPERATURE"] = True
            fact_names.append(f"HIGH_TEMPERATURE ({reading.temperature:.1f}°C > {t_high:.1f}°C)")
            abnormalities.append(f"Elevated Temperature ({reading.temperature:.1f}°C)")
        else:
            facts["HIGH_TEMPERATURE"] = False
            facts["NORMAL_TEMPERATURE"] = True
            fact_names.append(f"NORMAL_TEMPERATURE ({reading.temperature:.1f}°C <= {t_high:.1f}°C)")

        # 2. Vibration evaluation
        # Handle string "HIGH", "CRITICAL", or numeric vibration_value
        is_high_vib = False
        vib_str = str(reading.vibration).strip().upper()
        if vib_str in ["HIGH", "CRITICAL", "DANGER", "ABNORMAL"]:
            is_high_vib = True
        elif reading.vibration_value is not None and reading.vibration_value >= v_high_mms:
            is_high_vib = True
        elif vib_str.replace(".", "", 1).isdigit():
            try:
                if float(vib_str) >= v_high_mms:
                    is_high_vib = True
            except ValueError:
                pass

        if is_high_vib:
            facts["HIGH_VIBRATION"] = True
            vib_disp = f"{reading.vibration_value} mm/s" if reading.vibration_value is not None else reading.vibration
            fact_names.append(f"HIGH_VIBRATION ({vib_disp})")
            abnormalities.append(f"Excessive Vibration Level ({vib_disp})")
        else:
            facts["HIGH_VIBRATION"] = False
            facts["NORMAL_VIBRATION"] = True
            fact_names.append("NORMAL_VIBRATION")

        # 3. Pressure evaluation
        if reading.pressure < p_low:
            facts["LOW_PRESSURE"] = True
            fact_names.append(f"LOW_PRESSURE ({reading.pressure:.1f} PSI < {p_low:.1f} PSI)")
            abnormalities.append(f"Low System Pressure ({reading.pressure:.1f} PSI)")
        else:
            facts["LOW_PRESSURE"] = False
            facts["NORMAL_PRESSURE"] = True
            fact_names.append(f"NORMAL_PRESSURE ({reading.pressure:.1f} PSI >= {p_low:.1f} PSI)")

        # 4. Motor speed evaluation
        if reading.motor_speed < s_low:
            facts["LOW_MOTOR_SPEED"] = True
            fact_names.append(f"LOW_MOTOR_SPEED ({reading.motor_speed:.0f} RPM < {s_low:.0f} RPM)")
            abnormalities.append(f"Low Motor Speed ({reading.motor_speed:.0f} RPM)")
        else:
            facts["LOW_MOTOR_SPEED"] = False
            facts["NORMAL_MOTOR_SPEED"] = True
            fact_names.append(f"NORMAL_MOTOR_SPEED ({reading.motor_speed:.0f} RPM >= {s_low:.0f} RPM)")

        # 5. Power consumption evaluation
        if reading.power_consumption is not None and reading.power_consumption > pw_high:
            facts["HIGH_POWER"] = True
            fact_names.append(f"HIGH_POWER ({reading.power_consumption:.1f} kW > {pw_high:.1f} kW)")
            abnormalities.append(f"High Power Consumption ({reading.power_consumption:.1f} kW)")
        else:
            facts["HIGH_POWER"] = False
            if reading.power_consumption is not None:
                facts["NORMAL_POWER"] = True
                fact_names.append(f"NORMAL_POWER ({reading.power_consumption:.1f} kW <= {pw_high:.1f} kW)")

        return {
            "boolean_facts": facts,
            "fact_names": fact_names,
            "abnormalities": abnormalities,
        }

    def infer(self, reading: SensorReadingInput) -> DiagnosisResult:
        """
        Executes forward chaining across all active production rules.
        Evaluates facts in working memory, matches antecedent conditions,
        generates detailed explanations, and computes the rule-match score.
        """
        trace: List[str] = []
        trace.append("=== INFERENCE TRACE INITIATED ===")
        trace.append(f"Step 1: Ingested sensor telemetry -> Temp: {reading.temperature}°C, Vibration: {reading.vibration}, Pressure: {reading.pressure} PSI, Speed: {reading.motor_speed} RPM, Power: {reading.power_consumption} kW")

        # Step 1: Input Validation
        validation_issues = self.validate_inputs(reading)
        for issue in validation_issues:
            trace.append(f"Validation Notice: {issue}")

        # Step 2: Fact Abstraction
        derived = self.derive_facts(reading)
        facts = derived["boolean_facts"]
        fact_names = derived["fact_names"]
        abnormalities = derived["abnormalities"]

        trace.append(f"Step 2: Fact abstraction completed. Derived {len(fact_names)} working memory facts:")
        for fn in fact_names:
            trace.append(f"  • Fact: {fn}")

        matched_rules_details: List[MatchedRuleDetail] = []
        detected_failures: List[str] = []
        recommendations: List[str] = []

        trace.append("Step 3: Forward chaining across Expert Production Rulebase:")

        # Helper condition checkers for each rule
        high_temp = facts.get("HIGH_TEMPERATURE", False)
        high_vib = facts.get("HIGH_VIBRATION", False)
        low_press = facts.get("LOW_PRESSURE", False)
        low_speed = facts.get("LOW_MOTOR_SPEED", False)
        high_power = facts.get("HIGH_POWER", False)

        # Evaluate rules
        for rule in self.rules:
            fired = False
            triggering_facts = []
            explanation = ""

            if rule.rule_id == "RULE_007":
                # vibration = HIGH AND temperature > 85°C AND pressure < 20 PSI
                if high_vib and high_temp and low_press:
                    fired = True
                    triggering_facts = [
                        f"Vibration is HIGH ({reading.vibration})",
                        f"Temperature ({reading.temperature}°C) exceeds threshold ({self.thresholds['TEMP_HIGH_CELSIUS']}°C)",
                        f"Pressure ({reading.pressure} PSI) is below safety limit ({self.thresholds['PRESSURE_LOW_PSI']} PSI)",
                    ]
                    explanation = f"Fired because vibration is high, temperature is {reading.temperature}°C (> {self.thresholds['TEMP_HIGH_CELSIUS']}°C), and pressure is {reading.pressure} PSI (< {self.thresholds['PRESSURE_LOW_PSI']} PSI). Indicates simultaneous cascading multi-system failure."

            elif rule.rule_id == "RULE_003":
                # temperature > 85°C AND vibration = HIGH
                if high_temp and high_vib:
                    fired = True
                    triggering_facts = [
                        f"Temperature ({reading.temperature}°C) > {self.thresholds['TEMP_HIGH_CELSIUS']}°C",
                        f"Vibration is HIGH ({reading.vibration})",
                    ]
                    explanation = f"Fired because elevated temperature ({reading.temperature}°C) combined with high vibration indicates friction, misalignment, or bearing degradation with severe thermal seizure hazard."

            elif rule.rule_id == "RULE_006":
                # temperature > 85°C AND power consumption is HIGH
                if high_temp and high_power:
                    fired = True
                    triggering_facts = [
                        f"Temperature ({reading.temperature}°C) > {self.thresholds['TEMP_HIGH_CELSIUS']}°C",
                        f"Power consumption ({reading.power_consumption} kW) > {self.thresholds['POWER_HIGH_KW']} kW",
                    ]
                    explanation = f"Fired because machine is operating at {reading.temperature}°C while consuming {reading.power_consumption} kW, exceeding the {self.thresholds['POWER_HIGH_KW']} kW threshold. Indicates excessive electrical or mechanical load on the motor."

            elif rule.rule_id == "RULE_001":
                # temperature > 85°C
                if high_temp:
                    fired = True
                    triggering_facts = [f"Temperature ({reading.temperature}°C) > {self.thresholds['TEMP_HIGH_CELSIUS']}°C"]
                    explanation = f"Fired because operating temperature of {reading.temperature}°C exceeds safe continuous threshold of {self.thresholds['TEMP_HIGH_CELSIUS']}°C. Cooling efficiency is compromised."

            elif rule.rule_id == "RULE_002":
                # vibration = HIGH
                if high_vib:
                    fired = True
                    triggering_facts = [f"Vibration level is HIGH ({reading.vibration})"]
                    explanation = f"Fired because measured vibration is classified as HIGH. Mechanical looseness, unbalance, or rolling element bearing distress detected."

            elif rule.rule_id == "RULE_004":
                # pressure < 20 PSI
                if low_press:
                    fired = True
                    triggering_facts = [f"Pressure ({reading.pressure} PSI) < {self.thresholds['PRESSURE_LOW_PSI']} PSI"]
                    explanation = f"Fired because system pressure ({reading.pressure} PSI) dropped below minimum operational baseline ({self.thresholds['PRESSURE_LOW_PSI']} PSI). Hydraulic/pneumatic loss."

            elif rule.rule_id == "RULE_005":
                # motor speed < 500 RPM
                if low_speed:
                    fired = True
                    triggering_facts = [f"Motor speed ({reading.motor_speed} RPM) < {self.thresholds['MOTOR_SPEED_LOW_RPM']} RPM"]
                    explanation = f"Fired because rotational speed ({reading.motor_speed} RPM) is beneath minimum nominal operational threshold ({self.thresholds['MOTOR_SPEED_LOW_RPM']} RPM)."

            if fired:
                trace.append(f"  ✓ [{rule.rule_id}] FIRED: {rule.rule_name} -> Conclusion: {rule.conclusion}")
                matched_rules_details.append(
                    MatchedRuleDetail(
                        rule_id=rule.rule_id,
                        rule_name=rule.rule_name,
                        condition_description=rule.condition_description,
                        conclusion=rule.conclusion,
                        recommendation=rule.recommendation,
                        severity=rule.severity,
                        trigger_facts=triggering_facts,
                        explanation=explanation,
                    )
                )
                if rule.conclusion not in detected_failures:
                    detected_failures.append(rule.conclusion)
                if rule.recommendation not in recommendations:
                    recommendations.append(rule.recommendation)
            else:
                trace.append(f"  ✗ [{rule.rule_id}] EVALUATED: Antecedent conditions not met.")

        # Step 4: Overall Status & Confidence Score Synthesis
        trace.append("Step 4: Synthesizing overall status and transparent rule-match confidence score.")

        if not matched_rules_details:
            overall_status = "HEALTHY"
            detected_failures = ["No mechanical or thermal anomalies detected. System operating within optimal OEM tolerances."]
            recommendations = [
                "Continue standard periodic maintenance and scheduled lubrication intervals.",
                "Maintain continuous sensor telemetry monitoring.",
            ]
            confidence_score = 98.5
            confidence_explanation = "Baseline optimal health: 100% of tested sensor parameters reside safely within acceptable operating windows. Zero fault rules fired."
            trace.append("Result: Machine health verified as NORMAL / HEALTHY.")
        else:
            has_critical = any(r.severity == "CRITICAL" for r in matched_rules_details)
            if has_critical:
                overall_status = "CRITICAL"
                # For critical diagnoses, confidence score reflects the deterministic strength
                # of multiple matching abnormal conditions (base 88% + up to 10% for multi-rule matches)
                match_weight = min(len(matched_rules_details) * 2.5, 10.0)
                confidence_score = round(88.0 + match_weight, 1)
                confidence_explanation = (
                    f"CRITICAL diagnosis determined by {len(matched_rules_details)} matching expert rule(s) "
                    f"including high-severity mechanical/thermal safety violations. "
                    f"Rule match certainty: {confidence_score}% based on full antecedent satisfaction."
                )
            else:
                overall_status = "WARNING"
                match_weight = min(len(matched_rules_details) * 4.0, 15.0)
                confidence_score = round(75.0 + match_weight, 1)
                confidence_explanation = (
                    f"WARNING diagnosis determined by {len(matched_rules_details)} advisory rule match(es). "
                    f"Rule match score: {confidence_score}% condition fulfillment."
                )

        trace.append(f"Final Outcome: Status={overall_status}, Confidence={confidence_score}%")
        trace.append("=== INFERENCE TRACE CONCLUDED ===")

        disclaimer = (
            "NOTICE: The confidence score is a deterministic rule-match evaluation score reflecting "
            "exact satisfaction of predefined expert production rules. It is not an empirical Bayesian or "
            "statistically calibrated probability distribution. Always verify with certified plant maintenance technicians."
        )

        return DiagnosisResult(
            overall_status=overall_status,
            detected_failures=detected_failures,
            matched_rules=matched_rules_details,
            abnormalities=abnormalities,
            recommendations=recommendations,
            confidence_score=confidence_score,
            confidence_explanation=confidence_explanation,
            inference_trace=trace,
            facts_derived=fact_names,
            disclaimer=disclaimer,
        )


# Global singleton instance with default thresholds
knowledge_engine = KnowledgeEngine()
