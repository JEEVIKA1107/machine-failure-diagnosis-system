import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Gauge,
  Thermometer,
  Waves,
  Cpu,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../services/api';

export default function Dashboard({ setActiveTab, setSelectedMachineId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Synthetic live telemetry series for visual industrial SCADA monitoring chart
  const telemetryData = [
    { time: '08:00', tempAvg: 48, pressureAvg: 46, vibrationAvg: 2.1 },
    { time: '09:00', tempAvg: 52, pressureAvg: 48, vibrationAvg: 2.4 },
    { time: '10:00', tempAvg: 68, pressureAvg: 44, vibrationAvg: 3.2 },
    { time: '11:00', tempAvg: 74, pressureAvg: 41, vibrationAvg: 4.1 },
    { time: '12:00', tempAvg: 88, pressureAvg: 35, vibrationAvg: 5.8 },
    { time: '13:00', tempAvg: 92, pressureAvg: 28, vibrationAvg: 6.4 },
    { time: '14:00', tempAvg: 85, pressureAvg: 32, vibrationAvg: 5.2 },
  ];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-sm font-mono text-slate-400">Loading Industrial Telemetry & KBS Stats...</span>
        </div>
      </div>
    );
  }

  const healthy = stats?.healthy_machines || 0;
  const warning = stats?.warning_machines || 0;
  const critical = stats?.critical_machines || 0;
  const total = stats?.total_machines || 0;
  const healthyPct = total > 0 ? Math.round((healthy / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0b1528] to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              TELEMETRY & EXPERT KBS
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Machine Health & Diagnostics Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time sensor evaluation against forward-chaining maintenance rules.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnose')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-glow-cyan tracking-wide transition transform hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>RUN NEW DIAGNOSIS</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadData} className="underline text-xs hover:text-white">Retry</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Machines */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-slate-700 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase">Monitored Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{total}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>5 Seeded Units</span>
            <span className="text-cyan-400 font-mono">100% Online</span>
          </div>
        </div>

        {/* Healthy */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-emerald-900/40 hover:border-emerald-700/60 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-emerald-400 uppercase">Optimal Health</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{healthy}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tolerances Normal</span>
            <span className="text-emerald-400 font-mono font-bold">{healthyPct}%</span>
          </div>
        </div>

        {/* Warning */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-amber-900/40 hover:border-amber-700/60 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-amber-400 uppercase">Needs Attention</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">{warning}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Pre-emptive Service</span>
            <span className="text-amber-400 font-mono font-bold">Inspection Due</span>
          </div>
        </div>

        {/* Critical */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-rose-900/40 hover:border-rose-700/60 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-rose-400 uppercase">Critical Alert</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">{critical}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Thermal/Bearing Seizure</span>
            <span className="text-rose-400 font-mono font-bold animate-pulse">Action Req.</span>
          </div>
        </div>

        {/* Total Diagnoses */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-cyan-900/40 hover:border-cyan-700/60 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-cyan-400 uppercase">Total Diagnoses</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono">{stats?.total_diagnoses || 0}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>KBS Executions</span>
            <span className="text-cyan-400 font-mono">SQLite Logged</span>
          </div>
        </div>
      </div>

      {/* Fleet Health Breakdown Bar */}
      <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold uppercase flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Fleet Health Ratio Breakdown
          </span>
          <span className="text-slate-400">Total: {total} Units Evaluated</span>
        </div>

        <div className="w-full h-3.5 bg-slate-850 rounded-full overflow-hidden flex shadow-inner">
          {total > 0 ? (
            <>
              <div
                style={{ width: `${(healthy / total) * 100}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Healthy: ${healthy}`}
              />
              <div
                style={{ width: `${(warning / total) * 100}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`Warning: ${warning}`}
              />
              <div
                style={{ width: `${(critical / total) * 100}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Critical: ${critical}`}
              />
            </>
          ) : (
            <div className="w-full bg-slate-800" />
          )}
        </div>

        <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Healthy ({healthy})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Warning ({warning})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-rose-500" />
            <span>Critical Fault ({critical})</span>
          </div>
        </div>
      </div>

      {/* Charts & Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor Monitoring Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                Aggregated Sensor Monitoring Trends
              </h2>
              <p className="text-xs text-slate-400">Continuous telemetry profile (Temp °C vs PSI)</p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Shift Log
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tempAvg"
                  name="Temperature (°C)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="pressureAvg"
                  name="Pressure (PSI)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#pressGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-around text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Temperature Baseline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Hydraulic Pressure
            </span>
            <span className="text-slate-500">Threshold: 85°C / 20 PSI</span>
          </div>
        </div>

        {/* Recent Critical Machine Failures */}
        <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                High-Priority Alerts
              </h2>
              <span className="text-[11px] font-mono text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {stats?.recent_failures && stats.recent_failures.length > 0 ? (
                stats.recent_failures.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-white">{f.machine_id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          f.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium truncate">
                      {f.detected_failures?.[0] || 'Unspecified fault'}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Match: {f.confidence_score}%</span>
                      <button
                        onClick={() => {
                          if (setSelectedMachineId) setSelectedMachineId(f.machine_id);
                          setActiveTab('diagnose');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                      >
                        Diagnose <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 font-mono">
                  No active mechanical failure alerts recorded.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('history')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-mono text-cyan-400 border border-slate-700/80 transition flex items-center justify-center gap-1.5"
          >
            <span>View Full Diagnosis Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Diagnosis Activity Table */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent KBS Diagnosis Feed
            </h2>
            <p className="text-xs text-slate-400">Latest automated expert system evaluations</p>
          </div>

          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Diag ID</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Detected Diagnosis</th>
                <th className="py-3 px-4">Rule Certainty</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {stats?.recent_diagnoses && stats.recent_diagnoses.length > 0 ? (
                stats.recent_diagnoses.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-850/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400">#{d.id}</td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{d.machine_name || 'Machine'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.machine_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono uppercase ${
                          d.overall_status === 'HEALTHY'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : d.overall_status === 'WARNING'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            d.overall_status === 'HEALTHY'
                              ? 'bg-emerald-400'
                              : d.overall_status === 'WARNING'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {d.overall_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {d.detected_failures?.[0] || 'Normal operation'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {d.confidence_score}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(d.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (setSelectedMachineId) setSelectedMachineId(d.machine_id);
                          setActiveTab('diagnose');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                      >
                        Re-Diagnose
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-mono">
                    No recent diagnoses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
