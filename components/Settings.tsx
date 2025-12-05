import React from 'react';
import { PoolConfig } from '../types';
import { Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  pool: PoolConfig;
  setPool: (pool: PoolConfig) => void;
  users?: string[]; // Deprecated in User view
  setUsers?: (users: string[]) => void; // Deprecated in User view
  currentUser?: string;
  setCurrentUser?: (user: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ pool, setPool }) => {
  // We removed user management from here as it resides in AdminDashboard now.
  // This component now strictly handles the specific pool configuration.

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      {/* Pool Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <SettingsIcon className="mr-2 text-slate-500" /> Pool Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              value={pool.name}
              onChange={(e) => setPool({ ...pool, name: e.target.value })}
              className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg placeholder-slate-400"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Body of Water</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setPool({ ...pool, category: 'pool' })}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        pool.category === 'pool' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Pool
                </button>
                <button
                    onClick={() => setPool({ ...pool, category: 'spa' })}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        pool.category === 'spa' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Spa
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Volume (Gallons)</label>
              <input
                type="number"
                value={pool.volume}
                onChange={(e) => setPool({ ...pool, volume: parseInt(e.target.value) || 0 })}
                className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sanitizer Type</label>
              <select
                value={pool.type}
                onChange={(e) => setPool({ ...pool, type: e.target.value as any })}
                className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg"
              >
                <option value="chlorine">Chlorine</option>
                <option value="salt">Saltwater</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Surface Material</label>
              <select
                value={pool.surface}
                onChange={(e) => setPool({ ...pool, surface: e.target.value as any })}
                className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg"
              >
                <option value="plaster">Plaster</option>
                <option value="vinyl">Vinyl</option>
                <option value="fiberglass">Fiberglass</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        NeuPool v1.2.0
      </div>
    </div>
  );
};

export default Settings;
