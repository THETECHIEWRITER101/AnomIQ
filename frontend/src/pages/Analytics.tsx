import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { TrendingUp, AlertOctagon, Factory } from 'lucide-react';

export const Analytics: React.FC = () => {

  // Line Distribution Data
  const lineData = [
    { name: 'Line A (Machining)', anomalies: 12, critical: 3 },
    { name: 'Line B (Hydraulic)', anomalies: 19, critical: 6 },
    { name: 'Line C (Robotics)', anomalies: 14, critical: 4 },
    { name: 'Line D (Furnace)', anomalies: 8, critical: 1 },
    { name: 'Line E (Assembly)', anomalies: 5, critical: 0 },
  ];

  // Severity Distribution Data
  const severityData = [
    { name: 'Critical', value: 14, color: '#ef4444' },
    { name: 'High', value: 22, color: '#f97316' },
    { name: 'Medium', value: 15, color: '#eab308' },
    { name: 'Low', value: 7, color: '#3b82f6' },
  ];

  // 7-Day Trend
  const timelineData = [
    { day: 'Mon', anomalies: 8, resolved: 7, mttr: 4.1 },
    { day: 'Tue', anomalies: 11, resolved: 9, mttr: 3.8 },
    { day: 'Wed', anomalies: 6, resolved: 8, mttr: 3.2 },
    { day: 'Thu', anomalies: 14, resolved: 12, mttr: 2.9 },
    { day: 'Fri', anomalies: 9, resolved: 10, mttr: 2.6 },
    { day: 'Sat', anomalies: 4, resolved: 5, mttr: 2.2 },
    { day: 'Sun', anomalies: 2, resolved: 3, mttr: 1.9 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manufacturing Analytics & Telemetry Trends
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Recharts-powered performance diagnostics, failure clustering, and MTTR compression
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300">
            Window: Last 7 Days
          </span>
        </div>
      </div>

      {/* Top metric highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Overall OEE Health</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">87.4%</div>
          <p className="text-xs text-zinc-500 mt-1">+3.2% since AI CAPA deployment</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Total Downtime Prevented</span>
          <div className="text-3xl font-extrabold text-orange-400 mt-2">48.6 hrs</div>
          <p className="text-xs text-zinc-500 mt-1">Estimated savings: $38,500</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">AI CAPA Adoption Rate</span>
          <div className="text-3xl font-extrabold text-white mt-2">92.0%</div>
          <p className="text-xs text-zinc-500 mt-1">Supervisors approved & implemented</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Anomaly Frequency by Production Line */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Factory className="w-4 h-4 text-orange-400" />
              Incidents by Production Line
            </h2>
            <span className="text-xs text-zinc-500">Total vs Critical</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }} 
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="anomalies" name="Total Anomalies" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="critical" name="Critical Thresholds" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-orange-400" />
              Severity Proportions
            </h2>
            <span className="text-xs text-zinc-500">Distribution %</span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: 7-Day Resolution & MTTR Trend */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                7-Day Anomaly Detection vs Resolution Velocity
              </h2>
              <p className="text-xs text-zinc-400">Correlation between incident logging and resolution turnaround</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="anomalies" name="Logged Anomalies" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorAnom)" />
                <Area type="monotone" dataKey="resolved" name="Resolved Issues" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
