import React, { useState } from 'react';
import { X, Terminal, Copy, Check, RefreshCw, Server, Database } from 'lucide-react';

interface SupabaseLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseLogsModal: React.FC<SupabaseLogsModalProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mockLogs = [
    { timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(), level: 'INFO', source: 'render-backend', msg: 'GET /health - 200 OK - latency 18ms' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), level: 'QUERY', source: 'supabase-pg', msg: 'SELECT * FROM anomalies WHERE status != \'CLOSED\' ORDER BY detected_at DESC' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(), level: 'INFO', source: 'gemini-ai', msg: 'Prompt synthesis dispatched for defect UUID 22222222-2222-2222-2222-222222222222' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), level: 'INFO', source: 'gemini-ai', msg: 'CAPA generated (Confidence 94.8%) with containment, corrective & preventive JSON payload' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), level: 'QUERY', source: 'supabase-pg', msg: 'INSERT INTO capa_actions (anomaly_id, root_cause, corrective_action, ai_confidence) VALUES (101, ...)' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), level: 'WARN', source: 'telemetry-stream', msg: 'Machine SMT Surface Mount Line 1 reported solder bridging above standard variance (+18%)' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), level: 'INFO', source: 'supabase-realtime', msg: 'WebSocket channel connected: real-time anomalies broadcast established' },
  ];

  const filteredLogs = mockLogs.filter(
    (l) => filter === 'ALL' || l.level === filter
  );

  const handleCopy = () => {
    const text = mockLogs.map((l) => `[${l.timestamp}] [${l.level}] [${l.source}]: ${l.msg}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-3xl w-full p-6 shadow-xl flex flex-col max-h-[85vh] text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-slate-800 text-slate-300">
              <Server size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Supabase & Render System Logs</h3>
              <p className="font-mono text-xs text-slate-400">Live operational event and database query pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors duration-150 ease-linear"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {['ALL', 'INFO', 'QUERY', 'WARN'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors duration-150 ease-linear ${
                  filter === lvl
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 rounded transition-colors duration-150 ease-linear"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>
        </div>

        {/* Terminal logs body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded border border-slate-800/80 font-mono text-xs space-y-2 text-slate-300">
          {filteredLogs.map((log, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3 py-1 border-b border-slate-900 last:border-0">
              <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp.split('T')[1].slice(0, 8)}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0 ${
                  log.level === 'WARN'
                    ? 'bg-amber-950 text-amber-400 border border-amber-900'
                    : log.level === 'QUERY'
                    ? 'bg-blue-950 text-blue-400 border border-blue-900'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {log.level}
              </span>
              <span className="text-slate-400 shrink-0">[{log.source}]</span>
              <span className="text-slate-200 break-all">{log.msg}</span>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Real-time channel: postgres_changes (ONLINE)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-sans transition-colors duration-150 ease-linear"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
export default SupabaseLogsModal;
