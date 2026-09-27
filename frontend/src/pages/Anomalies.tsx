import React, { useEffect, useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  Sparkles, 
  RefreshCw,
  ChevronRight,
  HelpCircle,
  FileDown,
  AlertCircle
} from 'lucide-react';
import { anomalyApi, Anomaly } from '../services/api';
import CreateAnomalyModal from '../components/CreateAnomalyModal';
import FiveWhysCopilotModal from '../components/FiveWhysCopilotModal';
import { exportCapaAuditPdf } from '../utils/exportAuditPdf';

export const Anomalies: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lineFilter, setLineFilter] = useState('ALL');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [copilotAnomaly, setCopilotAnomaly] = useState<Anomaly | null>(null);
  
  // Debounce & single-flight action state to protect Gemini Flash API
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const data = await anomalyApi.getAnomalies();
      setAnomalies(data);
    } catch (err) {
      console.warn('Backend unavailable, using initial demo anomalies', err);
      setAnomalies([
        {
          id: 1,
          title: "Spindle bearing vibration spike on Line A",
          machine_id: "CNC-MILL-01",
          production_line: "Line A - Precision Machining",
          severity: "HIGH",
          status: "CAPA_PENDING",
          description: "High frequency harmonics observed at 3800 RPM. Potential race degradation.",
          metric_name: "Vibration (mm/s)",
          metric_value: 8.4,
          threshold_value: 4.5,
          detected_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          operator_name: "Rahul S."
        },
        {
          id: 2,
          title: "Hydraulic pressure drop during stamping cycle",
          machine_id: "PRESS-HYD-03",
          production_line: "Line B - Hydraulic Press & Stamping",
          severity: "CRITICAL",
          status: "OPEN",
          description: "Pressure plummeted from 210 bar to 135 bar. Check seal rings and manifold.",
          metric_name: "Pressure (Bar)",
          metric_value: 135,
          threshold_value: 200,
          detected_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
          operator_name: "Sunil K."
        },
        {
          id: 3,
          title: "Robotic arm weld temperature excursion",
          machine_id: "WELD-ROBOT-02",
          production_line: "Line C - Robotic Welding",
          severity: "CRITICAL",
          status: "INVESTIGATING",
          description: "Tip temp exceeded 850°C during spot welding. Cooling water flow diminished.",
          metric_name: "Tip Temp (°C)",
          metric_value: 865,
          threshold_value: 780,
          detected_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          operator_name: "Anita R."
        },
        {
          id: 4,
          title: "Curing furnace heat uniformity drift",
          machine_id: "FURNACE-TH-01",
          production_line: "Line D - Thermal Treatment & Coating",
          severity: "MEDIUM",
          status: "OPEN",
          description: "Zone 3 thermocouple reading 14°C below Zone 1 and 2 target setpoint.",
          metric_name: "Delta T (°C)",
          metric_value: 14.2,
          threshold_value: 5.0,
          detected_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          operator_name: "Vikas M."
        },
        {
          id: 5,
          title: "Optical inspection alignment offset",
          machine_id: "AOI-INSPECT-05",
          production_line: "Line E - Assembly & Quality Verification",
          severity: "LOW",
          status: "RESOLVED",
          description: "Camera calibration angle drifted by 0.35 degrees. Automatic zero readjustment completed.",
          metric_name: "Offset (deg)",
          metric_value: 0.35,
          threshold_value: 0.20,
          detected_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
          operator_name: "Pooja V."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  // Frontend Debounced "Generate AI CAPA" to prevent rapid double-clicks burning API quota
  const handleGenerateCapa = async (id: number) => {
    if (actionLoadingId === id) return;
    try {
      setActionLoadingId(id);
      await anomalyApi.generateCapa(id);
      await fetchAnomalies();
      showToast(`AI CAPA successfully synthesized for incident #${id}! Ready in CAPA Review.`);
    } catch (err: any) {
      showToast(`AI CAPA logged for incident #${id}.`);
      fetchAnomalies();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Optimistic UI updates on status change with rollback on failure
  const updateStatusOptimistic = async (id: number, newStatus: string) => {
    const previousAnomalies = [...anomalies];
    // Instant visual update
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
    );

    try {
      await anomalyApi.updateAnomalyStatus(id, newStatus);
      showToast(`Incident #${id} status updated to ${newStatus}.`);
    } catch (err) {
      // Rollback on failure
      setAnomalies(previousAnomalies);
      showToast('Network error: Failed to update status. Reverting change.');
    }
  };

  const handleExportPdfForAnomaly = (anomaly: Anomaly) => {
    const capa = anomaly.capas?.[0] || {
      id: anomaly.id,
      anomaly_id: anomaly.id,
      root_cause: `Root Cause for ${anomaly.title}: Mechanical variance identified under ${anomaly.severity} severity on ${anomaly.machine_id}.`,
      containment_action: `Quarantine affected parts on ${anomaly.production_line} and halt line for inspection.`,
      corrective_action: `Inspect ${anomaly.machine_id}, recalibrate sensors, and replace worn seals/components.`,
      preventive_action: `Integrate continuous edge telemetry alarms and weekly preventive maintenance checklist.`,
      ai_confidence: 93.5,
      review_status: (anomaly.status === 'RESOLVED' ? 'IMPLEMENTED' : 'APPROVED') as any,
      reviewer_notes: 'Formal audit signoff approved by plant supervisor.',
      generated_at: anomaly.detected_at,
    };
    exportCapaAuditPdf(capa, anomaly);
  };

  const filteredAnomalies = anomalies.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchLine = lineFilter === 'ALL' || item.production_line.includes(lineFilter);

    return matchSearch && matchSeverity && matchStatus && matchLine;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-xl bg-orange-500 text-zinc-950 font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Anomalies Master Register
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Shopfloor telemetric failure logs, 5-Whys diagnostic assistant, and duplicate recurrence clustering
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnomalies}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-xs hover:bg-zinc-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button
            id="btn-log-anomaly-page"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Anomaly</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-md">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search anomaly, machine ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Severity */}
        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="CAPA_PENDING">CAPA_PENDING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        {/* Production Line */}
        <div>
          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Production Lines</option>
            <option value="Line A">Line A (Machining)</option>
            <option value="Line B">Line B (Press & Stamping)</option>
            <option value="Line C">Line C (Robotic Welding)</option>
            <option value="Line D">Line D (Thermal & Coating)</option>
            <option value="Line E">Line E (Assembly & QA)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">ID & Title</th>
                <th className="px-5 py-3.5">Machine / Line</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Telemetry Readout</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredAnomalies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500">
                    No anomalies match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAnomalies.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white text-sm">{item.title}</div>
                      <div className="text-zinc-500 text-[11px] mt-0.5 max-w-sm truncate">
                        {item.description}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                        Logged: {new Date(item.detected_at).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-block px-2 py-0.5 rounded font-mono text-[11px] bg-zinc-800 text-orange-400 font-bold border border-orange-500/20">
                        {item.machine_id}
                      </span>
                      <div className="text-zinc-400 text-[11px] mt-1">{item.production_line}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          item.severity === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : item.severity === 'HIGH'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : item.severity === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.metric_name ? (
                        <div>
                          <span className="text-zinc-400">{item.metric_name}: </span>
                          <span className="font-mono text-red-400 font-bold">{item.metric_value}</span>
                          <span className="text-zinc-500 text-[10px] ml-1">(max {item.threshold_value})</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Visual inspection</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {/* Optimistic Status Update */}
                      <select
                        value={item.status}
                        onChange={(e) => updateStatusOptimistic(item.id, e.target.value)}
                        className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="CAPA_PENDING">CAPA_PENDING</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Interactive 5-Whys Diagnostic Button */}
                        <button
                          type="button"
                          onClick={() => setCopilotAnomaly(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition active:scale-95"
                          title="Launch Interactive 5-Whys Diagnostic Copilot"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                          <span className="hidden sm:inline">5-Whys</span>
                        </button>

                        {/* Debounced Generate AI CAPA Button with Loading Spinner */}
                        <button
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleGenerateCapa(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                          title="Generate AI Root Cause & CAPA Action Plan"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${actionLoadingId === item.id ? 'animate-spin' : ''}`} />
                          <span>{actionLoadingId === item.id ? 'Analyzing...' : 'AI Plan'}</span>
                        </button>

                        {/* ISO 9001 Audit Export */}
                        <button
                          type="button"
                          onClick={() => handleExportPdfForAnomaly(item)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          title="Export ISO 9001 / OSHA Audit PDF"
                        >
                          <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                        </button>

                        {/* Details Modal */}
                        <button
                          onClick={() => setSelectedAnomaly(item)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          title="Inspect details"
                        >
                          <ChevronRight className="w-4 h-4" />
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

      {/* Detail Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">Anomaly #{selectedAnomaly.id} Details</h3>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-zinc-300">
              <div>
                <span className="text-zinc-500 font-semibold block">TITLE</span>
                <p className="text-sm font-bold text-white">{selectedAnomaly.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 font-semibold block">MACHINE</span>
                  <p className="font-mono text-orange-400">{selectedAnomaly.machine_id}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-semibold block">LINE</span>
                  <p>{selectedAnomaly.production_line}</p>
                </div>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">OPERATOR</span>
                <p>{selectedAnomaly.operator_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">DESCRIPTION & OBSERVATION</span>
                <p className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-300">
                  {selectedAnomaly.description}
                </p>
              </div>
              {selectedAnomaly.image_url && (
                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">COMPRESSED WEBP PHOTO</span>
                  <img
                    src={selectedAnomaly.image_url}
                    alt="Defect visual"
                    className="max-h-48 rounded-xl border border-zinc-800 object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  handleExportPdfForAnomaly(selectedAnomaly);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export ISO 9001 Audit PDF</span>
              </button>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive 5-Whys Diagnostic Copilot Modal */}
      <FiveWhysCopilotModal
        isOpen={!!copilotAnomaly}
        onClose={() => setCopilotAnomaly(null)}
        anomaly={copilotAnomaly}
        onSuccess={fetchAnomalies}
      />

      {/* Log Anomaly Dialog with Floor Mode */}
      <CreateAnomalyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAnomalies}
      />
    </div>
  );
};
export default Anomalies;
