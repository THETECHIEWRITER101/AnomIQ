import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Inbox,
  RefreshCw,
  CheckCheck,
  Building2,
  ArrowRight,
  Clock,
  Wrench,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';

import { Anomaly, anomalyApi } from '../services/api';
import FiveWhysCopilotModal from '../components/FiveWhysCopilotModal';
import DualLogsAuditModal from '../components/DualLogsAuditModal';

interface NotificationItem {
  id: number | string;
  facility_id?: number | string;
  target_role: string;
  title: string;
  message: string;
  type: string;
  anomaly_id?: number | string;
  read_status: boolean;
  created_at: string;
}

export const NotificationAlerts: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'quality_engineer' | 'facility_head' | 'unread'>('all');

  // Modals
  const [copilotAnomaly, setCopilotAnomaly] = useState<Anomaly | null>(null);
  const [dualLogsAnomaly, setDualLogsAnomaly] = useState<Anomaly | null>(null);
  const [modalLoadingId, setModalLoadingId] = useState<number | string | null>(null);

  // User context
  const [userContext, setUserContext] = useState(() => {
    try {
      const stored = localStorage.getItem('anomiq_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          facilityId: parsed.facility_id || null,
          role: parsed.role || 'Quality Assurance Engineer',
          facilityName: parsed.facility_name || 'Apex Electronics Plant',
          name: parsed.name || 'Sarah Jenkins',
        };
      }
    } catch (e) {}
    return {
      facilityId: null,
      role: 'Quality Assurance Engineer',
      facilityName: 'Apex Electronics Plant',
      name: 'Sarah Jenkins',
    };
  });

  // Listen to judge demo bar role & facility switches
  useEffect(() => {
    const handleSwitch = (e: any) => {
      const next = e.detail;
      if (next) {
        setUserContext({
          facilityId: next.facility_id,
          role: next.role,
          facilityName: next.facility_name,
          name: next.name,
        });
      }
    };
    window.addEventListener('anomiq-user-switched', handleSwitch);
    return () => window.removeEventListener('anomiq-user-switched', handleSwitch);
  }, []);

  const isEngineer = userContext.role.toLowerCase().includes('engineer');
  const isQuality = userContext.role.toLowerCase().includes('manager') || userContext.role.toLowerCase().includes('sign-off') || userContext.role.toLowerCase().includes('head');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let url = '/api/notifications';
      const params = new URLSearchParams();
      if (userContext.facilityId) params.append('facility_id', String(userContext.facilityId));
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userContext.facilityId, userContext.role]);

  const handleOpen5Whys = async (anomalyId: number | string) => {
    try {
      setModalLoadingId(anomalyId);
      const anomaly = await anomalyApi.getAnomalyById(anomalyId);
      setCopilotAnomaly(anomaly);
    } catch (e) {
      console.error('Failed to load anomaly for 5-Whys', e);
    } finally {
      setModalLoadingId(null);
    }
  };

  const handleOpenDualLogs = async (anomalyId: number | string) => {
    try {
      setModalLoadingId(anomalyId);
      const anomaly = await anomalyApi.getAnomalyById(anomalyId);
      setDualLogsAnomaly(anomaly);
    } catch (e) {
      console.error('Failed to load anomaly for Dual Logs Audit', e);
    } finally {
      setModalLoadingId(null);
    }
  };

  const markAsRead = async (id: number | string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_status: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: true } : n))
      );
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      let url = '/api/notifications/clear-all';
      if (userContext.facilityId) url += `?facility_id=${userContext.facilityId}`;
      await fetch(url, { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.read_status;
    if (activeTab === 'quality_engineer') {
      return (
        item.target_role.toLowerCase().includes('quality') ||
        item.type === 'NEW_ANOMALY'
      );
    }
    if (activeTab === 'facility_head') {
      return (
        item.target_role.toLowerCase().includes('head') ||
        item.target_role.toLowerCase().includes('manager') ||
        item.type === 'CAPA_RESOLVED'
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_status).length;
  const qaCount = notifications.filter(
    (n) => n.target_role.toLowerCase().includes('quality') || n.type === 'NEW_ANOMALY'
  ).length;
  const headCount = notifications.filter(
    (n) =>
      n.target_role.toLowerCase().includes('head') ||
      n.target_role.toLowerCase().includes('manager') ||
      n.type === 'CAPA_RESOLVED'
  ).length;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + d.toLocaleDateString() + ')';
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500" />
              {userContext.facilityName}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Alert Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time role-routed notifications for Quality Assurance Engineers & Facility Heads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs text-slate-700 hover:text-brand-600 flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Role Queue Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm font-semibold'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
          }`}
        >
          <span>All Facility Alerts</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quality_engineer')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'quality_engineer'
              ? 'bg-amber-600 text-white shadow-sm font-semibold'
              : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200/70'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Quality Engineer Queue</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'quality_engineer' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
            {qaCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('facility_head')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'facility_head'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200/70'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Facility Head Queue</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'facility_head' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {headCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'unread'
              ? 'bg-brand-600 text-white shadow-sm font-semibold'
              : 'bg-white text-slate-600 hover:bg-brand-50 border border-slate-200/70'
          }`}
        >
          <span>Unread Alerts</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          Loading alerts...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Notifications Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no active alerts matching this view for {userContext.facilityName}. New anomaly logs & CAPA resolution sign-offs will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                !item.read_status
                  ? 'border-brand-300 bg-brand-50/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                    item.type === 'NEW_ANOMALY'
                      ? 'bg-amber-100 text-amber-700'
                      : item.type === 'CAPA_RESOLVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.type === 'NEW_ANOMALY' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : item.type === 'CAPA_RESOLVED' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                      {item.title}
                    </h4>
                    {!item.read_status && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                        NEW
                      </span>
                    )}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      Target: {item.target_role}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.message}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-end sm:self-start shrink-0">
                {/* 1. Engineer Action: Run 5-Whys Copilot */}
                {item.anomaly_id && (isEngineer || activeTab === 'quality_engineer') && item.type === 'NEW_ANOMALY' && (
                  <Button
                    variant="dark"
                    size="sm"
                    onClick={() => {
                      if (!item.read_status) markAsRead(item.id);
                      handleOpen5Whys(item.anomaly_id!);
                    }}
                    disabled={modalLoadingId === item.anomaly_id}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{modalLoadingId === item.anomaly_id ? 'Loading...' : 'Run 5-Whys Copilot'}</span>
                  </Button>
                )}

                {/* 2. Quality Sign-off Action: Audit Dual Logs & Sign-Off */}
                {item.anomaly_id && (isQuality || activeTab === 'facility_head') && (item.type === 'CAPA_SUBMITTED_FOR_REVIEW' || item.type === 'NEW_ANOMALY') && (
                  <Button
                    variant="dark"
                    size="sm"
                    onClick={() => {
                      if (!item.read_status) markAsRead(item.id);
                      handleOpenDualLogs(item.anomaly_id!);
                    }}
                    disabled={modalLoadingId === item.anomaly_id}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>{modalLoadingId === item.anomaly_id ? 'Loading...' : 'Audit Dual Logs & Sign-Off'}</span>
                  </Button>
                )}

                {item.anomaly_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!item.read_status) markAsRead(item.id);
                      navigate('/app/anomalies');
                    }}
                    className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                  >
                    View Anomaly
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}

                {!item.read_status && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(item.id)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5-Whys Diagnostic Assistant Modal */}
      <FiveWhysCopilotModal
        isOpen={!!copilotAnomaly}
        onClose={() => setCopilotAnomaly(null)}
        anomaly={copilotAnomaly}
        onSuccess={() => {
          fetchNotifications();
        }}
      />

      {/* Dual Logs Audit & Sign-off Modal */}
      <DualLogsAuditModal
        isOpen={!!dualLogsAnomaly}
        onClose={() => setDualLogsAnomaly(null)}
        anomaly={dualLogsAnomaly}
        currentUser={userContext.name}
        currentRole={userContext.role}
        onSuccess={() => {
          fetchNotifications();
        }}
      />
    </div>
  );
};
export default NotificationAlerts;
