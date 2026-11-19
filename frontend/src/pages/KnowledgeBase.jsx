import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  RefreshCw,
  Save,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export default function KnowledgeBase({ setActiveTab }) {
  const [rules, setRules] = useState([]);
  const [thresholds, setThresholds] = useState({
    TEMP_HIGH_CELSIUS: 85.0,
    TEMP_CRITICAL_CELSIUS: 105.0,
    VIBRATION_HIGH_MMS: 4.5,
    PRESSURE_LOW_PSI: 20.0,
    MOTOR_SPEED_LOW_RPM: 500.0,
    POWER_HIGH_KW: 12.0,
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, thresholdsData] = await Promise.all([
        api.getRules(),
        api.getThresholds().catch(() => null),
      ]);
      setRules(rulesData);
      if (thresholdsData) {
        setThresholds(thresholdsData);
      }
    } catch (err) {
      console.error('Failed to load rules/thresholds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateThresholds(thresholds);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to update thresholds: ${err.message}`);
    }
  };

  const filteredRules = rules.filter(
    (r) => filterSeverity === 'ALL' || r.severity === filterSeverity
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              DOMAIN EXPERTISE
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-mono font-bold">
              IF-THEN PRODUCTION RULES
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Knowledge Base & Production Rulebase
          </h1>
          <p className="text-sm text-slate-400">
            Industrial expert heuristics, failure pattern inference logic, and configurable tolerances.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('diagnose')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold font-mono shadow-glow-cyan transition"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>TEST RULES IN DIAGNOSE</span>
        </button>
      </div>

      {/* OEM Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-800/40 text-slate-300 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white uppercase font-mono text-[11px]">
            Notice Regarding Equipment Tolerance Rules:
          </div>
          <p className="text-slate-400 leading-relaxed font-sans">
            The rules codified below represent industrial standard predictive maintenance heuristics.
            Because operating characteristics vary across equipment classes (such as centrifugal pumps,
            rotary compressors, and CNC spindles), threshold limits must be adjusted according to
            OEM maintenance handbooks and ISO 10816 mechanical vibration guidelines.
          </p>
        </div>
      </div>

      {/* Grid: Threshold Configurator & Rules Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Configurable Thresholds Box */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Configurable Safety Limits
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Live Memory</span>
          </div>

          <form onSubmit={handleThresholdSave} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">
                MAX TEMPERATURE THRESHOLD (°C)
              </label>
              <input
                type="number"
                step="1"
                value={thresholds.TEMP_HIGH_CELSIUS}
                onChange={(e) =>
                  setThresholds({ ...thresholds, TEMP_HIGH_CELSIUS: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Default: 85°C (Rule 1, 3, 6, 7)</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                MIN HYDRAULIC PRESSURE (PSI)
              </label>
              <input
                type="number"
                step="1"
                value={thresholds.PRESSURE_LOW_PSI}
                onChange={(e) =>
                  setThresholds({ ...thresholds, PRESSURE_LOW_PSI: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Default: 20 PSI (Rule 4, 7)</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                MIN MOTOR ROTATION SPEED (RPM)
              </label>
              <input
                type="number"
                step="50"
                value={thresholds.MOTOR_SPEED_LOW_RPM}
                onChange={(e) =>
                  setThresholds({ ...thresholds, MOTOR_SPEED_LOW_RPM: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Default: 500 RPM (Rule 5)</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                MAX POWER CONSUMPTION (kW)
              </label>
              <input
                type="number"
                step="0.5"
                value={thresholds.POWER_HIGH_KW}
                onChange={(e) =>
                  setThresholds({ ...thresholds, POWER_HIGH_KW: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Default: 12.0 kW (Rule 6)</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold border border-cyan-800/40 transition flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save New Thresholds</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-center text-[11px] flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Threshold limits updated in memory!</span>
              </div>
            )}
          </form>
        </div>

        {/* Expert Production Rules Explorer */}
        <div className="lg:col-span-8 space-y-4">
          {/* Rules Header & Filter */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0b1120] border border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                Active Rules Registry ({filteredRules.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              {['ALL', 'CRITICAL', 'WARNING'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterSeverity === sev
                      ? 'bg-cyan-500 text-white font-bold shadow-glow-cyan'
                      : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-750'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Rules Cards List */}
          <div className="space-y-4">
            {filteredRules.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-slate-750 transition shadow-xl space-y-3 relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${
                    r.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">[{r.id}]</span>
                      <h3 className="text-base font-bold text-white">{r.rule_name}</h3>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      r.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {r.severity}
                  </span>
                </div>

                {/* IF - THEN Code Block */}
                <div className="ml-2 space-y-1.5 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
                    <span className="font-bold text-slate-400 uppercase">IF (Condition): </span>
                    {r.conditions}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-300">
                    <span className="font-bold text-slate-400 uppercase">THEN (Diagnosis): </span>
                    {r.conclusion}
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="ml-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Recommended Maintenance Protocol:
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{r.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
