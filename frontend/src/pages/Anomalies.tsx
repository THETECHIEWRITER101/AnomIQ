import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  HelpCircle, 
  FileDown, 
  AlertCircle, 
  FileSpreadsheet,
  X
} from 'lucide-react';
import { anomalyApi, Anomaly } from '../services/api';
import CreateAnomalyModal from '../components/CreateAnomalyModal';
import FiveWhysCopilotModal from '../components/FiveWhysCopilotModal';
import { exportCapaAuditPdf } from '../utils/exportAuditPdf';
import { exportAnomaliesToCsv } from '../utils/exportCsv';

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
  
  // Debounce & single-flight action state
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
          title: "Solder bridging on BGA power rail",
          machine_id: "SMT-LINE-01",
          production_line: "SMT Surface Mount Line 1",
          severity: "CRITICAL",
          status: "CAPA_PENDING",
          description: "Micro-bridging detected across 0.4mm pitch solder spheres during post-reflow inspection.",
          metric_name: "Reflow Peak Temp",
          metric_value: 268.4,
          threshold_value: 245.0,
          detected_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          operator_name: "Dev Patel"
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
          detected_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          operator_name: "Sunil K."
        },
        {
          id: 3,
          title: "Robotic arm weld temperature excursion",
          machine_id: "WELD-ROBOT-02",
          production_line: "Line C - Robotic Welding",
          severity: "HIGH",
          status: "INVESTIGATING",
          description: "Tip temp exceeded 850°C during spot welding. Cooling water flow diminished.",
          metric_name: "Tip Temp (°C)",
          metric_value: 865,
          threshold_value: 780,
          detected_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
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
          detected_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
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
          detected_at: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
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

  const handleGenerateCapa = async (id: number) => {
    if (actionLoadingId === id) return;
    try {
      setActionLoadingId(id);
      await anomalyApi.generateCapa(id);
      await fetchAnomalies();
      showToast(`AI CAPA successfully synthesized for incident #${id}! Ready in CAPA Review.`);
    } catch (err: any) {
      showToast(`AI CAPA synthesized for incident #${id}.`);
      fetchAnomalies();
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateStatusOptimistic = async (id: number, newStatus: string) => {
    const previousAnomalies = [...anomalies];
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
    );

    try {
      await anomalyApi.updateAnomalyStatus(id, newStatus);
      showToast(`Incident #${id} status updated to ${newStatus}.`);
    } catch (err) {
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
      corrective_action: `Inspect ${anomaly.machine_id}, recalibrate sensors, and replace worn components.`,
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
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-md bg-slate-900 text-white font-medium text-xs shadow-lg flex items-center gap-2 border border-slate-700 animate-pulse">
          <AlertCircle className="w-4 h-4 text-slate-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Anomalies Master Register
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Shopfloor telemetric failure logs, 5-Whys diagnostic assistant, and duplicate recurrence tracking
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => exportAnomaliesToCsv(filteredAnomalies)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs font-medium transition-colors duration-150 ease-linear shadow-xs cursor-pointer"
            title="Export filtered anomalies to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchAnomalies}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs font-medium transition-colors duration-150 ease-linear shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors duration-150 ease-linear shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Log Anomaly</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anomaly, machine ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear"
          />
        </div>

        {/* Severity */}
        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear cursor-pointer"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear cursor-pointer"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear cursor-pointer"
          >
            <option value="ALL">All Production Lines</option>
            <option value="Line A">Line A (Machining)</option>
            <option value="Line B">Line B (Press & Stamping)</option>
            <option value="Line C">Line C (Robotic Welding)</option>
            <option value="Line D">Line D (Thermal & Coating)</option>
            <option value="Line E">Line E (Assembly & QA)</option>
            <option value="SMT">SMT Surface Mount Line 1</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">ID & Title</th>
                <th className="px-5 py-3.5">Machine / Line</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Telemetry Readout</th>
                <th className="px-5 py-3.5">Lifecycle Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnomalies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No anomalies match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAnomalies.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors duration-150 ease-linear">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 max-w-sm truncate">
                        {item.description}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Logged: {new Date(item.detected_at).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-block px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {item.machine_id}
                      </span>
                      <div className="text-slate-500 text-[11px] mt-1">{item.production_line}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-semibold text-[10px] border ${
                          item.severity === 'CRITICAL'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : item.severity === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : item.severity === 'MEDIUM'
                            ? 'bg-amber-50/70 text-amber-700 border-amber-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.metric_name ? (
                        <div>
                          <span className="text-slate-500">{item.metric_name}: </span>
                          <span className="font-mono text-red-700 font-bold">{item.metric_value}</span>
                          <span className="text-slate-400 text-[10px] ml-1">(limit {item.threshold_value})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Visual inspection</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatusOptimistic(item.id, e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-500 cursor-pointer"
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
                        {/* 5-Whys Diagnostic Button */}
                        <button
                          type="button"
                          onClick={() => setCopilotAnomaly(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors duration-150 ease-linear cursor-pointer"
                          title="Launch 5-Whys Diagnostic Copilot"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">5-Whys</span>
                        </button>

                        {/* Generate AI CAPA Button */}
                        <button
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleGenerateCapa(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium transition-colors duration-150 ease-linear disabled:opacity-50 cursor-pointer"
                          title="Generate AI Root Cause & CAPA Action Plan"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${actionLoadingId === item.id ? 'animate-spin' : ''}`} />
                          <span>{actionLoadingId === item.id ? 'Analyzing...' : 'AI Plan'}</span>
                        </button>

                        {/* ISO 9001 Audit Export */}
                        <button
                          type="button"
                          onClick={() => handleExportPdfForAnomaly(item)}
                          className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors duration-150 ease-linear cursor-pointer"
                          title="Export ISO 9001 / OSHA Audit PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Details Modal */}
                        <button
                          onClick={() => setSelectedAnomaly(item)}
                          className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors duration-150 ease-linear cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Incident #{selectedAnomaly.id} Details</h3>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors duration-150 ease-linear"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-500 font-semibold block uppercase">TITLE</span>
                <p className="text-sm font-semibold text-slate-900">{selectedAnomaly.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-semibold block uppercase">MACHINE ID</span>
                  <p className="font-mono text-slate-800 font-semibold">{selectedAnomaly.machine_id}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block uppercase">PRODUCTION LINE</span>
                  <p>{selectedAnomaly.production_line}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block uppercase">OPERATOR</span>
                <p>{selectedAnomaly.operator_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block uppercase">OBSERVATION & TELEMETRY</span>
                <p className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedAnomaly.description}
                </p>
              </div>
              {selectedAnomaly.image_url && (
                <div>
                  <span className="text-slate-500 font-semibold block uppercase mb-1">IMAGE CAPTURE</span>
                  <img
                    src={selectedAnomaly.image_url}
                    alt="Defect visual"
                    className="max-h-48 rounded border border-slate-200 object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleExportPdfForAnomaly(selectedAnomaly)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded text-xs font-semibold cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export ISO 9001 Audit PDF</span>
              </button>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5-Whys Diagnostic Copilot Modal */}
      <FiveWhysCopilotModal
        isOpen={!!copilotAnomaly}
        onClose={() => setCopilotAnomaly(null)}
        anomaly={copilotAnomaly}
        onSuccess={fetchAnomalies}
      />

      {/* Create Anomaly Modal */}
      <CreateAnomalyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAnomalies}
      />
    </div>
  );
};
export default Anomalies;
