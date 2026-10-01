import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  User, 
  Building, 
  Clock, 
  ShieldCheck, 
  History, 
  LogOut, 
  Sparkles
} from 'lucide-react';
import { anomalyApi, Anomaly } from '../services/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);
  const [userAnomalies, setUserAnomalies] = useState<Anomaly[]>([]);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);

  // Retrieve user from local storage
  let user = {
    id: 'user-001',
    name: 'Operator User',
    role: 'Quality Engineer',
    email: 'user@facility.com',
    initials: 'OU',
    facility_name: 'Industrial Facility Workspace',
    facility_id: undefined as any,
    badgeId: 'EMP-ANOM-1001',
    shift: 'General Shift (Active)',
    uuid: '018f3a9b-7c2e-7110-82a1-94821a8b9e02',
  };

  try {
    const stored = localStorage.getItem('anomiq_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      user.name = parsed.name || user.name;
      user.role = parsed.role || user.role;
      user.email = parsed.email || user.email;
      user.facility_name = parsed.facility_name || user.facility_name;
      user.facility_id = parsed.facility_id;
      user.id = parsed.id ? String(parsed.id) : user.id;
      user.uuid = parsed.id ? `usr-${parsed.id}` : user.uuid;
      user.badgeId = `EMP-${(parsed.name || 'USER').split(' ').map((n: string) => n[0]).join('').toUpperCase()}-${parsed.id || '01'}`;
      user.initials = user.name
        .split(' ')
        .map((p: string) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
  } catch (e) {}

  useEffect(() => {
    if (isOpen) {
      setLoadingAnomalies(true);
      anomalyApi.getAnomalies({ facility_id: user.facility_id })
        .then((data) => {
          setUserAnomalies(data || []);
        })
        .catch(() => {
          setUserAnomalies([]);
        })
        .finally(() => {
          setLoadingAnomalies(false);
        });
    }
  }, [isOpen, user.facility_id]);

  if (!isOpen) return null;

  const totalLogs = userAnomalies.length;
  const capasSynthesized = userAnomalies.filter(a => a.capas && a.capas.length > 0).length;

  const handleCopyUUID = () => {
    navigator.clipboard.writeText(user.uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 animate-fade-in">
        {/* Header Banner */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-md border border-brand-400">
              {user.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white tracking-tight">{user.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-600/60 text-brand-100 border border-brand-400/40">
                  {user.badgeId}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-light">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* User Profile UUID Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Operator System ID (Account)
              </span>
              <p className="font-mono text-xs text-slate-900 font-medium break-all">
                {user.uuid}
              </p>
            </div>
            <button
              onClick={handleCopyUUID}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Department & Operational Assignment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Building size={14} />
                <span className="uppercase text-[10px] tracking-wider">Facility & Workspace</span>
              </div>
              <p className="text-slate-900 font-semibold text-xs leading-snug">{user.facility_name}</p>
              <p className="text-slate-500 text-[11px]">Industrial Operations Console</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Clock size={14} />
                <span className="uppercase text-[10px] tracking-wider">Shift Schedule</span>
              </div>
              <p className="text-slate-900 font-semibold text-xs">{user.shift}</p>
              <div className="flex items-center gap-1 text-green-700 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>Active Floor Terminal</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <User size={14} />
                <span className="uppercase text-[10px] tracking-wider">Official Email</span>
              </div>
              <p className="text-slate-900 font-semibold text-xs font-mono">{user.email}</p>
              <p className="text-slate-500 text-[11px]">Registered Workspace User</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <ShieldCheck size={14} />
                <span className="uppercase text-[10px] tracking-wider">Access Clearance</span>
              </div>
              <p className="text-slate-900 font-semibold text-xs">{user.role}</p>
              <p className="text-slate-500 text-[11px]">Facility Inspection & Signoff</p>
            </div>
          </div>

          {/* Quick Performance Summary */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900">{totalLogs}</p>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Logs Reported</span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{capasSynthesized}</p>
              <span className="text-[10px] uppercase font-semibold text-slate-500">CAPAs Synthesized</span>
            </div>
          </div>

          {/* History of Logged Anomalies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 uppercase tracking-wider">
                <History size={15} className="text-slate-500" />
                <span>Operator Anomaly Logging History</span>
              </div>
              {loadingAnomalies && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Sparkles size={12} className="animate-spin" /> Loading logs...
                </span>
              )}
            </div>

            {userAnomalies.length > 0 ? (
              <div className="space-y-2">
                {userAnomalies.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all text-xs space-y-1.5 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-slate-500">
                          #{item.id}
                        </span>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${
                            item.severity === 'CRITICAL'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : item.severity === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.detected_at ? new Date(item.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged'}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-[11px] font-light leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                      <span>Machine: {item.machine_id}</span>
                      <span>&bull;</span>
                      <span>{item.production_line}</span>
                      <span>&bull;</span>
                      <span className="text-brand-600 font-semibold">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs font-medium text-slate-600">No anomaly logs recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-light">
                  Log your first manufacturing defect on the shopfloor to build your incident history.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out Operator</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
export default UserProfileModal;

