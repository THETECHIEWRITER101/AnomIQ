import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  Server, 
  AlertCircle, 
  CheckCircle, 
  BarChart3, 
  Plus, 
  X, 
  Bell
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateModal: () => void;
  onOpenLogsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenCreateModal,
  onOpenLogsModal,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-xs transition-opacity duration-150 ease-linear"
          onClick={onClose}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#0f172a] text-slate-300 flex flex-col justify-between
          transform transition-transform duration-150 ease-linear
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
        `}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight leading-none">
                  AnomIQ <span className="text-blue-400 font-medium text-xs">AI</span>
                </h1>
                <p className="font-mono text-[10px] text-slate-400 mt-1">Operations Console</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations Control
            </div>

            <NavLink
              to="/app"
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Activity size={16} />
              <span>Operations Console</span>
            </NavLink>

            <NavLink
              to="/app/alerts"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Bell size={16} />
              <span>Alert Dashboard</span>
            </NavLink>

            <NavLink
              to="/app/anomalies"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <AlertCircle size={16} />
              <span>Master Register</span>
            </NavLink>

            <NavLink
              to="/app/capa"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <CheckCircle size={16} />
              <span>CAPA Review & Approvals</span>
            </NavLink>

            <NavLink
              to="/app/analytics"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <BarChart3 size={16} />
              <span>Telemetry & Trends</span>
            </NavLink>

            <button
              onClick={() => {
                onClose();
                onOpenLogsModal();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/80 hover:text-white transition-all text-left cursor-pointer"
            >
              <Server size={16} />
              <span>Supabase & System Logs</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Log Anomaly</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Hotkey Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
              Shift + N
            </kbd>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
