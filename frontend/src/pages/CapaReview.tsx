import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  MessageSquare,
  FileCheck2,
  RefreshCw,
  FileDown
} from 'lucide-react';
import { anomalyApi, CapaAction } from '../services/api';
import { exportCapaAuditPdf } from '../utils/exportAuditPdf';

export const CapaReview: React.FC = () => {
  const [capas, setCapas] = useState<CapaAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notesState, setNotesState] = useState<{ [id: number]: string }>({});
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCapas = async () => {
    try {
      setLoading(true);
      const data = await anomalyApi.getCapaReviews();
      setCapas(data);
    } catch (err) {
      console.warn('Backend unavailable, using initial demo CAPA actions', err);
      setCapas([
        {
          id: 1,
          anomaly_id: 1,
          root_cause: "Excessive thermal profile in reflow Zone 3 caused by flux accumulation on RTD sensor probes, leading to solder slump and bridging across adjacent BGA balls.",
          containment_action: "Halt SMT Line 1. Isolate the last 200 boards produced under defect batch for manual visual inspection.",
          corrective_action: "Recalibrate the reflow oven temperature zones to conform to the updated thermal profile. Clean and align solder paste stencil.",
          preventive_action: "Implement a daily 15-minute maintenance checklist for the automated optical inspection (AOI) machine to ensure bridging is caught prior to reflow.",
          ai_confidence: 94.8,
          review_status: "PENDING_REVIEW",
          generated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          reviewer_notes: ""
        },
        {
          id: 2,
          anomaly_id: 2,
          root_cause: "High-pressure polyurethane seal extrusion in the main cylinder port block caused by thermal oil degradation and particulate contamination.",
          containment_action: "Depressurize hydraulic circuit and tag out pump station pending inspection.",
          corrective_action: "Replace manifold o-rings and cylinder seals with Viton 90 durometer high-temp rings. Filter hydraulic reservoir to ISO 4406 standard.",
          preventive_action: "Install in-line kidney-loop filtration unit with beta-200 water absorption element. Schedule bi-weekly oil spectroscopic sampling.",
          ai_confidence: 91.2,
          review_status: "APPROVED",
          generated_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          reviewer_notes: "Approved by Plant Head. Maintenance scheduled for shift changeover at 18:00."
        },
        {
          id: 3,
          anomaly_id: 3,
          root_cause: "Internal coolant channel blockage in copper alloy electrode arm tip causing localized thermal dissipation collapse during repetitive spot resistance welds.",
          containment_action: "Quarantine welded batch lots 402 through 415 for non-destructive ultrasonic peel tests.",
          corrective_action: "Acid flush cooling conduits with scale remover. Replace calcified electrode holder tip and verify chiller flow rate reaches > 4.5 L/min.",
          preventive_action: "Add vortex flow meter with digital interlock to Robot #2 PLC. Stop automatic cycle if coolant flow drops below 3.8 L/min.",
          ai_confidence: 88.5,
          review_status: "IMPLEMENTED",
          generated_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
          reviewer_notes: "Cooling system descaled and vortex sensor commissioned. Verification successful."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapas();
  }, []);

  const handleReviewAction = async (capaId: number, newStatus: string) => {
    if (actionLoadingId === capaId) return;
    const previousCapas = [...capas];
    const note = notesState[capaId] || '';

    setCapas((prev) =>
      prev.map((c) =>
        c.id === capaId
          ? {
              ...c,
              review_status: newStatus as any,
              reviewer_notes: note || c.reviewer_notes,
              reviewed_at: new Date().toISOString(),
            }
          : c
      )
    );

    try {
      setActionLoadingId(capaId);
      await anomalyApi.updateCapaStatus(capaId, newStatus, note);
      showToast(`CAPA #${capaId} marked as ${newStatus}.`);
    } catch (err: any) {
      setCapas(previousCapas);
      showToast('Network error: Could not update CAPA status. Reverting change.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCapas = capas.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.review_status === statusFilter;
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              AI CAPA Review & Manager Approvals
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Validate 8D root-cause determinations, approve engineering protocols, and export ISO 9001 / OSHA audit reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-md text-slate-900 text-xs focus:outline-none focus:border-slate-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="IMPLEMENTED">Implemented</option>
          </select>

          <button
            onClick={fetchCapas}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors duration-150 ease-linear shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* CAPA Action Cards */}
      <div className="space-y-6">
        {filteredCapas.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 shadow-sm">
            No CAPA protocols match the selected criteria.
          </div>
        ) : (
          filteredCapas.map((capa) => (
            <div
              key={capa.id}
              className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Card Banner */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white border border-slate-200 text-slate-700">
                    <Sparkles className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-base">CAPA Record #{capa.id}</span>
                      <span className="text-slate-500 text-xs font-mono">
                        (Anomaly #{capa.anomaly_id})
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">
                      Synthesized: {new Date(capa.generated_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* ISO 9001 / OSHA PDF Export Button */}
                  <button
                    type="button"
                    onClick={() => exportCapaAuditPdf(capa)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-medium transition-colors duration-150 ease-linear shadow-xs cursor-pointer"
                    title="Generate client-side ISO 9001 & OSHA 1910 formal audit report PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>ISO 9001 Export</span>
                  </button>

                  {/* Confidence Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>AI: {capa.ai_confidence}%</span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                      capa.review_status === 'APPROVED'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : capa.review_status === 'IMPLEMENTED'
                        ? 'bg-slate-100 text-slate-800 border-slate-200'
                        : capa.review_status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {capa.review_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Card Body: 3 Pillars */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Root Cause */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                    <span>1. Root Cause Determination</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200 min-h-[120px]">
                    {capa.root_cause}
                  </p>
                </div>

                {/* 2. Corrective Action */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    <span>2. Corrective Protocol</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200 min-h-[120px]">
                    {capa.corrective_action}
                  </p>
                </div>

                {/* 3. Preventive Action */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>3. Preventive Safeguard</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200 min-h-[120px]">
                    {capa.preventive_action}
                  </p>
                </div>
              </div>

              {/* Reviewer Section */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={
                        capa.reviewer_notes
                          ? `Signoff Notes: ${capa.reviewer_notes}`
                          : "Add manager approval notes / compliance verification..."
                      }
                      value={notesState[capa.id] !== undefined ? notesState[capa.id] : (capa.reviewer_notes || '')}
                      onChange={(e) =>
                        setNotesState({ ...notesState, [capa.id]: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors duration-150 ease-linear"
                    />
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'APPROVED')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-green-700 hover:bg-green-800 text-white font-medium text-xs transition-colors duration-150 ease-linear shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'REJECTED')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white hover:bg-red-50 text-red-700 border border-red-200 font-medium text-xs transition-colors duration-150 ease-linear disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'IMPLEMENTED')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors duration-150 ease-linear shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Implemented</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default CapaReview;
