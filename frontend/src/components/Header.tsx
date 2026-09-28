import React, { useState, useRef, useEffect } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Plus, Globe, User, LogOut, ChevronDown, ShieldCheck, History, ExternalLink } from 'lucide-react';
import UserProfileModal from './UserProfileModal';

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
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  let currentUser = {
    name: 'Dev Patel',
    initials: 'DP',
    role: 'Reliability Engineer (Line A)',
    email: 'dev.patel@anomiq.industrial',
    badge: 'EMP-ANOM-8821'
  };

  try {
    const stored = localStorage.getItem('anomiq_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      currentUser = {
        name: parsed.name || currentUser.name,
        initials: (parsed.name || currentUser.name).split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase(),
        role: parsed.role || currentUser.role,
        email: parsed.email || currentUser.email,
        badge: parsed.badge || currentUser.badge,
      };
    }
  } catch (e) {
    // fallback
  }

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('anomiq_user');
    navigate('/');
  };

  return (
    <>
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

          {/* Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-brand-400/50 transition-all cursor-pointer focus:outline-none"
              title={`Signed in as ${currentUser.name}`}
              aria-label="Open profile options"
              aria-expanded={isDropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold text-xs border border-brand-200 shadow-xs">
                {currentUser.initials}
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header info */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-1.5 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-mono rounded border border-brand-100 font-medium">
                      {currentUser.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Shift Lead</span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div className="p-1 rounded bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <User size={14} />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 block">Profile</span>
                      <span className="text-[10px] text-slate-400 block">UUID, Department & Logging History</span>
                    </div>
                  </button>

                  <NavLink
                    to="/anomalies"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div className="p-1 rounded bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <History size={14} />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 block">My Incident Posts</span>
                      <span className="text-[10px] text-slate-400 block">Review your submitted anomalies</span>
                    </div>
                  </NavLink>
                </div>

                <div className="border-t border-slate-100 my-1"></div>

                {/* Log Out */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} className="text-red-500" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
};
export default Header;
