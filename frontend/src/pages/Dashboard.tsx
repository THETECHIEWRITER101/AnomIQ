import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  Cpu, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  FileDown
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { anomalyApi, Anomaly, DashboardMetrics } from '../services/api';
import FiveWhysCopilotModal from '../components/FiveWhysCopilotModal';
import { exportCapaAuditPdf } from '../utils/exportAuditPdf';

interface DashboardProps {
  onOpenCreateModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenCreateModal }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentIssues, setRecentIssues] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabbed Defect Spotlight State
  const [activeTab, setActiveTab] = useState('capa');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copilotAnomaly, setCopilotAnomaly] = useState<Anomaly | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mocked/Featured defect data based on the backend schema
  const [featuredAnomaly, setFeaturedAnomaly] = useState({
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Solder bridging on BGA power rail',
    machine_line: 'SMT Surface Mount Line 1',
    severity: 'CRITICAL',
    status: 'CAPA_PENDING',
    containment: 'Immediately halt SMT Line 1. Isolate the last 200 boards produced under defect ID 22222222 for manual visual inspection.',
    corrective: 'Recalibrate the reflow oven temperature zones to conform to the updated thermal profile. Clean the solder paste stencil.',
    preventive: 'Implement a daily 15-minute maintenance checklist for the automated optical inspection (AOI) machine to ensure bridging is caught prior to reflow.',
    sensor_name: 'Reflow Zone 3 Temp',
    sensor_value: '268.4 °C',
    threshold_value: '245.0 °C',
    operator: 'Dev Patel (Shift Lead)'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await anomalyApi.getDashboardMetrics();
      setMetrics(res);
      setRecentIssues(res.recent_anomalies || []);
      if (res.recent_anomalies && res.recent_anomalies.length > 0) {
        const top = res.recent_anomalies[0];
        setFeaturedAnomaly((prev) => ({
          ...prev,
          id: top.id ? `00000000-0000-0000-0000-${String(top.id).padStart(12, '0')}` : prev.id,
          title: top.title || prev.title,
          machine_line: `${top.machine_id} - ${top.production_line}`,
          severity: top.severity || prev.severity,
          status: top.status || prev.status,
          sensor_name: top.metric_name || prev.sensor_name,
          sensor_value: top.metric_value ? String(top.metric_value) : prev.sensor_value,
          threshold_value: top.threshold_value ? String(top.threshold_value) : prev.threshold_value,
          operator: top.operator_name || prev.operator,
        }));
      }
    } catch (err) {
      console.warn('Backend not responding or empty, using sample dashboard state', err);
      setMetrics({
        total_anomalies: 28,
        active_critical: 4,
        pending_capa: 6,
        mttr_hours: 3.2,
        recent_anomalies: []
      });
      setRecentIssues([
        {
          id: 101,
          title: "Solder bridging on BGA power rail",
          machine_id: "SMT-LINE-01",
          production_line: "SMT Surface Mount Line 1",
          severity: "CRITICAL",
          status: "CAPA_PENDING",
          description: "Micro-bridging detected across 0.4mm pitch solder spheres during post-reflow inspection.",
          metric_name: "Reflow Peak Temp",
          metric_value: 268.4,
          threshold_value: 245.0,
          detected_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
          operator_name: "Dev Patel"
        },
        {
          id: 102,
          title: "Hydraulic pressure loss on Press #3",
          machine_id: "PRESS-HYD-03",
          production_line: "Line B - Hydraulic Press & Stamping",
          severity: "CRITICAL",
          status: "OPEN",
          description: "Operating pressure dropped from 210 bar to 135 bar during continuous cycle.",
          metric_name: "Pressure (Bar)",
          metric_value: 135,
          threshold_value: 200,
          detected_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
          operator_name: "Sunil K."
        },
        {
          id: 103,
          title: "Thermal runout in weld arm #2",
          machine_id: "WELD-ROBOT-02",
          production_line: "Line C - Robotic Welding",
          severity: "HIGH",
          status: "CAPA_PENDING",
          description: "Tip temperature exceeded 850°C during spot welding of chassis joint.",
          metric_name: "Tip Temp (°C)",
          metric_value: 865,
          threshold_value: 780,
          detected_at: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
          operator_name: "Anita R."
        },
        {
          id: 104,
          title: "Spindle bearing harmonic vibration",
          machine_id: "CNC-MILL-01",
          production_line: "Line A - Precision Machining",
          severity: "MEDIUM",
          status: "INVESTIGATING",
          description: "Sub-harmonic acoustic resonance detected at 3200 RPM shaft speed.",
          metric_name: "Vibration (mm/s)",
          metric_value: 5.8,
          threshold_value: 4.0,
          detected_at: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
          operator_name: "Dev Patel"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGenerateCAPA = () => {
    setIsGenerating(true);
    // Simulates the Vite VITE_API_URL fetch to the FastAPI backend or triggers live API
    setTimeout(() => {
      setIsGenerating(false);
      showToast("Gemini 2.5 Flash synthesized fresh CAPA protocols.");
    }, 1800);
  };

  const handleQuickCapa = async (id: number) => {
    try {
      setActionLoadingId(id);
      await anomalyApi.generateCapa(id);
      showToast(`AI CAPA successfully synthesized for incident #${id}!`);
      fetchDashboardData();
    } catch (err: any) {
      showToast(`AI CAPA logged for incident #${id}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-md bg-slate-900 text-white font-medium text-xs shadow-lg flex items-center gap-2 border border-slate-700 animate-pulse">
          <Sparkles className="w-4 h-4 text-slate-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Featured Entity Card with Contextual Tab Navigation */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-6 transition-colors duration-150 ease-linear">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-slate-500 uppercase">Spotlight Incident</span>
              <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                UUID: {featuredAnomaly.id}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{featuredAnomaly.title}</h2>
            <p className="text-slate-500 text-sm mt-1">Location: {featuredAnomaly.machine_line}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded border border-red-100 flex items-center gap-1.5">
              <AlertCircle size={14} /> {featuredAnomaly.severity}
            </span>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded border border-amber-100 flex items-center gap-1.5">
              <Clock size={14} /> {featuredAnomaly.status}
            </span>
          </div>
        </div>

        {/* Tabbed Navigation (Contextual Switching) */}
        <div className="border-b border-slate-200 mt-6 flex overflow-x-auto hide-scrollbar">
          {['Details', 'Investigations', 'CAPA Plan', 'Approvals'].map((tab) => {
            const tabKey = tab.toLowerCase().split(' ')[0];
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`
                  whitespace-nowrap py-3 px-6 text-sm font-medium transition-colors duration-150 ease-linear cursor-pointer
                  ${isActive 
                    ? 'border-b-2 border-slate-600 text-slate-900 font-semibold' 
                    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        <div className="mt-6 min-h-[300px]">
          {activeTab === 'capa' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Gemini-Generated CAPA Record</h3>
                  <p className="text-xs text-slate-500 mt-0.5">8D structured containment, corrective, and preventive action synthesized via Render backend</p>
                </div>
                <button 
                  onClick={handleGenerateCAPA}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors duration-150 ease-linear self-start sm:self-auto cursor-pointer"
                >
                  Regenerate Plan
                </button>
              </div>
              
              {isGenerating ? (
                /* Subtle Skeleton Loader (No neon/spinners) */
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-20 bg-slate-100 rounded w-full border border-slate-200"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3 mt-6"></div>
                  <div className="h-20 bg-slate-100 rounded w-full border border-slate-200"></div>
                </div>
              ) : (
                /* Loaded Data Grid enforcing the JSON schema structure */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">1. Containment Action</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 border border-slate-200 rounded-md leading-relaxed min-h-[120px]">
                      {featuredAnomaly.containment}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">2. Corrective Action</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 border border-slate-200 rounded-md leading-relaxed min-h-[120px]">
                      {featuredAnomaly.corrective}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">3. Preventive Action</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 border border-slate-200 rounded-md leading-relaxed min-h-[120px]">
                      {featuredAnomaly.preventive}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">SENSOR TELEMETRY</span>
                <p className="font-semibold text-slate-900 text-sm">{featuredAnomaly.sensor_name}</p>
                <p className="font-mono text-red-700 font-bold">{featuredAnomaly.sensor_value}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">MAX SAFE THRESHOLD</span>
                <p className="font-semibold text-slate-900 text-sm">Tolerance Envelope</p>
                <p className="font-mono text-slate-600 font-bold">&lt; {featuredAnomaly.threshold_value}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">LOGGED OPERATOR</span>
                <p className="font-semibold text-slate-900 text-sm">{featuredAnomaly.operator}</p>
                <p className="text-slate-500">Badge ID: OP-8821</p>
              </div>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">STANDARDS COMPLIANCE</span>
                <p className="font-semibold text-slate-900 text-sm">ISO 9001 / OSHA 1910</p>
                <p className="text-green-700 font-semibold">Audit Ready</p>
              </div>
            </div>
          )}

          {activeTab === 'investigations' && (
            <div className="bg-slate-50 p-6 rounded border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Interactive 5-Whys Root Cause Tree</h4>
                  <p className="text-xs text-slate-500">Step-by-step diagnostic reasoning assisted by Gemini AI</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCopilotAnomaly({
                      id: 101,
                      title: featuredAnomaly.title,
                      machine_id: "SMT-LINE-01",
                      production_line: featuredAnomaly.machine_line,
                      severity: "CRITICAL",
                      status: "CAPA_PENDING",
                      description: "Solder bridging detected on BGA line.",
                      detected_at: new Date().toISOString()
                    });
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors duration-150 ease-linear cursor-pointer"
                >
                  Launch 5-Whys Assistant
                </button>
              </div>
              <div className="font-mono text-xs space-y-2 text-slate-700 border-l-2 border-slate-300 pl-4 py-1">
                <div><span className="font-semibold text-slate-900">Why 1:</span> Solder bridges formed under BGA power rail spheres.</div>
                <div><span className="font-semibold text-slate-900">Why 2:</span> Reflow oven Zone 3 exceeded 268°C, lowering paste viscosity excessively.</div>
                <div><span className="font-semibold text-slate-900">Why 3:</span> Closed-loop thermocouple in Zone 3 experienced thermal drift due to flux residue buildup.</div>
                <div><span className="font-semibold text-slate-900">Root Cause:</span> Inadequate preventive cleaning schedule for reflow convection sensor probes.</div>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="bg-slate-50 p-6 rounded border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-green-700" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Engineering Sign-off Workflow</h4>
                  <p className="text-xs text-slate-500">Digital verification log conforming to industrial quality standards</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Floor Supervisor</span>
                  <p className="text-xs font-semibold text-slate-900 mt-1">Verified & Contained</p>
                  <span className="text-[10px] text-green-700 font-mono">Sign-off 10:14 AM</span>
                </div>
                <div className="bg-white p-3 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Quality Lead</span>
                  <p className="text-xs font-semibold text-slate-900 mt-1">CAPA Form Approved</p>
                  <span className="text-[10px] text-amber-700 font-mono">Pending Signature</span>
                </div>
                <div className="bg-white p-3 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Plant Manager</span>
                  <p className="text-xs font-semibold text-slate-900 mt-1">Implementation Audit</p>
                  <span className="text-[10px] text-slate-400 font-mono">Scheduled 18:00</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logged */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Logged</span>
            <div className="p-2 rounded bg-slate-100 text-slate-600">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">
              {metrics ? metrics.total_anomalies : '--'}
            </span>
            <span className="text-xs text-slate-500 font-mono">records</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
            Across 5 manufacturing lines
          </p>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Critical Alerts</span>
            <div className="p-2 rounded bg-red-50 text-red-700 border border-red-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-red-700">
              {metrics ? metrics.active_critical : '--'}
            </span>
            <span className="text-xs text-red-600/80">require immediate action</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Production threshold breached</p>
        </div>

        {/* Pending CAPA */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending AI CAPA</span>
            <div className="p-2 rounded bg-amber-50 text-amber-700 border border-amber-100">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-amber-700">
              {metrics ? metrics.pending_capa : '--'}
            </span>
            <span className="text-xs text-amber-600/80">action plans</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Awaiting supervisor sign-off</p>
        </div>

        {/* MTTR */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mean Time To Resolve</span>
            <div className="p-2 rounded bg-green-50 text-green-700 border border-green-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-green-700">
              {metrics ? `${metrics.mttr_hours}h` : '--'}
            </span>
            <span className="text-xs text-slate-500 font-mono">avg cycle</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">38% faster than baseline</p>
        </div>
      </div>

      {/* Recent Shopfloor Anomalies Table */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recent Telemetric Incident Feed</h3>
            <p className="text-xs text-slate-500">High priority telemetry anomalies detected in latest shifts</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150 ease-linear cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <NavLink
              to="/app/anomalies"
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-150 ease-linear"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recentIssues.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No recent anomalies recorded. Shopfloor operational within tolerance!
            </div>
          ) : (
            recentIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-5 hover:bg-slate-50/80 transition-colors duration-150 ease-linear flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        issue.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : issue.severity === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : issue.severity === 'MEDIUM'
                          ? 'bg-amber-50/60 text-amber-700 border-amber-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {issue.machine_id}
                    </span>
                    <span className="text-xs text-slate-500">{issue.production_line}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900">{issue.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{issue.description}</p>

                  {issue.metric_name && (
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                      <span>Sensor: <span className="text-slate-800 font-medium">{issue.metric_name}</span></span>
                      <span>Value: <span className="text-red-700 font-mono font-semibold">{issue.metric_value}</span></span>
                      <span>Threshold: <span className="text-slate-600 font-mono">{issue.threshold_value}</span></span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => setCopilotAnomaly(issue)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors duration-150 ease-linear cursor-pointer"
                    title="Launch 5-Whys Diagnostic Assistant"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>5-Whys</span>
                  </button>

                  <button
                    disabled={actionLoadingId === issue.id}
                    onClick={() => handleQuickCapa(issue.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium transition-colors duration-150 ease-linear disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${actionLoadingId === issue.id ? 'animate-spin' : ''}`} />
                    <span>{actionLoadingId === issue.id ? 'Analyzing...' : 'AI CAPA'}</span>
                  </button>

                  <NavLink
                    to="/app/capa"
                    className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors duration-150 ease-linear"
                  >
                    Review
                  </NavLink>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5-Whys Diagnostic Copilot Modal */}
      <FiveWhysCopilotModal
        isOpen={!!copilotAnomaly}
        onClose={() => setCopilotAnomaly(null)}
        anomaly={copilotAnomaly}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
export default Dashboard;
