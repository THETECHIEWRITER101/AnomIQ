import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  MessageSquare,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { anomalyApi, CapaAction } from '../services/api';

export const CapaReview: React.FC = () => {
  const [capas, setCapas] = useState<CapaAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notesState, setNotesState] = useState<{ [id: number]: string }>({});
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchCapas = async () => {
    try {
      setLoading(true);
      const data = await anomalyApi.getCapaReviews();
      setCapas(data);
    } catch (err) {
      console.warn('Backend unavailable, using initial demo CAPA actions', err);
      // Fallback demo CAPA actions
      setCapas([
        {
          id: 1,
          anomaly_id: 1,
          root_cause: "Fatigue spalling on the inner race of the drive-end angular contact spindle bearing due to lubricant starvation during high-speed cycle runs.",
          corrective_action: "Immediately halt Line A milling sequence. Flush lubrication reservoir, inspect spindle runout, and replace dual-row bearing assembly with OEM SKF 7014-CD/P4A.",
          preventive_action: "Upgrade automated oil-air mister nozzle frequency from 15-min intervals to continuous micro-metering. Integrate vibration edge-sensor trip threshold at 6.0 mm/s.",
          ai_confidence: 94.8,
          review_status: "PENDING_REVIEW",
          generated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          reviewer_notes: ""
        },
        {
          id: 2,
          anomaly_id: 2,
          root_cause: "High-pressure polyurethane seal extrusion in the main cylinder port block caused by thermal oil degradation and particulate contamination.",
          corrective_action: "Depressurize hydraulic circuit. Replace manifold o-rings and cylinder seals with Viton 90 durometer high-temp rings. Filter hydraulic reservoir to ISO 4406 16/14/11 standard.",
          preventive_action: "Install in-line kidney-loop filtration unit with beta-200 water absorption element. Schedule bi-weekly oil dielectric and particulate spectroscopic sampling.",
          ai_confidence: 91.2,
          review_status: "APPROVED",
          generated_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          reviewer_notes: "Approved by Plant Head. Maintenance scheduled for shift changeover at 18:00."
        },
        {
          id: 3,
          anomaly_id: 3,
          root_cause: "Internal coolant channel blockage in copper alloy electrode arm tip causing localized thermal dissipation collapse during repetitive spot resistance welds.",
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
    try {
      setActionLoadingId(capaId);
      const note = notesState[capaId] || '';
      await anomalyApi.updateCapaStatus(capaId, newStatus, note);
      await fetchCapas();
    } catch (err: any) {
      // Optimistic update
      setCapas((prev) =>
        prev.map((c) =>
          c.id === capaId
            ? {
                ...c,
                review_status: newStatus as any,
                reviewer_notes: notesState[capaId] || c.reviewer_notes,
                reviewed_at: new Date().toISOString()
              }
            : c
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCapas = capas.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.review_status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI CAPA Review & Manager Approval
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Gemini Powered
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Validate automated root cause determinations and approve corrective/preventive protocols
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="IMPLEMENTED">Implemented</option>
          </select>

          <button
            onClick={fetchCapas}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-xs hover:bg-zinc-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* CAPA Action Cards */}
      <div className="space-y-6">
        {filteredCapas.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            No CAPA protocols match the selected criteria.
          </div>
        ) : (
          filteredCapas.map((capa) => (
            <div
              key={capa.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Card Banner */}
              <div className="px-6 py-4 bg-zinc-950/70 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-orange-500/30 text-orange-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">CAPA #{capa.id}</span>
                      <span className="text-zinc-500 text-xs font-mono">
                        (Ref Anomaly #{capa.anomaly_id})
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[11px]">
                      Synthesized: {new Date(capa.generated_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Confidence Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AI Confidence: {capa.ai_confidence}%</span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      capa.review_status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : capa.review_status === 'IMPLEMENTED'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : capa.review_status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {capa.review_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Card Body: 3 Pillars */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
                {/* 1. Root Cause */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>1. Root Cause Identification</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                    {capa.root_cause}
                  </p>
                </div>

                {/* 2. Corrective Action */}
                <div className="space-y-2 pt-4 lg:pt-0 lg:pl-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2. Immediate Corrective Action</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                    {capa.corrective_action}
                  </p>
                </div>

                {/* 3. Preventive Action */}
                <div className="space-y-2 pt-4 lg:pt-0 lg:pl-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. Long-term Preventive Action</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                    {capa.preventive_action}
                  </p>
                </div>
              </div>

              {/* Reviewer Section */}
              <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
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
                      className="w-full pl-10 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'APPROVED')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </button>

                  <button
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'IMPLEMENTED')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Implemented
                  </button>

                  <button
                    disabled={actionLoadingId === capa.id}
                    onClick={() => handleReviewAction(capa.id, 'REJECTED')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
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
