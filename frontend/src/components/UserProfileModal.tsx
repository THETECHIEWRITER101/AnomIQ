import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  User, 
  Building, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  History, 
  LogOut, 
  Cpu, 
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';

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

  if (!isOpen) return null;

  // Retrieve user from storage or default
  let user = {
    name: 'Dev Patel',
    role: 'Reliability Engineer (Line A)',
    email: 'dev.patel@anomiq.industrial',
    initials: 'DP',
    department: 'Precision Machining & SMT Surface Mount Line 1',
    division: 'Advanced Electronics & Stamping Facility',
    badgeId: 'EMP-ANOM-8821',
    shift: 'Shift A (06:00 - 14:30 IST)',
    uuid: '018f3a9b-7c2e-7110-82a1-94821a8b9e02',
  };

  try {
    const stored = localStorage.getItem('anomiq_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      user.name = parsed.name || user.name;
      user.role = parsed.role || user.role;
      user.email = parsed.email || user.email;
      user.initials = user.name
        .split(' ')
        .map((p: string) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      if (parsed.name.includes('Sarah')) {
        user.department = 'SMT Surface Mount Quality Engineering';
        user.badgeId = 'EMP-ANOM-9042';
        user.uuid = '018f4c12-3b8a-7221-99c0-11234a9b5f88';
      } else if (parsed.name.includes('Anita')) {
        user.department = 'Robotic Welding & Assembly Automation';
        user.badgeId = 'EMP-ANOM-7419';
        user.uuid = '018f5e77-9a4d-7334-aa10-44910b8c2d11';
      }
    }
  } catch (e) {
    // fallback
  }

  const logHistory = [
    {
      id: 'ANM-2026-01',
      title: 'Solder bridging on BGA power rail',
      machine: 'SMT-LINE-01',
      line: 'SMT Surface Mount Line 1',
      severity: 'CRITICAL',
      status: 'CAPA_PENDING',
      date: 'Today, 10:14 AM',
      note: 'Thermal drift observed in Reflow Zone 3. Automated CAPA generated.',
    },
    {
      id: 'ANM-2026-02',
      title: 'Spindle bearing harmonic vibration',
      machine: 'CNC-MILL-01',
      line: 'Line A - Precision Machining',
      severity: 'MEDIUM',
      status: 'INVESTIGATING',
      date: 'Yesterday, 14:20 PM',
      note: 'Acoustic vibration spike at 3200 RPM shaft speed.',
    },
    {
      id: 'ANM-2026-03',
      title: 'Hydraulic pressure loss on Press #3',
      machine: 'PRESS-HYD-03',
      line: 'Line B - Hydraulic Press & Stamping',
      severity: 'CRITICAL',
      status: 'RESOLVED',
      date: 'Sep 26, 2026',
      note: 'Seal ring replacement verified. Pressure stable at 210 bar.',
    },
    {
      id: 'ANM-2026-04',
      title: 'Robotic arm weld temperature excursion',
      machine: 'WELD-ROBOT-02',
      line: 'Line C - Robotic Welding',
      severity: 'HIGH',
      status: 'CLOSED',
      date: 'Sep 24, 2026',
      note: 'Electrode holder acid flushed and chiller flow interlock commissioned.',
    },
  ];

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
                Operator System UUID (Supabase Account ID)
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
              <span>{copied ? 'Copied' : 'Copy UUID'}</span>
            </button>
          </div>

          {/* Department & Operational Assignment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Building size={14} />
                <span className="uppercase text-[10px] tracking-wider">Department & Line</span>
              </div>
              <p className="text-slate-900 font-semibold text-xs leading-snug">{user.department}</p>
              <p className="text-slate-500 text-[11px]">{user.division}</p>
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
              <p className="text-slate-500 text-[11px]">Corporate SSO Linked</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <ShieldCheck size={14} />
                <span className="uppercase text-[10px] tracking-wider">Access Clearance</span>
              </div>
              <p className="text-slate-900 font-semibold text-xs">Level 3 Quality Lead</p>
              <p className="text-slate-500 text-[11px]">ISO 9001 Audit & CAPA Signoff</p>
            </div>
          </div>

          {/* Quick Performance Summary */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900">14</p>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Logs Reported</span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">12</p>
              <span className="text-[10px] uppercase font-semibold text-slate-500">CAPAs Synthesized</span>
            </div>
            <div>
              <p className="text-lg font-bold text-green-700">99.2%</p>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Quality Score</span>
            </div>
          </div>

          {/* History of Logged Anomalies / Post History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 uppercase tracking-wider">
                <History size={15} className="text-slate-500" />
                <span>Operator Anomaly Logging History & Posts</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Last 7 Days</span>
            </div>

            <div className="space-y-2">
              {logHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-slate-500">
                        {item.id}
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
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] font-light leading-relaxed">
                    {item.note}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Machine: {item.machine}</span>
                    <span>&bull;</span>
                    <span>{item.line}</span>
                    <span>&bull;</span>
                    <span className="text-brand-600 font-semibold">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
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
