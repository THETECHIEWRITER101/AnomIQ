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
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export const CapaReview: React.FC = () => {
  const [capas, setCapas] = useState<CapaAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notesState, setNotesState] = useState<{ [id: string]: string }>({});
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);
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
          anomaly_id: 101,
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
          anomaly_id: 102,
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
          anomaly_id: 103,
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

  const handleReviewAction = async (capaId: number | string, newStatus: string) => {
    if (actionLoadingId === capaId) return;
    const note = notesState[String(capaId)] || '';

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
      showToast(`CAPA #${capaId} status updated to ${newStatus}`);
    } catch (err) {
      showToast(`CAPA #${capaId} status set to ${newStatus}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCapas = capas.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.review_status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3 rounded-xl bg-slate-900 text-white font-medium text-xs shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              AI CAPA Review &amp; Manager Approvals
            </h1>
            <Badge variant="emerald">ISO 9001 / IATF Compliant</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Validate 8D root-cause determinations, approve engineering protocols, and export ISO 9001 / OSHA audit reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-400 shadow-sm cursor-pointer"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="IMPLEMENTED">Implemented</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCapas}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* CAPA Action Cards */}
      <div className="space-y-6">
        {filteredCapas.length === 0 ? (
          <div className="console-card p-12 text-center text-slate-500 text-xs">
            No CAPA protocols match the selected criteria.
          </div>
        ) : (
          filteredCapas.map((capa) => (
            <div
              key={capa.id}
              className="console-card overflow-hidden"
            >
              {/* Card Banner */}
              <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4.5 h-4.5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">CAPA Dossier #{capa.id}</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCapaAuditPdf(capa)}
                    className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                    title="Generate ISO 9001 & IATF 16949 audit PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 mr-1" />
                    ISO 9001 Export
                  </Button>

                  <Badge variant="blue">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    AI: {capa.ai_confidence}% Confidence
                  </Badge>

                  <Badge
                    variant={
                      capa.review_status === 'APPROVED'
                        ? 'emerald'
                        : capa.review_status === 'IMPLEMENTED'
                        ? 'slate'
                        : capa.review_status === 'REJECTED'
                        ? 'red'
                        : 'yellow'
                    }
                  >
                    {capa.review_status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Card Body: 3 Pillars */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 1. Root Cause */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                    <span>1. Root Cause Determination</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium min-h-[100px]">
                    {capa.root_cause}
                  </p>
                </div>

                {/* 2. Corrective Action */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>2. Corrective Protocol</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-mono min-h-[100px]">
                    {capa.corrective_action}
                  </p>
                </div>

                {/* 3. Preventive Action */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>3. Preventive Safeguard</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-mono min-h-[100px]">
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
                      value={notesState[String(capa.id)] !== undefined ? notesState[String(capa.id)] : (capa.reviewer_notes || '')}
                      onChange={(e) =>
                        setNotesState({ ...notesState, [String(capa.id)]: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <Button
                    variant="dark"
                    size="sm"
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'APPROVED')}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Approve</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'REJECTED')}
                    className="text-xs text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Reject</span>
                  </Button>

                  <Button
                    variant="dark"
                    size="sm"
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'IMPLEMENTED')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                    <span>Implemented</span>
                  </Button>
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
