import React, { useState } from 'react';
import { X, AlertTriangle, Cpu, User, CheckCircle2 } from 'lucide-react';
import { anomalyApi, CreateAnomalyPayload } from '../services/api';

interface CreateAnomalyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAnomalyModal: React.FC<CreateAnomalyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateAnomalyPayload>({
    title: '',
    machine_id: 'CNC-MILL-04',
    production_line: 'Line A - Precision Machining',
    severity: 'HIGH',
    description: '',
    metric_name: 'Vibration (mm/s)',
    metric_value: 8.4,
    threshold_value: 4.5,
    operator_name: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Please fill in title and description');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await anomalyApi.createAnomaly(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to create anomaly');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Log Manufacturing Anomaly</h3>
              <p className="text-xs text-zinc-400">Record an operational deviation or hardware failure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Anomaly Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spindle bearing vibration spike on Line A"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Machine ID *
              </label>
              <div className="relative">
                <Cpu className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC-MILL-04"
                  value={formData.machine_id}
                  onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Production Line *
              </label>
              <select
                value={formData.production_line}
                onChange={(e) => setFormData({ ...formData, production_line: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
              >
                <option value="Line A - Precision Machining">Line A - Precision Machining</option>
                <option value="Line B - Hydraulic Press & Stamping">Line B - Hydraulic Press & Stamping</option>
                <option value="Line C - Robotic Welding">Line C - Robotic Welding</option>
                <option value="Line D - Thermal Treatment & Coating">Line D - Thermal Treatment & Coating</option>
                <option value="Line E - Assembly & Quality Verification">Line E - Assembly & Quality Verification</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Severity Level *
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value as CreateAnomalyPayload['severity'] })
                }
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
              >
                <option value="CRITICAL">CRITICAL (Immediate Shutdown)</option>
                <option value="HIGH">HIGH (Urgent Attention Required)</option>
                <option value="MEDIUM">MEDIUM (Degraded Performance)</option>
                <option value="LOW">LOW (Informational / Minor Drift)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Operator / Inspector
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.operator_name || ''}
                  onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-800/80">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Metric Monitored</label>
              <input
                type="text"
                placeholder="e.g. Vibration, Temp"
                value={formData.metric_name || ''}
                onChange={(e) => setFormData({ ...formData, metric_name: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Observed Value</label>
              <input
                type="number"
                step="0.01"
                placeholder="8.4"
                value={formData.metric_value || ''}
                onChange={(e) => setFormData({ ...formData, metric_value: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Threshold Limit</label>
              <input
                type="number"
                step="0.01"
                placeholder="4.5"
                value={formData.threshold_value || ''}
                onChange={(e) => setFormData({ ...formData, threshold_value: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Detailed Description & Observation *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe physical symptoms, noise patterns, or sensor readouts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Logging...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Anomaly</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateAnomalyModal;
