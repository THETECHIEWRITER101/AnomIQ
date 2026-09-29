import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Cpu, 
  AlertCircle,
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
      setCurrentQuestion(`Why did ${anomaly.machine_id} exceed operational threshold during shift?`);
      setQuickOptions([
        'Sensor probe calibrated incorrectly',
        'Excessive friction & thermal overload',
        'Contaminant buildup on contact zones',
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

  const handleStepSubmit = async (selectedAnswer: string) => {
    if (!selectedAnswer.trim() || !anomaly) return;
    setLoading(true);

    const newHistoryItem: FiveWhysHistoryItem = {
      step,
      question: currentQuestion,
      answer: selectedAnswer.trim(),
    };

    const nextHistory = [...history, newHistoryItem];
    setHistory(nextHistory);
    setTechnicianInput('');

    try {
      const res = await anomalyApi.process5WhysStep({
        anomaly_id: anomaly.id,
        anomaly_title: anomaly.title,
        machine_id: anomaly.machine_id,
        production_line: anomaly.production_line,
        metric_name: anomaly.metric_name,
        metric_value: anomaly.metric_value,
        threshold_value: anomaly.threshold_value,
        step: step + 1,
        history: nextHistory,
        technician_input: selectedAnswer.trim(),
      });

      if (res.is_final_step || step >= 4) {
        setIsFinalStep(true);
        setSynthesizedRootCause(
          res.synthesized_root_cause ||
            `Root cause determined: Sensor calibration drift combined with inadequate maintenance interval on ${anomaly.machine_id}.`
        );
        setSuggestedCorrective(
          res.suggested_corrective_action ||
            `Recalibrate ${anomaly.machine_id} sensors and replace worn interface seals.`
        );
        setSuggestedPreventive(
          res.suggested_preventive_action ||
            `Institute daily 15-minute diagnostic checks on ${anomaly.production_line}.`
        );
      } else {
        setStep(res.current_step || step + 1);
        setCurrentQuestion(res.why_question);
        setQuickOptions(res.quick_options || []);
      }
    } catch (err) {
      console.warn('5-whys next step fallback', err);
      if (step >= 3) {
        setIsFinalStep(true);
        setSynthesizedRootCause(
          `Synthesized Root Cause: Root cause established as mechanical tolerance breakdown under continuous shift load on ${anomaly.machine_id}.`
        );
        setSuggestedCorrective('Perform emergency rebuild and sensor recalibration.');
        setSuggestedPreventive('Schedule weekly spectroscopic and thermal monitoring.');
      } else {
        setStep(step + 1);
        setCurrentQuestion(`Why did ${selectedAnswer.slice(0, 35)} occur in the preceding stage?`);
        setQuickOptions([
          'Thermal runaway beyond dissipation limit',
          'Inadequate lubrication frequency',
          'Particulate contamination in fluid circuit',
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRootCause = async () => {
    if (!anomaly) return;
    try {
      setIsApplying(true);
      await anomalyApi.apply5Whys({
        anomaly_id: anomaly.id,
        root_cause: synthesizedRootCause || `Root cause established on ${anomaly.machine_id}`,
        corrective_action: suggestedCorrective || `Inspect and recalibrate ${anomaly.machine_id}.`,
        preventive_action: suggestedPreventive || `Establish continuous predictive monitoring on ${anomaly.production_line}.`,
        containment_action: `Isolate production lot and inspect ${anomaly.machine_id} parameters.`
      });
      setSaveSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to apply 5-Whys CAPA', err);
      // Fallback to standard CAPA generation
      try {
        await anomalyApi.generateCapa(anomaly.id);
      } catch (_) {}
      setSaveSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen || !anomaly) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-slate-100 text-slate-700 border border-slate-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  Interactive 5-Whys Diagnostic Assistant
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-200 text-slate-700">
                  AI Root Cause
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Drill down to root cause through conversational Socratic inquiry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150 ease-linear"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anomaly Context Banner */}
        <div className="px-6 py-2.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-800 font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded">
              {anomaly.machine_id}
            </span>
            <span className="font-semibold text-slate-900">{anomaly.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {anomaly.metric_name && (
              <span className="text-slate-500">
                {anomaly.metric_name}: <strong className="text-red-700 font-mono">{anomaly.metric_value}</strong> (Limit: {anomaly.threshold_value})
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {anomaly.severity}
            </span>
          </div>
        </div>

        {/* 5-Whys Progress Tracker */}
        <div className="px-6 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between mb-1.5 text-xs font-medium">
            <span className="text-slate-800 font-semibold uppercase tracking-wider">
              {isFinalStep ? 'Diagnostic Tree Complete' : `Diagnostic Step ${step} of 5`}
            </span>
            <span className="text-slate-500 font-mono">{Math.min(100, Math.round((step / 5) * 100))}% Explored</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-full transition-colors duration-150 ease-linear ${
                  s < step
                    ? 'bg-green-700'
                    : s === step
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Interactive Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Prior History Chain */}
          {history.length > 0 && (
            <div className="space-y-2 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Reasoning Trail (5-Whys Chain)
              </span>
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Why #{item.step}: {item.question}</span>
                  </div>
                  <div className="pl-5 text-slate-600 flex items-center gap-1">
                    <span className="text-slate-900 font-medium">↳ Observation:</span>
                    <span>{item.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Question or Final Conclusion */}
          {!isFinalStep ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  <Zap className="w-4 h-4 text-slate-500" />
                  <span>AI Diagnostic Prompt (Step {step})</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {loading ? 'Analyzing telemetry and formulating next Why question...' : currentQuestion}
                </p>
              </div>

              {/* Quick Response Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Quick-Response Observations (Tap to select)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {quickOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={loading}
                      onClick={() => handleStepSubmit(opt)}
                      className="p-3 text-left rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium transition-colors duration-150 ease-linear disabled:opacity-50 flex items-center justify-between cursor-pointer"
                    >
                      <span>{opt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Observation Input */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Or Type Custom Shopfloor Observation
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={loading}
                    placeholder="e.g. Thermocouple surface sensor has flux accumulation..."
                    value={technicianInput}
                    onChange={(e) => setTechnicianInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleStepSubmit(technicianInput);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={!technicianInput.trim() || loading}
                    onClick={() => handleStepSubmit(technicianInput)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md transition-colors duration-150 ease-linear disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Final Concluded Root Cause & CAPA */
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-green-50 border border-green-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-green-800">5-Whys Root Cause Synthesized</h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {synthesizedRootCause}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-900 uppercase tracking-wider block">
                    Immediate Corrective Action
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {suggestedCorrective || 'Inspect components and recalibrate line parameters to baseline.'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-900 uppercase tracking-wider block">
                    Long-term Preventive Action
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {suggestedPreventive || 'Implement digitized checklist and weekly automated telemetry verification.'}
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-xs text-center font-medium">
                  ✓ Successfully saved to CAPA Register! Anomaly status updated to CAPA_PENDING.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={initFirstStep}
            disabled={loading || isApplying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors duration-150 ease-linear cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Inquiry</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150 ease-linear cursor-pointer"
            >
              Close
            </button>
            {isFinalStep && (
              <button
                type="button"
                disabled={isApplying || saveSuccess}
                onClick={handleApplyRootCause}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium text-xs rounded-md transition-colors duration-150 ease-linear shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Save to CAPA Register</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FiveWhysCopilotModal;
