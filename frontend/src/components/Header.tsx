import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Plus, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenCreateModal: () => void;
  activeAnomalyId?: string | number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenCreateModal,
  activeAnomalyId,
}) => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') {
      return (
        <div className="text-sm text-slate-500 font-medium">
          Dashboard / <span className="text-slate-900 font-semibold">Global Feed</span>
          {activeAnomalyId && (
            <>
              {' '}/ <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{String(activeAnomalyId).slice(0, 8)}</span>
            </>
          )}
        </div>
      );
    }
    if (path.startsWith('/anomalies')) {
      return (
        <div className="text-sm text-slate-500 font-medium">
          Dashboard / <span className="text-slate-900 font-semibold">Anomalies Register</span>
        </div>
      );
    }
    if (path.startsWith('/capa')) {
      return (
        <div className="text-sm text-slate-500 font-medium">
          Dashboard / <span className="text-slate-900 font-semibold">CAPA Review & Approvals</span>
        </div>
      );
    }
    if (path.startsWith('/analytics')) {
      return (
        <div className="text-sm text-slate-500 font-medium">
          Dashboard / <span className="text-slate-900 font-semibold">Telemetry Trends</span>
        </div>
      );
    }
    return (
      <div className="text-sm text-slate-500 font-medium">
        Dashboard / <span className="text-slate-900 font-semibold">Operations</span>
      </div>
    );
  };

  return (
    <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors duration-150 ease-linear border border-slate-200"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block">
          {getBreadcrumbs()}
        </div>
        <div className="sm:hidden text-sm font-semibold text-slate-900">
          AnomIQ
        </div>
      </div>

      {/* Right: Operational Status & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
          <span className="hidden xs:inline">System Operational</span>
          <span className="xs:hidden">Live</span>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ease-linear shadow-sm"
        >
          <Plus size={16} />
          <span>Log Anomaly</span>
        </button>
      </div>
    </header>
  );
};
export default Header;
