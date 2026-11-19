import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  RefreshCw,
  FileText,
  Calendar,
  Cpu,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export default function DiagnosisHistory({ setActiveTab, onSelectMachineForDiagnosis }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Detail Modal
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getDiagnoses();
      setHistory(data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      const detail = await api.getDiagnosisDetail(id);
      setSelectedDiagnosis(detail);
    } catch (err) {
      alert(`Failed to load diagnosis detail: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteDiagnosis(id);
      setDeleteConfirmId(null);
      if (selectedDiagnosis?.id === id) {
        setSelectedDiagnosis(null);
      }
      loadHistory();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to purge all historical diagnosis records from SQLite?')) {
      try {
        await api.clearAllDiagnoses();
        loadHistory();
      } catch (err) {
        alert(`Clear failed: ${err.message}`);
      }
    }
  };

  const filteredHistory = history.filter((d) => {
    const matchesSearch =
      (d.machine_id && d.machine_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.machine_name && d.machine_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.detected_failures &&
        d.detected_failures.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesSeverity = severityFilter === 'ALL' || d.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-cyan-400" />
            Diagnosis Audit Log & History
          </h1>
          <p className="text-sm text-slate-400">
            Immutable SQLite records of all knowledge-based machine fault evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadHistory}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 transition"
            title="Refresh Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-mono font-bold border border-rose-800/80 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR LOGS</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-[#0b1120] border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Machine, Diagnosis, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {['ALL', 'HEALTHY', 'WARNING', 'CRITICAL'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-xl transition ${
                severityFilter === s
                  ? 'bg-cyan-500 text-white font-bold shadow-glow-cyan'
                  : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-750'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Diag ID</th>
                <th className="py-3.5 px-4">Machine</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Primary Inferred Cause</th>
                <th className="py-3.5 px-4">Match %</th>
                <th className="py-3.5 px-4">Timestamp (UTC)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading && history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Querying SQLite Diagnosis Records...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-mono">
                    No diagnosis records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-850/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">#{d.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{d.machine_name || 'Machine'}</div>
                      <div className="text-[11px] font-mono text-slate-400">{d.machine_id}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
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
                    <td className="py-3 px-4 text-slate-200 max-w-sm truncate">
                      {d.detected_failures?.[0] || 'Normal Operation'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {d.confidence_score}%
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(d.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Full Diagnosis Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(d.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-rose-900/60 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirm Record Deletion</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete diagnosis record #{deleteConfirmId}?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 font-mono text-xs">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow-rose"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedDiagnosis && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedDiagnosis(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-cyan-400">
                  HISTORICAL DIAGNOSIS #{selectedDiagnosis.id}
                </div>
                <h2 className="text-xl font-black text-white">
                  {selectedDiagnosis.machine_name} ({selectedDiagnosis.machine_id})
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Recorded: {new Date(selectedDiagnosis.created_at).toUTCString()}
                </p>
              </div>
            </div>

            {/* Status & Confidence */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-400 block mb-1">EVALUATED STATUS</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedDiagnosis.overall_status === 'HEALTHY'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : selectedDiagnosis.overall_status === 'WARNING'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {selectedDiagnosis.overall_status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">RULE MATCH CONFIDENCE</span>
                <span className="text-base font-bold text-cyan-400">
                  {selectedDiagnosis.confidence_score}%
                </span>
              </div>
            </div>

            {/* Input Telemetry Snapshot */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                Sensor Telemetry Snapshot at Diagnosis
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">TEMPERATURE</div>
                  <div className="font-bold text-white mt-1">
                    {selectedDiagnosis.input_readings?.temperature}°C
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">VIBRATION</div>
                  <div className="font-bold text-white mt-1">
                    {selectedDiagnosis.input_readings?.vibration}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">PRESSURE</div>
                  <div className="font-bold text-white mt-1">
                    {selectedDiagnosis.input_readings?.pressure} PSI
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">MOTOR SPEED</div>
                  <div className="font-bold text-white mt-1">
                    {selectedDiagnosis.input_readings?.motor_speed} RPM
                  </div>
                </div>
              </div>
            </div>

            {/* Detected Failures */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                Inferred Failure Causes
              </h4>
              <div className="space-y-2">
                {selectedDiagnosis.detected_failures?.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-rose-300 font-medium"
                  >
                    &bull; {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                Prescribed Maintenance Action
              </h4>
              <div className="space-y-2">
                {selectedDiagnosis.recommendations?.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                  >
                    {i + 1}. {r}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setSelectedDiagnosis(null)}
                className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
