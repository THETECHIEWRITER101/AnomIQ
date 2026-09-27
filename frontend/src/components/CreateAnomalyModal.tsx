import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  AlertTriangle, 
  Cpu, 
  User, 
  CheckCircle2, 
  Mic, 
  MicOff, 
  Sparkles, 
  Upload, 
  FileWarning, 
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { anomalyApi, CreateAnomalyPayload, DuplicateMatch } from '../services/api';
import { compressImageToWebP } from '../utils/imageCompression';

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
    image_url: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice-to-Defect Intake (Floor Mode) State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Duplicate Clustering State
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  // Image Upload & Compression State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCompressionInfo, setImageCompressionInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check duplicates when title changes
  useEffect(() => {
    if (!formData.title || formData.title.trim().length < 5) {
      setDuplicateMatches([]);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsCheckingDuplicates(true);
        const res = await anomalyApi.checkDuplicates(formData.title.trim());
        setDuplicateMatches(res.matches || []);
      } catch (err) {
        console.warn('Duplicate check unavailable', err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [formData.title]);

  // Voice recording toggle via Web Speech API
  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser fallback demo memo for environments without SpeechRecognition
      const fallbackMemo =
        "Stamping Line 2 hydraulic ram has high pressure spike and severe vibration exceeding limits";
      setVoiceTranscript(fallbackMemo);
      handleProcessVoice(fallbackMemo);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceTranscript('Listening... Speak your defect observation.');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (voiceTranscript && voiceTranscript !== 'Listening... Speak your defect observation.') {
          handleProcessVoice(voiceTranscript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition', e);
      setIsRecording(false);
    }
  };

  const handleProcessVoice = async (transcript: string) => {
    if (!transcript || transcript.trim().length === 0) return;
    try {
      setIsParsingVoice(true);
      const parsed = await anomalyApi.parseVoiceIntake(transcript);
      setFormData((prev) => ({
        ...prev,
        title: parsed.title || prev.title,
        machine_id: parsed.machine_id || prev.machine_id,
        production_line: parsed.production_line || prev.production_line,
        severity: parsed.severity as any,
        description: parsed.description || prev.description,
        metric_name: parsed.metric_name || prev.metric_name,
        metric_value: parsed.metric_value !== null ? parsed.metric_value : prev.metric_value,
        threshold_value: parsed.threshold_value !== null ? parsed.threshold_value : prev.threshold_value,
      }));
    } catch (err) {
      console.warn('Voice parsing error', err);
    } finally {
      setIsParsingVoice(false);
    }
  };

  // Image selection and client-side WebP compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl, sizeReductionRatio } = await compressImageToWebP(file, 1280, 720, 0.75);
      setImagePreview(dataUrl);
      setImageCompressionInfo(`Compressed to WebP (reduced by ${sizeReductionRatio}%)`);
      // In production with Supabase Storage, dataUrl would be uploaded to storage bucket and return CDN url
      setFormData((prev) => ({ ...prev, image_url: dataUrl.slice(0, 300) }));
    } catch (err) {
      console.error('Image compression error', err);
    }
  };

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
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Log Manufacturing Anomaly</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-orange-400 border border-orange-500/20">
                  Floor Mode Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400">Record hardware failure, sensor breach, or line stoppage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero-Cost Voice-to-Defect Intake (Floor Mode Banner) */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-orange-500/10 via-zinc-950 to-zinc-950 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition shadow-lg ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/30'
                  : 'bg-orange-500 hover:bg-orange-600 text-zinc-950 shadow-orange-500/20'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Listening...' : 'Floor Mode: Voice Memo'}</span>
            </button>
            <div className="text-xs text-zinc-400">
              {isParsingVoice ? (
                <span className="text-orange-400 flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Gemini Flash parsing voice memo...
                </span>
              ) : isRecording ? (
                <span className="text-red-400 font-medium">Recording operator speech...</span>
              ) : (
                <span>Operators wearing gloves can speak to auto-fill ticket</span>
              )}
            </div>
          </div>

          {/* Quick Voice Simulation Buttons (For testing anywhere without microphone) */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                const sample = "Stamping Line 2 hydraulic ram has high pressure spike and severe vibration";
                setVoiceTranscript(sample);
                handleProcessVoice(sample);
              }}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
              title="Test Voice Memo Intake Sample"
            >
              Sample: Press Spike
            </button>
            <button
              type="button"
              onClick={() => {
                const sample = "Robotic welding Line C weld arm tip temperature 870 degrees critical alarm";
                setVoiceTranscript(sample);
                handleProcessVoice(sample);
              }}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
              title="Test Voice Memo Intake Sample"
            >
              Sample: Weld Heat
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              {error}
            </div>
          )}

          {/* Voice transcript readout if present */}
          {voiceTranscript && (
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-orange-500/20 text-xs text-zinc-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-orange-400 font-semibold block">Spoken Transcription:</span>
                <p className="italic">{voiceTranscript}</p>
              </div>
            </div>
          )}

          {/* Anomaly Title */}
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
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Duplicate & Recurrence Clustering Alert (pg_trgm Search) */}
          {duplicateMatches.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <FileWarning className="w-4 h-4" />
                <span>Shift Recurrence Warning: Potential Duplicate Detected (pg_trgm)</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                A similar defect was reported within the last 24 hours. Verify if this is the same line stoppage before filing:
              </p>
              <div className="space-y-1.5 pt-1">
                {duplicateMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-white">#{match.id} {match.title}</span>
                      <span className="text-zinc-400 ml-2 font-mono">({match.machine_id} - {match.production_line})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold font-mono">
                        {Math.round(match.similarity_score * 100)}% match
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-zinc-300 font-bold">
                        {match.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Machine ID and Production Line */}
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
                  className="w-full pl-10 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition"
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
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition"
              >
                <option value="Line A - Precision Machining">Line A - Precision Machining</option>
                <option value="Line B - Hydraulic Press & Stamping">Line B - Hydraulic Press & Stamping</option>
                <option value="Line C - Robotic Welding">Line C - Robotic Welding</option>
                <option value="Line D - Thermal Treatment & Coating">Line D - Thermal Treatment & Coating</option>
                <option value="Line E - Assembly & Quality Verification">Line E - Assembly & Quality Verification</option>
              </select>
            </div>
          </div>

          {/* Severity & Operator */}
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
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition"
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
                  className="w-full pl-10 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Metric Monitored</label>
              <input
                type="text"
                placeholder="e.g. Vibration, Temp"
                value={formData.metric_name || ''}
                onChange={(e) => setFormData({ ...formData, metric_name: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Observed Value</label>
              <input
                type="number"
                step="0.01"
                placeholder="8.4"
                value={formData.metric_value || ''}
                onChange={(e) => setFormData({ ...formData, metric_value: parseFloat(e.target.value) || undefined })}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Threshold Limit</label>
              <input
                type="number"
                step="0.01"
                placeholder="4.5"
                value={formData.threshold_value || ''}
                onChange={(e) => setFormData({ ...formData, threshold_value: parseFloat(e.target.value) || undefined })}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          {/* Description */}
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
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* WebP Defect Photo Compression (Supabase Storage Optimization) */}
          <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                Defect Photo (Client-Side WebP Compression)
              </span>
              {imageCompressionInfo && (
                <span className="text-[10px] text-emerald-400 font-medium">{imageCompressionInfo}</span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Defect Photo</span>
              </button>

              {imagePreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Defect preview"
                    className="w-10 h-10 object-cover rounded-lg border border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageCompressionInfo(null);
                      setFormData((p) => ({ ...p, image_url: '' }));
                    }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Logging Anomaly...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Anomaly Ticket</span>
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
