import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Search,
  Filter,
  Plus,
  Thermometer,
  Waves,
  Gauge,
  RotateCw,
  Zap,
  ArrowRight,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { api } from '../services/api';

export default function MachineMonitoring({ setActiveTab, onSelectMachineForDiagnosis }) {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machineDetailLoading, setMachineDetailLoading] = useState(false);
  const [machineDetailData, setMachineDetailData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Machine Form State
  const [newMachine, setNewMachine] = useState({
    id: '',
    machine_name: '',
    machine_type: 'CNC Milling',
    location: 'Main Production Bay',
    status: 'HEALTHY',
  });

  const loadMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMachines();
      setMachines(data);
    } catch (err) {
      setError(err.message || 'Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleViewDetail = async (machine) => {
    setSelectedMachine(machine);
    try {
      setMachineDetailLoading(true);
      const detail = await api.getMachineDetail(machine.id);
      setMachineDetailData(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setMachineDetailLoading(false);
    }
  };

  const handleCreateMachine = async (e) => {
    e.preventDefault();
    try {
      await api.createMachine(newMachine);
      setIsAddModalOpen(false);
      setNewMachine({
        id: '',
        machine_name: '',
        machine_type: 'CNC Milling',
        location: 'Main Production Bay',
        status: 'HEALTHY',
      });
      loadMachines();
    } catch (err) {
      alert(`Error creating machine: ${err.message}`);
    }
  };

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machine_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            HEALTHY
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-950/80 text-amber-400 border border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            WARNING
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-rose-950/80 text-rose-400 border border-rose-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            CRITICAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-cyan-400" />
            Machine Telemetry & Fleet Monitoring
          </h1>
          <p className="text-sm text-slate-400">
            Live sensor readings, physical tolerances, and individual equipment status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadMachines}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
            title="Refresh Machines"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-glow-cyan transition"
          >
            <Plus className="w-4 h-4" />
            <span>ADD MACHINE</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-[#0b1120] border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Machine ID, Name, or Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {['ALL', 'HEALTHY', 'WARNING', 'CRITICAL'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition ${
                statusFilter === s
                  ? 'bg-cyan-500 text-white shadow-glow-cyan'
                  : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-750'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && machines.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-mono flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          <span>Polling Machine Fleet Telemetry...</span>
        </div>
      ) : filteredMachines.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-[#0b1120] border border-slate-800 text-slate-400 font-mono">
          No machines found matching "{searchTerm}" ({statusFilter}).
        </div>
      ) : (
        /* Machines Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMachines.map((m) => {
            const reading = m.latest_reading;
            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-slate-700 hover:shadow-2xl transition duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Status indicator line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    m.status === 'HEALTHY'
                      ? 'bg-emerald-500'
                      : m.status === 'WARNING'
                      ? 'bg-amber-500'
                      : 'bg-rose-500 animate-pulse'
                  }`}
                />

                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[11px] font-mono text-cyan-400 font-bold">{m.id}</div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                        {m.machine_name}
                      </h3>
                      <p className="text-xs text-slate-400">{m.machine_type}</p>
                    </div>
                    {getStatusBadge(m.status)}
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>{m.location || 'Main Production Bay'}</span>
                  </div>

                  {/* Sensor Gauges Card */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 mb-4 text-xs font-mono">
                    {/* Temperature */}
                    <div className="p-2 rounded-lg bg-slate-850/60 flex items-center gap-2">
                      <Thermometer
                        className={`w-4 h-4 ${
                          (reading?.temperature || 0) > 85 ? 'text-rose-400' : 'text-cyan-400'
                        }`}
                      />
                      <div>
                        <div className="text-[10px] text-slate-400">TEMPERATURE</div>
                        <div
                          className={`font-bold ${
                            (reading?.temperature || 0) > 85 ? 'text-rose-400' : 'text-slate-100'
                          }`}
                        >
                          {reading ? `${reading.temperature}°C` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Vibration */}
                    <div className="p-2 rounded-lg bg-slate-850/60 flex items-center gap-2">
                      <Waves
                        className={`w-4 h-4 ${
                          reading?.vibration === 'HIGH' ? 'text-rose-400' : 'text-blue-400'
                        }`}
                      />
                      <div>
                        <div className="text-[10px] text-slate-400">VIBRATION</div>
                        <div
                          className={`font-bold ${
                            reading?.vibration === 'HIGH' ? 'text-rose-400' : 'text-slate-100'
                          }`}
                        >
                          {reading ? reading.vibration : 'N/A'}
                          {reading?.vibration_value ? ` (${reading.vibration_value} mm/s)` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Pressure */}
                    <div className="p-2 rounded-lg bg-slate-850/60 flex items-center gap-2">
                      <Gauge
                        className={`w-4 h-4 ${
                          (reading?.pressure || 0) < 20 ? 'text-amber-400' : 'text-cyan-400'
                        }`}
                      />
                      <div>
                        <div className="text-[10px] text-slate-400">PRESSURE</div>
                        <div
                          className={`font-bold ${
                            (reading?.pressure || 0) < 20 ? 'text-amber-400' : 'text-slate-100'
                          }`}
                        >
                          {reading ? `${reading.pressure} PSI` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Motor Speed */}
                    <div className="p-2 rounded-lg bg-slate-850/60 flex items-center gap-2">
                      <RotateCw
                        className={`w-4 h-4 ${
                          (reading?.motor_speed || 0) < 500 ? 'text-amber-400' : 'text-blue-400'
                        }`}
                      />
                      <div>
                        <div className="text-[10px] text-slate-400">MOTOR SPEED</div>
                        <div
                          className={`font-bold ${
                            (reading?.motor_speed || 0) < 500 ? 'text-amber-400' : 'text-slate-100'
                          }`}
                        >
                          {reading ? `${reading.motor_speed} RPM` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewDetail(m)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Telemetry</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectMachineForDiagnosis) {
                        onSelectMachineForDiagnosis(m);
                      }
                      setActiveTab('diagnose');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-glow-cyan"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Diagnose</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Machine Details Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedMachine(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono text-cyan-400 font-bold">{selectedMachine.id}</div>
                <h2 className="text-xl font-black text-white">{selectedMachine.machine_name}</h2>
                <p className="text-xs text-slate-400">{selectedMachine.machine_type} • {selectedMachine.location}</p>
              </div>
            </div>

            {machineDetailLoading ? (
              <div className="py-12 text-center text-slate-400 font-mono">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                Loading comprehensive sensor timelines...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400">CURRENT HEALTH EVALUATION</span>
                  {getStatusBadge(selectedMachine.status)}
                </div>

                {/* Sensor Readings Grid */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3">
                    Active Operational Telemetry
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">TEMPERATURE</div>
                      <div className="text-base font-bold text-cyan-400 mt-1">
                        {machineDetailData?.latest_reading?.temperature ?? 'N/A'}°C
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Threshold: &le;85°C</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">VIBRATION</div>
                      <div className="text-base font-bold text-blue-400 mt-1">
                        {machineDetailData?.latest_reading?.vibration ?? 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Level: Normal/High</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">PRESSURE</div>
                      <div className="text-base font-bold text-cyan-400 mt-1">
                        {machineDetailData?.latest_reading?.pressure ?? 'N/A'} PSI
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Threshold: &ge;20 PSI</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">MOTOR SPEED</div>
                      <div className="text-base font-bold text-blue-400 mt-1">
                        {machineDetailData?.latest_reading?.motor_speed ?? 'N/A'} RPM
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Threshold: &ge;500 RPM</div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Stream */}
                {machineDetailData?.sensor_history && machineDetailData.sensor_history.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3">
                      Historical Sensor Stream (Last 5 Readings)
                    </h4>
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Time</th>
                            <th className="p-2.5">Temp</th>
                            <th className="p-2.5">Vibration</th>
                            <th className="p-2.5">Pressure</th>
                            <th className="p-2.5">Speed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {machineDetailData.sensor_history.slice(0, 5).map((r) => (
                            <tr key={r.id} className="hover:bg-slate-850/40">
                              <td className="p-2.5 text-slate-400">
                                {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-2.5 text-white">{r.temperature}°C</td>
                              <td className="p-2.5 text-white">{r.vibration}</td>
                              <td className="p-2.5 text-white">{r.pressure} PSI</td>
                              <td className="p-2.5 text-white">{r.motor_speed} RPM</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSelectedMachine(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-mono transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const m = selectedMachine;
                      setSelectedMachine(null);
                      if (onSelectMachineForDiagnosis) {
                        onSelectMachineForDiagnosis(m);
                      }
                      setActiveTab('diagnose');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold font-mono shadow-glow-cyan transition flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>RUN KBS DIAGNOSIS</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Machine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-white mb-1">Register Industrial Machine</h2>
            <p className="text-xs text-slate-400 mb-6">Add equipment for continuous expert monitoring.</p>

            <form onSubmit={handleCreateMachine} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">MACHINE ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAC-006"
                  value={newMachine.id}
                  onChange={(e) => setNewMachine({ ...newMachine, id: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">MACHINE NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Pressure Boiler Feed Pump"
                  value={newMachine.machine_name}
                  onChange={(e) => setNewMachine({ ...newMachine, machine_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">MACHINE TYPE / CLASS *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Centrifugal Pump, Hydraulic Press, Turbine"
                  value={newMachine.machine_type}
                  onChange={(e) => setNewMachine({ ...newMachine, machine_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">PLANT LOCATION / BAY</label>
                <input
                  type="text"
                  placeholder="e.g. Utility Yard Section 2"
                  value={newMachine.location}
                  onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-glow-cyan"
                >
                  Save Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
