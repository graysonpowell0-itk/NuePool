import React from 'react';
import { LogEntry, PoolConfig } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Activity, CalendarDays, AlertCircle } from 'lucide-react';

interface DashboardProps {
  logs: LogEntry[];
  pool: PoolConfig;
  onNavigate: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, pool, onNavigate }) => {
  const lastLog = logs.length > 0 ? logs[0] : null;

  // Prepare data for chart (reverse chronologically for display)
  const chartData = [...logs].reverse().slice(-10).map(log => ({
    date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    ph: log.readings.ph,
    fc: log.readings.freeChlorine
  }));

  const getStatusColor = (val: number, min: number, max: number) => {
    if (val < min || val > max) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Droplets size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Pool Volume</p>
            <p className="text-xl font-bold text-slate-800">{pool.volume.toLocaleString()} gal</p>
          </div>
        </div>

        <div className={`bg-white p-4 rounded-xl shadow-sm border flex items-center space-x-4 ${lastLog ? getStatusColor(lastLog.readings.ph, 7.2, 7.8) : 'border-slate-200'}`}>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Last pH</p>
            <p className="text-xl font-bold text-slate-800">{lastLog ? lastLog.readings.ph : '--'}</p>
          </div>
        </div>

        <div className={`bg-white p-4 rounded-xl shadow-sm border flex items-center space-x-4 ${lastLog ? getStatusColor(lastLog.readings.freeChlorine, 1, 10) : 'border-slate-200'}`}>
           <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Last Free Chlorine</p>
            <p className="text-xl font-bold text-slate-800">{lastLog ? `${lastLog.readings.freeChlorine} ppm` : '--'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Last Service</p>
            <p className="text-sm font-bold text-slate-800">
              {lastLog ? new Date(lastLog.timestamp).toLocaleDateString() : 'Never'}
            </p>
            <p className="text-xs text-slate-400">by {lastLog ? lastLog.user : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Main Action Call */}
      {!lastLog && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex items-start space-x-3">
          <AlertCircle className="text-blue-500 mt-1" />
          <div>
            <h3 className="font-bold text-blue-700">Welcome to NeuPool!</h3>
            <p className="text-blue-600 text-sm">It looks like you haven't logged any readings yet. Go to the "Measure" tab to start balancing your pool.</p>
            <button
              onClick={() => onNavigate('measure')}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start First Measurement
            </button>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {logs.length > 1 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Water Balance Trends</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis yAxisId="left" stroke="#3b82f6" tick={{fontSize: 12}} domain={[6.8, 8.4]} label={{ value: 'pH', angle: -90, position: 'insideLeft', fill: '#3b82f6' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fontSize: 12}} label={{ value: 'FC (ppm)', angle: 90, position: 'insideRight', fill: '#10b981' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="pH" />
                <Line yAxisId="right" type="monotone" dataKey="fc" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Free Chlorine" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity Log Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          <button onClick={() => onNavigate('history')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {logs.slice(0, 3).map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-slate-900">{log.user}</span>
                  <span className="text-slate-500 text-sm ml-2">recorded readings</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                 <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(log.readings.ph, 7.2, 7.8)}`}>
                   pH: {log.readings.ph}
                 </span>
                 <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(log.readings.freeChlorine, 1, 10)}`}>
                   FC: {log.readings.freeChlorine}
                 </span>
                 <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                   Alk: {log.readings.totalAlkalinity}
                 </span>
              </div>
              {log.adjustments.length > 0 && (
                <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-semibold text-xs text-slate-500 uppercase tracking-wide">Added:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {log.adjustments.map((adj, i) => (
                      <li key={i}>{adj.amount} {adj.unit} of {adj.chemicalName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-8 text-center text-slate-400">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;