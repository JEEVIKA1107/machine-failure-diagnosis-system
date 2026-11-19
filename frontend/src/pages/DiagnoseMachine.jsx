import React, { useState, useEffect } from 'react';
import {
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Thermometer,
  Waves,
  Gauge,
  RotateCw,
  Cpu,
  Info,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { api } from '../services/api';

const PRESETS = [
  {
    name: 'Machine 1: Healthy Baseline',
    desc: 'Optimal operation across all sensors',
    expected: 'HEALTHY',
    values: {
      machine_id: 'MAC-001',
      machine_name: 'CNC Milling Center 01',
      temperature: 45.0,
      vibration: 'NORMAL',
      vibration_value: 1.2,
      pressure: 50.0,
      motor_speed: 1500.0,
      power_consumption: 8.5,
    },
  },
  {
    name: 'Machine 2: Thermal Overheating',
    desc: 'High temperature, normal vibration & pressure',
    expected: 'WARNING',
    values: {
      machine_id: 'MAC-002',
      machine_name: 'Hydraulic Forging Press 02',
      temperature: 95.0,
      vibration: 'NORMAL',
      vibration_value: 1.8,
      pressure: 50.0,
      motor_speed: 1500.0,
      power_consumption: 9.0,
    },
  },
  {
    name: 'Machine 3: Bearing Failure',
    desc: 'High temperature combined with high vibration',
    expected: 'CRITICAL',
    values: {
      machine_id: 'MAC-003',
      machine_name: 'Centrifugal Slurry Pump 03',
      temperature: 95.0,
      vibration: 'HIGH',
      vibration_value: 6.8,
      pressure: 50.0,
      motor_speed: 1500.0,
      power_consumption: 11.2,
    },
  },
  {
    name: 'Machine 4: Low-Pressure Fault',
    desc: 'Pressure below 20 PSI safety limit',
    expected: 'WARNING',
    values: {
      machine_id: 'MAC-004',
      machine_name: 'Industrial Air Compressor 04',
      temperature: 45.0,
      vibration: 'NORMAL',
      vibration_value: 1.1,
      pressure: 10.0,
      motor_speed: 1500.0,
      power_consumption: 7.8,
    },
  },
  {
    name: 'Machine 5: Multi-System Breakdown',
    desc: 'Severe cascade: 100°C, High Vib, 10 PSI, 400 RPM',
    expected: 'CRITICAL',
    values: {
      machine_id: 'MAC-005',
      machine_name: 'High-Pressure Gas Turbine 05',
      temperature: 100.0,
      vibration: 'HIGH',
      vibration_value: 8.4,
      pressure: 10.0,
      motor_speed: 400.0,
      power_consumption: 18.5,
    },
  },
];

export default function DiagnoseMachine({ preselectedMachine, onDiagnosisComplete }) {
  const [formData, setFormData] = useState({
    machine_id: 'MAC-001',
    machine_name: 'CNC Milling Center 01',
    temperature: 45.0,
    vibration: 'NORMAL',
    vibration_value: 1.2,
    pressure: 50.0,
    motor_speed: 1500.0,
    power_consumption: 8.5,
  });

  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [error, setError] = useState(null);
  const [showTrace, setShowTrace] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  // If a machine was passed from another view, prefill
  useEffect(() => {
    if (preselectedMachine) {
      const r = preselectedMachine.latest_reading || {};
      setFormData({
        machine_id: preselectedMachine.id,
        machine_name: preselectedMachine.machine_name,
        temperature: r.temperature ?? 50.0,
        vibration: r.vibration ?? 'NORMAL',
        vibration_value: r.vibration_value ?? 1.5,
        pressure: r.pressure ?? 45.0,
        motor_speed: r.motor_speed ?? 1500.0,
        power_consumption: r.power_consumption ?? 8.0,
      });
      setActivePresetIndex(-1);
    }
  }, [preselectedMachine]);

  const loadPreset = (preset, index) => {
    setFormData(preset.values);
    setActivePresetIndex(index);
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setActivePresetIndex(-1); // Custom
  };

  const executeDiagnosis = async (e) => {
    if (e) e.preventDefault();
    try {
      setDiagnosing(true);
      setError(null);

      const payload = {
        machine_id: formData.machine_id,
        machine_name: formData.machine_name,
        temperature: parseFloat(formData.temperature),
        vibration: formData.vibration,
        vibration_value: formData.vibration_value ? parseFloat(formData.vibration_value) : null,
        pressure: parseFloat(formData.pressure),
        motor_speed: parseFloat(formData.motor_speed),
        power_consumption: formData.power_consumption ? parseFloat(formData.power_consumption) : null,
      };

      const result = await api.diagnose(payload);
      setDiagnosisResult(result);
      if (onDiagnosisComplete) {
        onDiagnosisComplete(result);
      }
    } catch (err) {
      setError(err.message || 'Diagnosis execution failed. Ensure backend API is running.');
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              KNOWLEDGE-BASED INFERENCE
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono font-bold">
              FORWARD-CHAINING
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400" />
            Machine Failure Diagnostic Terminal
          </h1>
          <p className="text-sm text-slate-400">
            Submit sensor telemetry to evaluate against production expert maintenance rules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadPreset(PRESETS[0], 0)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form Defaults</span>
        </button>
      </div>

      {/* Quick Load Test Scenarios / Presets */}
      <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Quick Benchmark Scenarios (Required Cases)
          </span>
          <span className="text-[11px] font-mono text-slate-400">Select to auto-populate sensor inputs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p, idx)}
              type="button"
              className={`p-3 rounded-xl text-left transition flex flex-col justify-between border ${
                activePresetIndex === idx
                  ? 'bg-slate-800/90 border-cyan-500 shadow-glow-cyan'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">CASE {idx + 1}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      p.expected === 'HEALTHY'
                        ? 'bg-emerald-950 text-emerald-400'
                        : p.expected === 'WARNING'
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {p.expected}
                  </span>
                </div>
                <div className="text-xs font-bold text-white leading-tight mb-1">{p.name.split(':')[1]}</div>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Input Form (Left) & Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sensor Input Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Machine Telemetry Inputs
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">Active Sensor Stream</span>
          </div>

          <form onSubmit={executeDiagnosis} className="space-y-4 text-xs font-mono">
            {/* Machine Identification */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">MACHINE ID *</label>
                <input
                  type="text"
                  required
                  value={formData.machine_id}
                  onChange={(e) => handleInputChange('machine_id', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. MAC-001"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">MACHINE NAME</label>
                <input
                  type="text"
                  value={formData.machine_name}
                  onChange={(e) => handleInputChange('machine_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. CNC Milling"
                />
              </div>
            </div>

            {/* Temperature Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  TEMPERATURE (°C) *
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    formData.temperature > 85 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formData.temperature > 85 ? 'HIGH (>85°C)' : 'NORMAL'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  required
                  min="-20"
                  max="250"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 rounded-lg bg-slate-850 border border-slate-750 text-white text-sm font-bold focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="range"
                  min="20"
                  max="140"
                  step="1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 cursor-pointer"
                />
              </div>
              <div className="text-[10px] text-slate-500">Threshold: &gt; 85°C triggers Rule 1, 3, 6, 7</div>
            </div>

            {/* Vibration Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-blue-400" />
                  VIBRATION LEVEL *
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    formData.vibration === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formData.vibration}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange('vibration', 'NORMAL');
                    handleInputChange('vibration_value', 1.5);
                  }}
                  className={`py-2 rounded-lg font-bold transition border ${
                    formData.vibration === 'NORMAL'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700 shadow-glow-emerald'
                      : 'bg-slate-850 text-slate-400 border-slate-750 hover:text-white'
                  }`}
                >
                  NORMAL (Safe)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange('vibration', 'HIGH');
                    handleInputChange('vibration_value', 6.5);
                  }}
                  className={`py-2 rounded-lg font-bold transition border ${
                    formData.vibration === 'HIGH'
                      ? 'bg-rose-950/80 text-rose-400 border-rose-700 shadow-glow-rose animate-pulse'
                      : 'bg-slate-850 text-slate-400 border-slate-750 hover:text-white'
                  }`}
                >
                  HIGH (Anomaly)
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Quantitative: {formData.vibration_value || 1.5} mm/s</span>
                <span>Rule 2, 3, 7 condition</span>
              </div>
            </div>

            {/* Pressure Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  PRESSURE (PSI) *
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    formData.pressure < 20 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {formData.pressure < 20 ? 'LOW (<20 PSI)' : 'NORMAL'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="1"
                  required
                  min="0"
                  max="200"
                  value={formData.pressure}
                  onChange={(e) => handleInputChange('pressure', parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 rounded-lg bg-slate-850 border border-slate-750 text-white text-sm font-bold focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.pressure}
                  onChange={(e) => handleInputChange('pressure', parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 cursor-pointer"
                />
              </div>
              <div className="text-[10px] text-slate-500">Threshold: &lt; 20 PSI triggers Rule 4, 7</div>
            </div>

            {/* Motor Speed Input */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <RotateCw className="w-4 h-4 text-blue-400" />
                  MOTOR SPEED (RPM) *
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    formData.motor_speed < 500 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {formData.motor_speed < 500 ? 'LOW (<500 RPM)' : 'NORMAL'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="50"
                  required
                  min="0"
                  max="5000"
                  value={formData.motor_speed}
                  onChange={(e) => handleInputChange('motor_speed', parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 rounded-lg bg-slate-850 border border-slate-750 text-white text-sm font-bold focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={formData.motor_speed}
                  onChange={(e) => handleInputChange('motor_speed', parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 cursor-pointer"
                />
              </div>
              <div className="text-[10px] text-slate-500">Threshold: &lt; 500 RPM triggers Rule 5</div>
            </div>

            {/* Power Consumption (Optional) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                POWER CONSUMPTION (kW) <span className="text-slate-500">(Optional - Rule 6)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                placeholder="e.g. 15.0"
                value={formData.power_consumption || ''}
                onChange={(e) => handleInputChange('power_consumption', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="text-[10px] text-slate-500 mt-1">&gt; 12.0 kW with &gt; 85°C triggers Rule 6 (Overload)</div>
            </div>

            {/* Prominent Diagnose Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={diagnosing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:via-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm tracking-wider uppercase shadow-glow-cyan transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {diagnosing ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>EXECUTING INFERENCE ENGINE...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white animate-pulse" />
                    <span>DIAGNOSE MACHINE</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Diagnosis Results Display (Right Column) */}
        <div className="lg:col-span-7 space-y-5">
          {!diagnosisResult && !diagnosing ? (
            <div className="p-12 rounded-2xl bg-[#0b1120] border border-slate-800 text-center space-y-4 min-h-[480px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-center text-cyan-400">
                <Cpu className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Diagnostic Engine Standby</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Adjust the sensor telemetry values on the left or select a Benchmark Case, then click{' '}
                  <strong className="text-cyan-400">"DIAGNOSE MACHINE"</strong> to fire the forward-chaining rules.
                </p>
              </div>
            </div>
          ) : diagnosing ? (
            <div className="p-12 rounded-2xl bg-[#0b1120] border border-slate-800 text-center space-y-4 min-h-[480px] flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 animate-pulse">
                  <Zap className="w-8 h-8 fill-cyan-400" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 animate-ping opacity-25" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Evaluating Expert Production Rules...</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Validating physical bounds &bull; Deriving symbolic facts &bull; Matching production rules
                </p>
              </div>
            </div>
          ) : (
            /* Live Diagnosis Result View */
            <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-2xl space-y-6">
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      DIAGNOSIS REPORT #{diagnosisResult.id || 'NEW'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(diagnosisResult.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">
                    {diagnosisResult.machine_name} ({diagnosisResult.machine_id})
                  </h2>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-2xl text-xs font-black font-mono tracking-wider uppercase flex items-center gap-2 border ${
                      diagnosisResult.overall_status === 'HEALTHY'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-700 shadow-glow-emerald'
                        : diagnosisResult.overall_status === 'WARNING'
                        ? 'bg-amber-950 text-amber-400 border-amber-700 shadow-glow-amber'
                        : 'bg-rose-950 text-rose-400 border-rose-700 shadow-glow-rose animate-pulse'
                    }`}
                  >
                    {diagnosisResult.overall_status === 'HEALTHY' && <CheckCircle2 className="w-4 h-4" />}
                    {diagnosisResult.overall_status === 'WARNING' && <AlertTriangle className="w-4 h-4" />}
                    {diagnosisResult.overall_status === 'CRITICAL' && <XCircle className="w-4 h-4" />}
                    <span>STATUS: {diagnosisResult.overall_status}</span>
                  </span>
                </div>
              </div>

              {/* Confidence Score & Notice Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase">
                    Rule-Match Confidence Metric
                  </span>
                  <span className="text-lg font-black text-cyan-400">
                    {diagnosisResult.confidence_score}%
                  </span>
                </div>

                {/* Visual Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${diagnosisResult.confidence_score}%` }}
                    className={`h-full transition-all duration-700 ${
                      diagnosisResult.overall_status === 'HEALTHY'
                        ? 'bg-emerald-500'
                        : diagnosisResult.overall_status === 'WARNING'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {diagnosisResult.confidence_explanation}
                </p>

                {/* Important Disclaimer Required */}
                <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-[10px] text-slate-400">
                  <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{diagnosisResult.disclaimer}</span>
                </div>
              </div>

              {/* Detected Abnormalities (Facts) */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Detected Sensor Abnormalities ({diagnosisResult.abnormalities?.length || 0})
                </h3>
                {diagnosisResult.abnormalities && diagnosisResult.abnormalities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {diagnosisResult.abnormalities.map((abn, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/80 flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        {abn}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs font-mono text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All sensor readings operate within standard normal continuous limits.</span>
                  </div>
                )}
              </div>

              {/* Matched Expert Rules with Explanations */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Matched Expert Maintenance Rules ({diagnosisResult.matched_rules?.length || 0})
                </h3>

                {diagnosisResult.matched_rules && diagnosisResult.matched_rules.length > 0 ? (
                  <div className="space-y-3">
                    {diagnosisResult.matched_rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400">
                              [{rule.rule_id}]
                            </span>
                            <span className="text-xs font-bold text-white">{rule.rule_name}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              rule.severity === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {rule.severity}
                          </span>
                        </div>

                        {/* Condition Formula */}
                        <div className="p-2 rounded bg-slate-850 font-mono text-[11px] text-cyan-300">
                          <strong className="text-slate-400">IF:</strong> {rule.condition_description}
                        </div>

                        {/* Why it fired explanation */}
                        <div className="text-xs text-slate-300 leading-relaxed">
                          <strong className="text-slate-400 font-mono text-[11px]">EXPLANATION:</strong>{' '}
                          {rule.explanation}
                        </div>

                        {/* Conclusion */}
                        <div className="text-xs font-semibold text-rose-300">
                          <strong className="text-slate-400 font-mono text-[11px]">INFERRED CAUSE:</strong>{' '}
                          {rule.conclusion}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
                    Zero fault rules fired. System conditions adhere to OEM baseline specifications.
                  </div>
                )}
              </div>

              {/* Recommended Maintenance Actions */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Prescribed Maintenance Actions
                </h3>
                <div className="space-y-2">
                  {diagnosisResult.recommendations?.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inference Trace Accordion */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowTrace(!showTrace)}
                  className="w-full p-3.5 bg-slate-900 hover:bg-slate-850 text-xs font-mono text-slate-300 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Knowledge Engine Forward-Chaining Trace ({diagnosisResult.inference_trace?.length || 0} Steps)
                  </span>
                  {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTrace && (
                  <div className="p-4 bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-64 overflow-y-auto border-t border-slate-800">
                    {diagnosisResult.inference_trace?.map((step, idx) => (
                      <div
                        key={idx}
                        className={
                          step.includes('FIRED')
                            ? 'text-cyan-400 font-bold'
                            : step.includes('CRITICAL')
                            ? 'text-rose-400 font-bold'
                            : step.includes('INITIATED') || step.includes('CONCLUDED')
                            ? 'text-slate-400 italic'
                            : 'text-slate-300'
                        }
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
