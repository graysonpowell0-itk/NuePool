import React from 'react';
import { PoolData } from '../types';
import { Waves, ArrowRight, LogOut } from 'lucide-react';

interface PoolSelectorProps {
  pools: PoolData[];
  onSelect: (poolId: string) => void;
  onLogout: () => void;
  username: string;
}

const PoolSelector: React.FC<PoolSelectorProps> = ({ pools, onSelect, onLogout, username }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Hello, {username}</h1>
                <p className="text-slate-500">Select a pool to service today.</p>
            </div>
            <button 
                onClick={onLogout}
                className="flex items-center text-slate-500 hover:text-red-600 transition-colors"
            >
                <LogOut size={18} className="mr-2" />
                Sign Out
            </button>
        </div>

        {pools.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                <Waves size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800">No Assignments</h3>
                <p className="text-slate-500 mt-2">You haven't been assigned to any pools yet.</p>
                <p className="text-slate-400 text-sm mt-4">Please contact your administrator.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pools.map(pool => (
                    <button
                        key={pool.id}
                        onClick={() => onSelect(pool.id)}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Waves size={24} />
                            </div>
                            <ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">{pool.config.name}</h3>
                        <p className="text-sm text-slate-500">{pool.config.category.toUpperCase()} • {pool.config.volume.toLocaleString()} gal</p>
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default PoolSelector;
