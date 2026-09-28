import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Menu, Plus, Globe, User } from 'lucide-react';

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
    if (path === '/app' || path === '/dashboard' || path === '/') {
      return (
        <div className="text-sm text-slate-500 font-medium">
          Console / <span className="text-slate-900 font-semibold">Global Telemetry Feed</span>
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
          Console / <span className="text-slate-900 font-semibold">Anomalies Register</span>
        </div>
      );
    }
    if (path.startsWith('/capa')) {
      return (
        <div className="text-sm text-slate-500 font-medium">
          Console / <span className="text-slate-900 font-semibold">CAPA Review & Approvals</span>
        </div>
      );
    }
    if (path.startsWith('/analytics')) {
      return (
        <div className="text-sm text-slate-500 font-medium">
          Console / <span className="text-slate-900 font-semibold">Telemetry Trends</span>
        </div>
      );
    }
    return (
      <div className="text-sm text-slate-500 font-medium">
        Console / <span className="text-slate-900 font-semibold">Operations</span>
      </div>
    );
  };

  let currentUser = { name: 'Sarah Jenkins', initials: 'SJ' };
  try {
    const stored = localStorage.getItem('anomiq_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      currentUser = {
        name: parsed.name,
        initials: parsed.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase(),
      };
    }
  } catch (e) {
    // fallback
  }

  return (
    <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors duration-150 ease-linear border border-slate-200 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block">
          {getBreadcrumbs()}
        </div>
        <div className="sm:hidden text-sm font-semibold text-slate-900">
          AnomIQ Console
        </div>
      </div>

      {/* Right: Public Website Link, Operational Status, User & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <NavLink
          to="/"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors duration-150 ease-linear"
        >
          <Globe size={13} className="text-brand-500" />
          <span>Website</span>
        </NavLink>

        <div className="hidden xs:flex items-center gap-2 text-xs text-slate-600 font-medium px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
          <span>System Operational</span>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors duration-150 ease-linear shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Log Anomaly</span>
        </button>

        {/* User Badge */}
        <div 
          className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold text-xs border border-brand-200"
          title={`Signed in as ${currentUser.name}`}
        >
          {currentUser.initials}
        </div>
      </div>
    </header>
  );
};
export default Header;
