/**
 * AeroPulse API Service
 * Handles communication with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMsg = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    console.error(`API request failed at ${url}:`, err);
    throw err;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/api/health'),

  // Machines
  getMachines: () => request('/api/machines'),
  getMachineDetail: (id) => request(`/api/machines/${encodeURIComponent(id)}`),
  createMachine: (data) => request('/api/machines', { method: 'POST', body: JSON.stringify(data) }),
  updateMachine: (id, data) => request(`/api/machines/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMachine: (id) => request(`/api/machines/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Diagnosis
  diagnose: (data) => request('/api/diagnose', { method: 'POST', body: JSON.stringify(data) }),
  getDiagnoses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.machine_id) query.set('machine_id', params.machine_id);
    if (params.severity) query.set('severity', params.severity);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    const qs = query.toString();
    return request(`/api/diagnoses${qs ? `?${qs}` : ''}`);
  },
  getDiagnosisDetail: (id) => request(`/api/diagnoses/${id}`),
  deleteDiagnosis: (id) => request(`/api/diagnoses/${id}`, { method: 'DELETE' }),
  clearAllDiagnoses: () => request('/api/diagnoses', { method: 'DELETE' }),

  // Knowledge Base & Rules
  getRules: () => request('/api/rules'),
  getThresholds: () => request('/api/rules/thresholds'),
  updateThresholds: (data) => request('/api/rules/thresholds', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard & Reports
  getDashboardStats: () => request('/api/dashboard/stats'),
  getReports: () => request('/api/reports'),
  getExportCsvUrl: () => `${API_BASE}/api/reports/export-csv`,
};
