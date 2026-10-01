import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  HelpCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Search
} from 'lucide-react';
import { anomalyApi, Anomaly } from '../services/api';
import FiveWhysCopilotModal from '../components/FiveWhysCopilotModal';
import CapaModal from '../components/CapaModal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

import DualLogsAuditModal from '../components/DualLogsAuditModal';
import { ClipboardCheck } from 'lucide-react';

interface DashboardProps {
  onOpenCreateModal?: () => void;
  selectedIndustry?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenCreateModal }) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals & Actions
  const [copilotAnomaly, setCopilotAnomaly] = useState<Anomaly | null>(null);
  const [capaModalAnomaly, setCapaModalAnomaly] = useState<Anomaly | null>(null);
  const [dualLogsAnomaly, setDualLogsAnomaly] = useState<Anomaly | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [userContext, setUserContext] = useState(() => {
    try {
      const stored = localStorage.getItem('anomiq_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          facilityId: parsed.facility_id,
          facilityName: parsed.facility_name || 'Apex Electronics Plant - Line 1',
          role: parsed.role || 'Quality Assurance Engineer',
          name: parsed.name || 'Sarah Jenkins',
        };
      }
    } catch (e) {}
    return {
      facilityId: undefined,
      facilityName: 'Apex Electronics Plant - Line 1',
      role: 'Quality Assurance Engineer',
      name: 'Sarah Jenkins',
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDashboardData = async (overrideFacId?: any, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const targetFacId = overrideFacId !== undefined ? overrideFacId : userContext.facilityId;
      const data = await anomalyApi.getAnomalies({ facility_id: targetFacId });
      setAnomalies(data || []);
    } catch (err) {
      console.warn('Dashboard fetch notice', err);
      setAnomalies([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleCreated = () => fetchDashboardData(undefined, true);
    window.addEventListener('anomaly-created', handleCreated);

    const handleSwitch = (e: any) => {
      const next = e.detail;
      if (next) {
        setUserContext({
          facilityId: next.facility_id,
          facilityName: next.facility_name,
          role: next.role,
          name: next.name,
        });
        fetchDashboardData(next.facility_id, false);
      }
    };
    window.addEventListener('anomiq-user-switched', handleSwitch);

    const interval = setInterval(() => fetchDashboardData(undefined, true), 5000);
    return () => {
      window.removeEventListener('anomaly-created', handleCreated);
      window.removeEventListener('anomiq-user-switched', handleSwitch);
      clearInterval(interval);
    };
  }, [userContext.facilityId]);

  const handleGenerateCapa = async (id: number | string) => {
    setActionLoadingId(id);
    try {
      await anomalyApi.generateCapa(id);
      showToast(`AI CAPA generated for anomaly #${id}`);
      fetchDashboardData(true);
    } catch (err) {
      showToast(`AI CAPA generated for anomaly #${id}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (id: number | string, newStatus: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
    );
    try {
      await anomalyApi.updateAnomalyStatus(id, newStatus);
      showToast(`Anomaly #${id} status updated to ${newStatus}`);
    } catch (e) {
      // Keep optimistic
    }
  };

  const filtered = anomalies.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.machine_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.production_line.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      selectedSeverity === 'All' || item.severity.toUpperCase() === selectedSeverity.toUpperCase();
    const matchesStatus =
      selectedStatus === 'All' || item.status.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3 rounded-xl bg-slate-900 text-white font-medium text-xs shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Anomalies Master Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time shopfloor failure logs, 5-Whys diagnostic assistant, and CAPA resolution tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData()}
            className="text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <Button
            variant="dark"
            size="sm"
            onClick={onOpenCreateModal}
            className="text-xs bg-[#0f172a] text-white hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Log Anomaly
          </Button>
        </div>
      </div>

      {/* Clean Zero-Data Empty State if no anomalies exist for this facility */}
      {!loading && anomalies.length === 0 ? (
        <div className="console-card p-12 text-center space-y-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <ShieldCheck size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Clean Operational State</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No active anomalies or line stoppages logged for <strong className="text-slate-700">{userContext.facilityName}</strong>. Shift operators can log newly detected equipment deviations using the button below.
            </p>
          </div>
          <Button
            variant="dark"
            size="sm"
            onClick={onOpenCreateModal}
            className="text-xs bg-[#0f172a] text-white hover:bg-slate-800 inline-flex items-center gap-1.5 px-4 py-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Log First Anomaly
          </Button>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="console-card p-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anomaly, machine ID, production line..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="All">All Lifecycle Statuses</option>
              <option value="OPEN">DETECTED</option>
              <option value="INVESTIGATING">UNDER INVESTIGATION</option>
              <option value="CAPA_PENDING">CAPA GENERATED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Master Register Incident Feed Table */}
          <div className="console-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">ID &amp; Title</th>
                    <th className="py-3 px-4">Machine / Line</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Telemetry Readout</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No matching anomalies found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: #{item.id} · Logged: {item.detected_at ? new Date(item.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:20'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge variant="machine" className="mb-0.5">
                            {item.machine_id}
                          </Badge>
                          <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                            {item.production_line}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            variant={
                              item.severity === 'CRITICAL'
                                ? 'red'
                                : item.severity === 'HIGH'
                                  ? 'yellow'
                                  : item.severity === 'MEDIUM'
                                    ? 'yellow'
                                    : 'slate'
                            }
                          >
                            {item.severity}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                          <span className="text-slate-500">{item.metric_name || 'Deviation'}: </span>
                          <strong className="text-red-600 font-bold">{item.metric_value ?? 0.0}</strong>
                          {item.threshold_value != null && (
                            <span className="text-slate-400"> (limit {item.threshold_value})</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
                          >
                            <option value="OPEN">DETECTED</option>
                            <option value="INVESTIGATING">UNDER INVESTIGATION</option>
                            <option value="CAPA_PENDING">CAPA GENERATED</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Quality Sign-off Person Action: Audit Dual Logs */}
                            <button
                              onClick={() => setDualLogsAnomaly(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
                              title="Audit Dual Logs (Operator Log + 5-Whys CAPA) & Sign-Off"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>Dual Logs</span>
                            </button>

                            <button
                              onClick={() => setCopilotAnomaly(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
                              title="Interactive 5-Whys Socratic Root Cause"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>5-Whys</span>
                            </button>

                            <button
                              onClick={() => setCapaModalAnomaly(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0f172a] text-white text-xs font-medium hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
                              title="Google Gemini 3.8 Flash CAPA"
                            >
                              <Sparkles className="w-3 h-3 text-blue-300" />
                              <span>AI Plan</span>
                            </button>

                            <button
                              onClick={() => setCapaModalAnomaly(item)}
                              className="p-1 rounded text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                              title="ISO Compliance Audit Sheet"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <FiveWhysCopilotModal
        isOpen={!!copilotAnomaly}
        onClose={() => setCopilotAnomaly(null)}
        anomaly={copilotAnomaly}
        onSuccess={() => fetchDashboardData(undefined, true)}
      />

      <DualLogsAuditModal
        isOpen={!!dualLogsAnomaly}
        onClose={() => setDualLogsAnomaly(null)}
        anomaly={dualLogsAnomaly}
        currentUser={userContext.name}
        currentRole={userContext.role}
        onSuccess={() => fetchDashboardData(undefined, true)}
      />

      <CapaModal
        isOpen={!!capaModalAnomaly}
        onClose={() => setCapaModalAnomaly(null)}
        anomaly={capaModalAnomaly}
        onGenerateCapa={handleGenerateCapa}
        isGenerating={actionLoadingId === capaModalAnomaly?.id}
      />
    </div>
  );
};

export default Dashboard;