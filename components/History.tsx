import React from 'react';
import { LogEntry } from '../types';
import { Droplets, Clock, ArrowDownCircle, AlertOctagon } from 'lucide-react';

interface HistoryProps {
  logs: LogEntry[];
}

const History: React.FC<HistoryProps> = ({ logs }) => {
  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-xl font-bold text-slate-800">Maintenance Log</h2>
      <div className="space-y-4">
        {[...logs].reverse().map((log) => (
          <div key={log.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                  {log.user.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{new Date(log.timestamp).toLocaleDateString()} <span className="text-slate-400 font-normal text-sm">at {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                  <p className="text-xs text-slate-500">Maintained by {log.user}</p>
                </div>
              </div>
              
              <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
                  {(log.waterAdded || log.waterEvents?.added) && (
                    <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-medium">
                      <Droplets size={12} className="mr-1" /> Water Added
                    </div>
                  )}
                  {(log.waterDrained || log.waterEvents?.drained) && (
                    <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-medium">
                      <ArrowDownCircle size={12} className="mr-1" /> Drained
                    </div>
                  )}
                  {(log.waterDrainedHalf || log.waterEvents?.drainedHalf) && (
                    <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-medium border border-red-100">
                      <AlertOctagon size={12} className="mr-1" /> &gt;50% Drained
                    </div>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
               <div>
                 <p className="text-xs text-slate-400 uppercase">pH</p>
                 <p className="font-semibold text-slate-700">{log.readings.ph}</p>
               </div>
               <div>
                 <p className="text-xs text-slate-400 uppercase">Chlorine</p>
                 <p className="font-semibold text-slate-700">{log.readings.freeChlorine} <span className="text-xs font-normal">ppm</span></p>
               </div>
               <div>
                 <p className="text-xs text-slate-400 uppercase">Alkalinity</p>
                 <p className="font-semibold text-slate-700">{log.readings.totalAlkalinity} <span className="text-xs font-normal">ppm</span></p>
               </div>
               <div>
                 <p className="text-xs text-slate-400 uppercase">CYA</p>
                 <p className="font-semibold text-slate-700">{log.readings.cyanuricAcid} <span className="text-xs font-normal">ppm</span></p>
               </div>
               {log.readings.calciumHardness !== undefined && log.readings.calciumHardness > 0 && (
                 <div>
                   <p className="text-xs text-slate-400 uppercase">Calcium</p>
                   <p className="font-semibold text-slate-700">{log.readings.calciumHardness} <span className="text-xs font-normal">ppm</span></p>
                 </div>
               )}
            </div>

            {log.adjustments.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Chemicals Added</p>
                <ul className="space-y-1">
                  {log.adjustments.map((adj, i) => (
                    <li key={i} className="text-sm text-slate-700 flex justify-between">
                      <span>{adj.chemicalName}</span>
                      <span className="font-mono font-medium">{adj.amount} {adj.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {log.notes && (
              <div className="mt-3 text-sm text-slate-500 italic">
                "{log.notes}"
              </div>
            )}
          </div>
        ))}
        {logs.length === 0 && (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                <Clock size={48} className="mb-4 opacity-20" />
                <p>No history available yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default History;
