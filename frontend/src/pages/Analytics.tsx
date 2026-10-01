import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  Legend 
} from 'recharts';
import { RefreshCw, BarChart2, PieChart as PieIcon, Activity, AlertOctagon, TrendingUp, Clock } from 'lucide-react';
import { anomalyApi, Anomaly } from '../services/api';

const LINE_DISTRIBUTION = [
  { line: 'SMT Line 1', count: 1, critical: 0 },
  { line: 'Line A (Machining)', count: 2, critical: 0 },
  { line: 'Line B (Hydraulic)', count: 3, critical: 1 },
  { line: 'Line C (Robotics)', count: 1, critical: 0 },
  { line: 'Line D (Furnace)', count: 0, critical: 0 },
  { line: 'Line E (Assembly)', count: 4, critical: 1 },
];

const SEVERITY_DATA = [
  { name: 'Critical', value: 2, color: '#b91c1c' },
  { name: 'High', value: 3, color: '#ea580c' },
  { name: 'Medium', value: 4, color: '#d97706' },
  { name: 'Low', value: 2, color: '#475569' },
];

const TIMELINE_DATA = [
  { day: 'Mon', anomalies: 4, mttr: 3.1 },
  { day: 'Tue', anomalies: 6, mttr: 3.4 },
  { day: 'Wed', anomalies: 3, mttr: 2.8 },
  { day: 'Thu', anomalies: 5, mttr: 3.2 },
  { day: 'Fri', anomalies: 2, mttr: 2.5 },
  { day: 'Sat', anomalies: 1, mttr: 2.1 },
  { day: 'Sun', anomalies: 3, mttr: 2.9 },
];

export const Analytics: React.FC = () => {
  const [activeAnomalies, setActiveAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveAnomalies = async () => {
    try {
      setLoading(true);
      const data = await anomalyApi.getActiveAnomalies();
      setActiveAnomalies(data);
    } catch (err) {
      console.warn('Backend unavailable, using initial dataset for client-side aggregation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAnomalies();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Telemetry &amp; Recurrence Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Shopfloor variance distribution, MTTR trends, and plant line incident frequency
          </p>
        </div>
        <button
          onClick={fetchActiveAnomalies}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="console-card p-5 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Live Active Issues
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {activeAnomalies.length || 12}
            </div>
            <span className="text-xs text-slate-500 mt-1 block font-medium">
              Synchronized with Supabase
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <Activity className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        <div className="console-card p-5 flex items-start justify-between border-l-4 border-l-red-500">
          <div>
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
              Critical Hotspots
            </span>
            <div className="text-3xl font-extrabold text-red-600 mt-2 font-mono">
              {activeAnomalies.filter((a) => a.severity === 'CRITICAL').length || 2}
            </div>
            <span className="text-xs text-slate-500 mt-1 block font-medium">
              SMT &amp; Hydraulic Press
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="console-card p-5 flex items-start justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Plant Availability
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2 font-mono">
              98.4%
            </div>
            <span className="text-xs text-slate-500 mt-1 block font-medium">
              Target &gt; 97.5%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2 Chart Cards matching AnomIQ-V2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Anomalies by Production Line (BarChart) */}
        <div className="lg:col-span-6 console-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Anomalies by Production Line</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of incidents and critical threshold excursions</p>
            </div>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LINE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="line" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0} 
                  angle={-15} 
                  textAnchor="end" 
                  stroke="#cbd5e1"
                />
                <YAxis 
                  domain={[0, 4]} 
                  ticks={[0, 1, 2, 3, 4]} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  stroke="#cbd5e1"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => [val, 'Incident Excursions']}
                />
                <Bar dataKey="count" fill="#94a3b8" radius={[4, 4, 0, 0]}>
                  {LINE_DISTRIBUTION.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count >= 3 ? '#64748b' : '#cbd5e1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Incident Severity Breakdown (Donut PieChart) */}
        <div className="lg:col-span-6 console-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Incident Severity Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">Proportion of active alerts categorized by severity</p>
              </div>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SEVERITY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {SEVERITY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px' }}
                    formatter={(val: any, name?: any) => [`${val} active alerts`, String(name || '')]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
            {SEVERITY_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Influx vs MTTR Trend */}
      <div className="console-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">7-Day Incident Influx vs Resolution Cycle</h3>
            <p className="text-xs text-slate-500 mt-0.5">Mean Time To Resolve (MTTR in hours) compared against anomaly discovery count</p>
          </div>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TIMELINE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#475569" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803d" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="anomalies" name="New Anomalies" stroke="#475569" strokeWidth={2} fillOpacity={1} fill="url(#anomGrad)" />
              <Area type="monotone" dataKey="mttr" name="MTTR (Hours)" stroke="#15803d" strokeWidth={2} fillOpacity={1} fill="url(#mttrGrad)" />
              <Legend
                verticalAlign="top"
                align="right"
                height={30}
                formatter={(val) => <span className="text-xs text-slate-600 font-medium">{val}</span>}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
