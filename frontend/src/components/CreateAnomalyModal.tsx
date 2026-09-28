import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  AlertCircle, 
  Cpu, 
  User, 
  CheckCircle2, 
  Mic, 
  MicOff, 
  Sparkles, 
  Upload, 
  FileWarning, 
  Image as ImageIcon
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
  const debounceTimerRef = useRef<any>(null);

  // Image Upload & Compression State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCompressionInfo, setImageCompressionInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time duplicate check with debounce
  useEffect(() => {
    if (formData.title.trim().length > 4) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await anomalyApi.checkDuplicates(formData.title, 24);
          if (res.is_duplicate_suspected) {
            setDuplicateMatches(res.matches || []);
          } else {
            setDuplicateMatches([]);
          }
        } catch (e) {
          console.warn('Duplicate check failed', e);
        }
      }, 500);
    } else {
      setDuplicateMatches([]);
    }
  }, [formData.title]);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl, sizeReductionRatio } = await compressImageToWebP(file, 1280, 720, 0.75);
      setImagePreview(dataUrl);
      setImageCompressionInfo(`Compressed to WebP (-${sizeReductionRatio}%)`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-slate-100 text-slate-700 border border-slate-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">Log Manufacturing Anomaly</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-200 text-slate-700">
                  Floor Mode Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">Record hardware failure, sensor breach, or line stoppage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150 ease-linear"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floor Mode Voice Intake Banner */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors duration-150 ease-linear cursor-pointer ${
                isRecording
                  ? 'bg-red-700 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Listening...' : 'Floor Mode: Voice Memo'}</span>
            </button>
            <div className="text-xs text-slate-500">
              {isParsingVoice ? (
                <span className="text-slate-800 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Gemini parsing spoken memo...
                </span>
              ) : isRecording ? (
                <span className="text-red-700 font-medium">Recording operator speech...</span>
              ) : (
                <span>Speak to auto-fill ticket while on shopfloor</span>
              )}
            </div>
          </div>

          {/* Quick Voice Simulation Buttons */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                const sample = "Stamping Line 2 hydraulic ram has high pressure spike and severe vibration";
                setVoiceTranscript(sample);
                handleProcessVoice(sample);
              }}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] transition-colors duration-150 ease-linear cursor-pointer"
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
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] transition-colors duration-150 ease-linear cursor-pointer"
            >
              Sample: Weld Heat
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {voiceTranscript && (
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-900 font-semibold block">Spoken Transcription:</span>
                <p className="italic text-slate-600">{voiceTranscript}</p>
              </div>
            </div>
          )}

          {/* Anomaly Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Anomaly Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Solder bridging on BGA power rail"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear"
            />
          </div>

          {/* Duplicate Clustering Alert */}
          {duplicateMatches.length > 0 && (
            <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                <FileWarning className="w-4 h-4" />
                <span>Shift Recurrence Warning: Potential Duplicate Detected</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                A similar defect was reported within the last 24 hours. Verify if this is the same recurrence:
              </p>
              <div className="space-y-1.5 pt-1">
                {duplicateMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-2 rounded bg-white border border-amber-200 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">#{match.id} {match.title}</span>
                      <span className="text-slate-500 ml-2 font-mono">({match.machine_id} - {match.production_line})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-800 font-bold font-mono">
                        {Math.round(match.similarity_score * 100)}% match
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-700 font-semibold">
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Machine ID *
              </label>
              <div className="relative">
                <Cpu className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. SMT-LINE-01"
                  value={formData.machine_id}
                  onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Production Line *
              </label>
              <select
                value={formData.production_line}
                onChange={(e) => setFormData({ ...formData, production_line: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear cursor-pointer"
              >
                <option value="SMT Surface Mount Line 1">SMT Surface Mount Line 1</option>
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Severity Level *
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value as CreateAnomalyPayload['severity'] })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear cursor-pointer"
              >
                <option value="CRITICAL">CRITICAL (Immediate Shutdown)</option>
                <option value="HIGH">HIGH (Urgent Attention Required)</option>
                <option value="MEDIUM">MEDIUM (Degraded Performance)</option>
                <option value="LOW">LOW (Minor Drift / Warning)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Operator / Shift Lead
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Dev Patel"
                  value={formData.operator_name || ''}
                  onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear"
                />
              </div>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Sensor Tag</label>
              <input
                type="text"
                placeholder="e.g. Reflow Peak Temp"
                value={formData.metric_name || ''}
                onChange={(e) => setFormData({ ...formData, metric_name: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Observed Value</label>
              <input
                type="number"
                step="0.01"
                placeholder="268.4"
                value={formData.metric_value || ''}
                onChange={(e) => setFormData({ ...formData, metric_value: parseFloat(e.target.value) || undefined })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Threshold Limit</label>
              <input
                type="number"
                step="0.01"
                placeholder="245.0"
                value={formData.threshold_value || ''}
                onChange={(e) => setFormData({ ...formData, threshold_value: parseFloat(e.target.value) || undefined })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 text-xs font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Observation *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe physical symptoms, noise patterns, or sensor readouts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-500 focus:bg-white transition-colors duration-150 ease-linear resize-none"
            />
          </div>

          {/* WebP Defect Photo Compression */}
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                Defect Visual (WebP Optimized)
              </span>
              {imageCompressionInfo && (
                <span className="text-[10px] text-green-700 font-medium">{imageCompressionInfo}</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors duration-150 ease-linear cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Defect Photo</span>
              </button>

              {imagePreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Defect preview"
                    className="w-10 h-10 object-cover rounded border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageCompressionInfo(null);
                      setFormData((p) => ({ ...p, image_url: '' }));
                    }}
                    className="text-xs text-red-700 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150 ease-linear cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-md text-xs transition-colors duration-150 ease-linear shadow-xs disabled:opacity-50 cursor-pointer"
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
