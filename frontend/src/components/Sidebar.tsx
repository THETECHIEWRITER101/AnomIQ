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
  Terminal,
  Cpu
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
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between
          transform transition-transform duration-150 ease-linear
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
        `}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                  <Activity size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white tracking-wide leading-none">AnomIQ</h1>
                  <p className="font-mono text-[11px] text-slate-400 mt-1">v1.0.0-production</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors duration-150 ease-linear"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Operations Control
            </div>

            <NavLink
              to="/"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-linear ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Activity size={18} />
              <span>Global Feed</span>
            </NavLink>

            <NavLink
              to="/anomalies"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-linear ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <AlertCircle size={18} />
              <span>Anomalies Register</span>
            </NavLink>

            <NavLink
              to="/capa"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-linear ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <CheckCircle size={18} />
              <span>CAPA Review</span>
            </NavLink>

            <NavLink
              to="/analytics"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-linear ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <BarChart3 size={18} />
              <span>Telemetry Trends</span>
            </NavLink>

            <div className="pt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              System & Telemetry
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenLogsModal();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-150 ease-linear text-left"
            >
              <Server size={18} />
              <span>Supabase Logs</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-md text-sm font-medium transition-colors duration-150 ease-linear shadow-xs"
          >
            <Plus size={16} />
            <span>Log Anomaly</span>
          </button>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Render API
              </span>
              <span className="font-mono text-slate-300">200 OK</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Supabase DB
              </span>
              <span className="font-mono text-slate-300">Active</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Terminal Hotkey:</span>
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
