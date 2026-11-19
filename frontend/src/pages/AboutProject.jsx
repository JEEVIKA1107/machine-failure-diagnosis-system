import React from 'react';
import {
  Info,
  Cpu,
  Zap,
  BookOpen,
  ShieldCheck,
  GitBranch,
  Server,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Code2,
  Terminal,
} from 'lucide-react';

export default function AboutProject({ setActiveTab }) {
  const steps = [
    {
      num: '01',
      title: 'Sensor Telemetry Ingestion',
      desc: 'Raw quantitative measurements (Temperature in °C, Vibration level, Hydraulic pressure in PSI, Motor speed in RPM, and Power in kW) are accepted via REST API.',
    },
    {
      num: '02',
      title: 'Symbolic Fact Abstraction',
      desc: 'Quantitative readings are validated against physical bounds and converted into qualitative symbolic facts (e.g. HIGH_TEMPERATURE, HIGH_VIBRATION, LOW_PRESSURE).',
    },
    {
      num: '03',
      title: 'Forward-Chaining Rule Evaluation',
      desc: 'The inference engine evaluates the working memory facts against all antecedent conditions of active IF-THEN production rules simultaneously.',
    },
    {
      num: '04',
      title: 'Conflict Resolution & Accumulation',
      desc: 'Multiple simultaneous failure modes are retained and ranked by operational severity (CRITICAL > WARNING > HEALTHY), rather than halting on first match.',
    },
    {
      num: '05',
      title: 'Explanation & Recommendation Generation',
      desc: 'An explanation facility produces transparent causal justifications, detailing exactly why each rule fired, and prescribes targeted maintenance protocols.',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold">
          <Cpu className="w-3.5 h-3.5" />
          SYSTEM ARCHITECTURE & METHODOLOGY
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
          AI-Assisted Machine Failure Diagnosis System
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          An industrial-grade Knowledge-Based System (KBS) combining deterministic expert production rules
          with an automated forward-chaining inference engine and explanation facility.
        </p>
      </div>

      {/* Problem Statement Card */}
      <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Problem Statement & Domain Challenge
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          In modern manufacturing facilities, machine breakdown can cause catastrophic downtime, safety
          hazards, and millions in lost production. While modern machines stream continuous telemetry
          (temperatures, vibrations, hydraulic pressures), plant maintenance teams require immediate,
          transparent, and explainable failure root-cause diagnoses to take rapid corrective action.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          This system implements an expert system that encodes decades of mechanical engineering knowledge
          into structured production rules, evaluating multi-sensor conditions simultaneously to detect
          cascading faults before catastrophic component failure occurs.
        </p>
      </div>

      {/* Forward Chaining Architecture Diagram */}
      <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            Forward-Chaining Inference Mechanism
          </h2>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
            Data-Driven Inference
          </span>
        </div>

        {/* Workflow Steps Horizontal/Vertical Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 relative group hover:border-cyan-500/50 transition"
            >
              <div className="text-2xl font-black font-mono text-cyan-500/40 group-hover:text-cyan-400 transition">
                {s.num}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white mb-1">{s.title}</h3>
                <p className="text-[11px] text-slate-400 leading-tight font-sans">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KBS vs Black-Box ML Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#0b1120] border border-cyan-900/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-mono">
            <ShieldCheck className="w-5 h-5" />
            Knowledge-Based Expert System (This Solution)
          </div>
          <ul className="text-xs text-slate-300 space-y-2.5 font-sans">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
              <span><strong>100% Explainable:</strong> Every diagnosis points to the exact fired production rules and sensor triggers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
              <span><strong>Zero Hallucinations:</strong> Deterministic evaluation guarantees strict adherence to engineering safety boundaries.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
              <span><strong>Auditable & Modifiable:</strong> Maintenance teams can tune thresholds directly to match OEM machinery specs.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold font-mono">
            <Layers className="w-5 h-5" />
            Black-Box Machine Learning (Contrast)
          </div>
          <ul className="text-xs text-slate-400 space-y-2.5 font-sans">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
              <span><strong>Opaque Reasoning:</strong> Neural weights cannot directly articulate the mechanical physics causing a fault.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
              <span><strong>Data Dependency:</strong> Requires thousands of catastrophic failure runs in training data, which plants avoid.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
              <span><strong>Calibration Shifts:</strong> Sensor drift can produce unpredictably confident false positives.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Tech Stack Specs */}
      <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          Production Engineering Technology Stack
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">FRONTEND</div>
            <div className="font-bold text-white mt-1">React 18 + Vite</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Tailwind CSS + Recharts</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">BACKEND</div>
            <div className="font-bold text-white mt-1">FastAPI + Python 3.13</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Pydantic v2 + Uvicorn</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">DATABASE</div>
            <div className="font-bold text-white mt-1">SQLite + SQLAlchemy</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Persistent Volume Disk</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">DEPLOYMENT</div>
            <div className="font-bold text-white mt-1">Render + Vercel</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Automated CI/CD</div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-cyan-900/60 border border-cyan-800/60 shadow-2xl text-center space-y-4">
        <h3 className="text-xl font-black text-white">Ready to test real sensor fault conditions?</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Explore benchmark cases including thermal overheating, bearing seizure, and multi-factor mechanical breakdown.
        </p>
        <button
          onClick={() => setActiveTab('diagnose')}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-glow-cyan transition inline-flex items-center gap-2"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>LAUNCH DIAGNOSTIC TERMINAL</span>
        </button>
      </div>
    </div>
  );
}
