import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, Plus, User, LogOut, History, Bell, Building2 } from 'lucide-react';
import UserProfileModal from './UserProfileModal';
import { Button } from './ui/button';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenCreateModal: () => void;
  selectedIndustry?: string;
  onSelectIndustry?: (ind: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenCreateModal,
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('anomiq_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          id: parsed.id || 'b0000000-0000-0000-0000-000000000002',
          name: parsed.name || 'Sarah Jenkins',
          initials: (parsed.name || 'Sarah Jenkins')
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          role: parsed.role || 'Quality Assurance Engineer',
          email: parsed.email || 'sarah.jenkins@apex.com',
          facility_id: parsed.facility_id || 'a0000000-0000-0000-0000-000000000001',
          facility_name: parsed.facility_name || 'Apex Electronics Plant - Line 1',
        };
      }
    } catch (e) {}
    return {
      id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Sarah Jenkins',
      initials: 'SJ',
      role: 'Quality Assurance Engineer',
      email: 'sarah.jenkins@apex.com',
      facility_id: 'a0000000-0000-0000-0000-000000000001',
      facility_name: 'Apex Electronics Plant - Line 1',
    };
  });

  // Listen to custom demo bar user switched event
  useEffect(() => {
    const handleUserSwitched = (e: any) => {
      const next = e.detail;
      if (next) {
        setUser({
          id: next.id,
          name: next.name,
          initials: next.name
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          role: next.role,
          email: next.email,
          facility_id: next.facility_id,
          facility_name: next.facility_name,
        });
      }
    };
    window.addEventListener('anomiq-user-switched', handleUserSwitched);
    return () => window.removeEventListener('anomiq-user-switched', handleUserSwitched);
  }, []);

  const isOperator = user.role.toLowerCase().includes('operator') || user.role.toLowerCase().includes('technician');
  const isEngineer = user.role.toLowerCase().includes('engineer');

  // Fetch unread count for notifications
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        let url = '/api/notifications';
        if (user.facility_id) {
          url += `?facility_id=${user.facility_id}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const count = data.filter((n: any) => !n.read_status).length;
            setUnreadCount(count);
          }
        }
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user.facility_id, user.role]);

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

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('anomiq_user');
    navigate('/');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile Sidebar Toggle & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2 text-left">
                <span className="text-sm font-bold text-slate-900">
                  AnomIQ
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                  <Building2 className="w-3 h-3 text-brand-500" />
                  {user.facility_name}
                </span>
              </div>
            </div>

            {/* Action Buttons & Avatar */}
            <div className="flex items-center gap-2.5">
              {/* Notification Bell button */}
              <button
                onClick={() => navigate('/app/alerts')}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
                title="Notification Alert Dashboard"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Role-Specific Action Button */}
              {isOperator ? (
                <Button
                  variant="dark"
                  size="sm"
                  onClick={onOpenCreateModal}
                  className="text-xs bg-[#0f172a] text-white hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Log Anomaly
                </Button>
              ) : isEngineer ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/app/anomalies')}
                  className="text-xs text-blue-700 bg-blue-50/50 hover:bg-blue-100 border-blue-200 cursor-pointer"
                >
                  <span>5-Whys Diagnostics</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/app/alerts')}
                  className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
                >
                  <span>Dual Logs Sign-Off</span>
                </Button>
              )}

              {/* Operator Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 border border-brand-200 flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer focus:outline-none"
                  title={`${user.name} (${user.role})`}
                >
                  {user.initials}
                </button>

                {/* Profile Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60 mt-1">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer group"
                      >
                        <div className="p-1 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <User size={14} />
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 block">Profile & Role</span>
                          <span className="text-[10px] text-slate-400 block">{user.facility_name}</span>
                        </div>
                      </button>

                      <NavLink
                        to="/app/alerts"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer group"
                      >
                        <div className="p-1 rounded bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                          <Bell size={14} />
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 block">Alert Dashboard</span>
                          <span className="text-[10px] text-slate-400 block">Role-based notification feed ({unreadCount} unread)</span>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/app/anomalies"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer group"
                      >
                        <div className="p-1 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <History size={14} />
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 block">Anomalies Register</span>
                          <span className="text-[10px] text-slate-400 block">Review submitted failure logs</span>
                        </div>
                      </NavLink>
                    </div>

                    <div className="border-t border-slate-100 my-1"></div>

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
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header;
