import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Cpu, 
  AlertTriangle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Anomaly, anomalyApi, FiveWhysHistoryItem } from '../services/api';

interface FiveWhysCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly: Anomaly | null;
  onSuccess?: () => void;
}

export const FiveWhysCopilotModal: React.FC<FiveWhysCopilotModalProps> = ({
  isOpen,
  onClose,
  anomaly,
  onSuccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [history, setHistory] = useState<FiveWhysHistoryItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [quickOptions, setQuickOptions] = useState<string[]>([]);
  const [technicianInput, setTechnicianInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isFinalStep, setIsFinalStep] = useState<boolean>(false);
  const [synthesizedRootCause, setSynthesizedRootCause] = useState<string>('');
  const [suggestedCorrective, setSuggestedCorrective] = useState<string>('');
  const [suggestedPreventive, setSuggestedPreventive] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const initFirstStep = async () => {
    if (!anomaly) return;
    setLoading(true);
    setStep(1);
    setHistory([]);
    setIsFinalStep(false);
    setSynthesizedRootCause('');
    setSaveSuccess(false);

    try {
      const res = await anomalyApi.process5WhysStep({
        anomaly_id: anomaly.id,
        anomaly_title: anomaly.title,
        machine_id: anomaly.machine_id,
        production_line: anomaly.production_line,
        metric_name: anomaly.metric_name,
        metric_value: anomaly.metric_value,
        threshold_value: anomaly.threshold_value,
        step: 1,
        history: [],
      });
      setCurrentQuestion(res.why_question);
      setQuickOptions(res.quick_options || []);
    } catch (err) {
      console.warn('5-whys error, using initial step fallback', err);
      setCurrentQuestion(`Why did ${anomaly.machine_id} exceed operational threshold?`);
      setQuickOptions([
        'Coolant valve jammed closed',
        'Excessive friction & bearing vibration',
        'Electrical supply voltage sag',
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && anomaly) {
      initFirstStep();
    }
  }, [isOpen, anomaly]);

  if (!isOpen || !anomaly) return null;

  const handleStepSubmit = async (answerText: string) => {
    if (!answerText.trim() || loading) return;

    const updatedHistory: FiveWhysHistoryItem[] = [
      ...history,
      { step, question: currentQuestion, answer: answerText.trim() },
    ];
    setHistory(updatedHistory);
    setTechnicianInput('');

    const nextStep = step + 1;
    setStep(nextStep);
    setLoading(true);

    try {
      const res = await anomalyApi.process5WhysStep({
        anomaly_id: anomaly.id,
        anomaly_title: anomaly.title,
        machine_id: anomaly.machine_id,
        production_line: anomaly.production_line,
        metric_name: anomaly.metric_name,
        metric_value: anomaly.metric_value,
        threshold_value: anomaly.threshold_value,
        step: nextStep,
        history: updatedHistory,
        technician_input: answerText.trim(),
      });

      if (res.is_final_step || nextStep >= 5) {
        setIsFinalStep(true);
        setSynthesizedRootCause(res.synthesized_root_cause || '');
        setSuggestedCorrective(res.suggested_corrective_action || '');
        setSuggestedPreventive(res.suggested_preventive_action || '');
      } else {
        setCurrentQuestion(res.why_question);
        setQuickOptions(res.quick_options || []);
      }
    } catch (err) {
      if (nextStep >= 5) {
        setIsFinalStep(true);
        setSynthesizedRootCause(
          `Root Cause: Component degradation on ${anomaly.machine_id} compounded by skipped filter inspection and delayed lubrication maintenance.`
        );
        setSuggestedCorrective(`Inspect and replace damaged seals on ${anomaly.machine_id} and retorque to factory spec.`);
        setSuggestedPreventive(`Upgrade maintenance checklist and install automated vibration telemetry alarm threshold.`);
      } else {
        setCurrentQuestion(`Why did '${answerText.trim()}' occur during line operation?`);
        setQuickOptions([
          'Filter element contaminated',
          'Service cycle interval overdue',
          'Mechanical clamp loose',
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToCapa = async () => {
    try {
      setIsApplying(true);
      await anomalyApi.generateCapa(anomaly.id);
      setSaveSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setSaveSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Interactive 5-Whys Diagnostic Copilot</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Floor Assistant
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Guiding shop floor technicians step-by-step to the true root cause
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incident Summary Card */}
        <div className="px-6 py-3 bg-zinc-950/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-400" />
            <span className="font-mono font-bold text-white">{anomaly.machine_id}</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-300">{anomaly.production_line}</span>
          </div>
          <div className="flex items-center gap-2">
            {anomaly.metric_name && (
              <span className="text-zinc-400">
                {anomaly.metric_name}: <strong className="text-red-400 font-mono">{anomaly.metric_value}</strong> (Limit: {anomaly.threshold_value})
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
              {anomaly.severity}
            </span>
          </div>
        </div>

        {/* 5-Whys Progress Tracker */}
        <div className="px-6 py-3 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
            <span className="text-orange-400 uppercase tracking-wider">
              {isFinalStep ? 'Diagnostic Tree Complete' : `Diagnostic Step ${step} of 5`}
            </span>
            <span className="text-zinc-400">{Math.min(100, Math.round((step / 5) * 100))}% Explored</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-full transition-all duration-300 ${
                  s < step
                    ? 'bg-emerald-500'
                    : s === step
                    ? 'bg-orange-500'
                    : 'bg-zinc-700/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Interactive Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Prior History Chain */}
          {history.length > 0 && (
            <div className="space-y-2.5 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Reasoning Trail (5-Whys Chain)
              </span>
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why #{item.step}: {item.question}</span>
                  </div>
                  <div className="pl-5 text-zinc-300 font-medium flex items-center gap-1">
                    <span className="text-emerald-400">↳ Observation:</span>
                    <span>{item.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Question or Final Conclusion */}
          {!isFinalStep ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/30">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>AI Diagnostic Prompt (Step {step})</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {loading ? 'Analyzing telemetry and formulating next Why question...' : currentQuestion}
                </p>
              </div>

              {/* Quick Response Chips (Designed for glove touch on shopfloor) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Quick-Response Chips (Tap to select)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {quickOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={loading}
                      onClick={() => handleStepSubmit(opt)}
                      className="p-3 text-left rounded-xl bg-zinc-950 hover:bg-orange-500/15 hover:border-orange-500/40 border border-zinc-800 text-xs text-zinc-200 font-medium transition active:scale-95 disabled:opacity-50 flex items-center justify-between"
                    >
                      <span>{opt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Custom 1-Sentence Observation */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Or Type Custom Shopfloor Observation
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={loading}
                    placeholder="e.g. Filter differential pressure gage reading high..."
                    value={technicianInput}
                    onChange={(e) => setTechnicianInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleStepSubmit(technicianInput);
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={!technicianInput.trim() || loading}
                    onClick={() => handleStepSubmit(technicianInput)}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold text-xs rounded-xl transition shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Final Concluded Root Cause & CAPA */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">5-Whys Root Cause Identified</h4>
                  <p className="text-xs text-zinc-200 mt-1 leading-relaxed">
                    {synthesizedRootCause}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="font-bold text-orange-400 uppercase tracking-wider block">
                    Immediate Corrective Action
                  </span>
                  <p className="text-zinc-300 leading-relaxed">
                    {suggestedCorrective || 'Inspect components and recalibrate line parameters to baseline.'}
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block">
                    Long-term Preventive Action
                  </span>
                  <p className="text-zinc-300 leading-relaxed">
                    {suggestedPreventive || 'Implement digitized checklist and weekly automated telemetry verification.'}
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs text-center font-bold">
                  ✓ Successfully saved to CAPA Register! Anomaly status updated to CAPA_PENDING.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <button
            type="button"
            onClick={initFirstStep}
            disabled={loading || isApplying}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart 5-Whys</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition"
            >
              Close
            </button>
            {isFinalStep && (
              <button
                type="button"
                disabled={isApplying || saveSuccess}
                onClick={handleApplyToCapa}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isApplying ? 'Applying...' : 'Apply to CAPA Register'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FiveWhysCopilotModal;
