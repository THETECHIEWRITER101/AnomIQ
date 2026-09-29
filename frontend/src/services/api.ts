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
  image_url?: string;
  capa?: CapaAction;
  capas?: CapaAction[];
}

export interface CapaAction {
  id: number;
  anomaly_id: number;
  root_cause: string;
  containment_action?: string;
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
  image_url?: string;
}

export interface DuplicateMatch {
  id: number;
  title: string;
  machine_id: string;
  production_line: string;
  detected_at: string;
  similarity_score: number;
  status: string;
}

export interface DuplicateCheckResponse {
  is_duplicate_suspected: boolean;
  threshold: number;
  matches: DuplicateMatch[];
}

export interface VoiceIntakeResponse {
  title: string;
  machine_id: string;
  production_line: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  metric_name?: string;
  metric_value?: number;
  threshold_value?: number;
}

export interface FiveWhysHistoryItem {
  step: number;
  question: string;
  answer: string;
}

export interface FiveWhysStepPayload {
  anomaly_id?: number;
  anomaly_title?: string;
  machine_id?: string;
  production_line?: string;
  metric_name?: string;
  metric_value?: number;
  threshold_value?: number;
  step: number;
  history: FiveWhysHistoryItem[];
  technician_input?: string;
}

export interface FiveWhysStepResponse {
  current_step: number;
  why_question: string;
  quick_options: string[];
  is_final_step: boolean;
  synthesized_root_cause?: string;
  suggested_corrective_action?: string;
  suggested_preventive_action?: string;
}

export const anomalyApi = {
  // Anomaly CRUD
  getAnomalies: async (params?: { severity?: string; status?: string; line?: string }) => {
    const res = await apiClient.get<Anomaly[]>('/api/anomalies', { params });
    return res.data;
  },

  getActiveAnomalies: async () => {
    const res = await apiClient.get<Anomaly[]>('/api/anomalies/active');
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

  checkDuplicates: async (title: string, timeWindowHours: number = 24) => {
    const res = await apiClient.post<DuplicateCheckResponse>('/api/anomalies/check-duplicates', {
      title,
      time_window_hours: timeWindowHours,
    });
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
    const res = await apiClient.post<CapaAction>(`/api/ai/capa/generate/${anomalyId}`);
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

  // Voice to Defect Intake (Floor Mode)
  parseVoiceIntake: async (transcript: string) => {
    const res = await apiClient.post<VoiceIntakeResponse>('/api/ai/voice-intake', { transcript });
    return res.data;
  },

  // Interactive 5-Whys Diagnostic Copilot
  process5WhysStep: async (payload: FiveWhysStepPayload) => {
    const res = await apiClient.post<FiveWhysStepResponse>('/api/ai/5-whys/step', payload);
    return res.data;
  },

  apply5Whys: async (payload: {
    anomaly_id: number;
    root_cause: string;
    corrective_action: string;
    preventive_action: string;
    containment_action?: string;
  }) => {
    const res = await apiClient.post<CapaAction>('/api/ai/5-whys/apply', payload);
    return res.data;
  },

  updateCapaFull: async (
    capaId: number,
    payload: {
      root_cause?: string;
      containment_action?: string;
      corrective_action?: string;
      preventive_action?: string;
      review_status?: string;
      reviewer_notes?: string;
    }
  ) => {
    const res = await apiClient.put<CapaAction>(`/api/ai/capa/${capaId}`, payload);
    return res.data;
  },
};
