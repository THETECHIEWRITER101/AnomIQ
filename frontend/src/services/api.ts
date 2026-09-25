import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Anomaly {
  id: number;
  title: string;
  machine_id: string;
  production_line: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'CAPA_PENDING' | 'RESOLVED' | 'CLOSED';
  description: string;
  metric_name?: string;
  metric_value?: number;
  threshold_value?: number;
  detected_at: string;
  operator_name?: string;
  capa?: CapaAction;
}

export interface CapaAction {
  id: number;
  anomaly_id: number;
  root_cause: string;
  corrective_action: string;
  preventive_action: string;
  ai_confidence: number;
  review_status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
  reviewer_notes?: string;
  generated_at: string;
  reviewed_at?: string;
}

export interface DashboardMetrics {
  total_anomalies: number;
  active_critical: number;
  pending_capa: number;
  mttr_hours: number;
  recent_anomalies: Anomaly[];
}

export interface CreateAnomalyPayload {
  title: string;
  machine_id: string;
  production_line: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  metric_name?: string;
  metric_value?: number;
  threshold_value?: number;
  operator_name?: string;
}

export const anomalyApi = {
  // Anomaly CRUD
  getAnomalies: async (params?: { severity?: string; status?: string; line?: string }) => {
    const res = await apiClient.get<Anomaly[]>('/api/anomalies', { params });
    return res.data;
  },

  getAnomalyById: async (id: number) => {
    const res = await apiClient.get<Anomaly>(`/api/anomalies/${id}`);
    return res.data;
  },

  createAnomaly: async (payload: CreateAnomalyPayload) => {
    const res = await apiClient.post<Anomaly>('/api/anomalies', payload);
    return res.data;
  },

  updateAnomalyStatus: async (id: number, status: string) => {
    const res = await apiClient.patch<Anomaly>(`/api/anomalies/${id}/status`, { status });
    return res.data;
  },

  deleteAnomaly: async (id: number) => {
    const res = await apiClient.delete(`/api/anomalies/${id}`);
    return res.data;
  },

  // Dashboard & Analytics
  getDashboardMetrics: async () => {
    const res = await apiClient.get<DashboardMetrics>('/api/analytics/dashboard');
    return res.data;
  },

  getAnalyticsTrends: async () => {
    const res = await apiClient.get('/api/analytics/trends');
    return res.data;
  },

  // AI & CAPA
  generateCapa: async (anomalyId: number) => {
    const res = await apiClient.post<CapaAction>(`/api/ai/generate-capa/${anomalyId}`);
    return res.data;
  },

  getCapaReviews: async () => {
    const res = await apiClient.get<CapaAction[]>('/api/ai/capa-reviews');
    return res.data;
  },

  updateCapaStatus: async (capaId: number, review_status: string, reviewer_notes?: string) => {
    const res = await apiClient.patch<CapaAction>(`/api/ai/capa/${capaId}/review`, {
      review_status,
      reviewer_notes,
    });
    return res.data;
  },
};
