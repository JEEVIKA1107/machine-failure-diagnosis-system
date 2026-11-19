import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../services/api';

const SEVERITY_COLORS = {
  Healthy: '#10b981',
  Warning: '#f59e0b',
  Critical: '#ef4444',
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      setData(res);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadCsv = () => {
    const csvUrl = api.getExportCsvUrl();
    window.open(csvUrl, '_blank');
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3 font-mono text-slate-400">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span>Aggregating Fleet Failure Analytics...</span>
        </div>
      </div>
    );
  }

  const commonFailures = data?.common_failures || [];
  const severityDist = data?.severity_distribution || [];
  const trends = data?.diagnosis_trends || [];

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Machine Failure Intelligence & Reports
          </h1>
          <p className="text-sm text-slate-400">
            Statistical failure clustering, severity distributions, and timeline trend analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold shadow-glow-emerald transition transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV AUDIT REPORT</span>
          </button>
        </div>
      </div>

      {/* Top Aggregation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">Total KBS Evaluated</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{data?.total_diagnoses || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Audit log records</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">Healthy Operations</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {severityDist.find((s) => s.severity === 'Healthy')?.count || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tolerance compliant</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">Warning Pre-Emptive</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {severityDist.find((s) => s.severity === 'Warning')?.count || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Inspection advised</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">Critical Seizure Risks</div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {severityDist.find((s) => s.severity === 'Critical')?.count || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Emergency action</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Common Failure Causes (Bar Chart) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Most Common Machine Failure Causes
              </h2>
              <p className="text-xs text-slate-400">Frequency of matched failure classifications</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={commonFailures}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="failure"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Failure Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution (Pie Chart) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Diagnosis Severity Distribution
            </h2>
            <p className="text-xs text-slate-400">Fleet health proportion across all evaluations</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="severity"
                >
                  {severityDist.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEVERITY_COLORS[entry.severity] || '#3b82f6'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-around font-mono text-xs">
            {severityDist.map((s) => (
              <div key={s.severity} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[s.severity] || '#3b82f6' }}
                />
                <span className="text-slate-300">
                  {s.severity}: <strong className="text-white">{s.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnosis Activity Trend Over Time */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Diagnostic Evaluation Frequency Over Time
            </h2>
            <p className="text-xs text-slate-400">Total diagnoses executed per day</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
            Temporal Activity
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
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
              <Line
                type="monotone"
                dataKey="diagnoses"
                name="Diagnoses Completed"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
