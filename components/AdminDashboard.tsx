import React, { useState } from 'react';
import { AppState, PoolData, User, InventoryItem } from '../types';
import Inventory from './Inventory';
import { Plus, Trash2, Edit2, Users, Waves, Package, Check, X } from 'lucide-react';

interface AdminDashboardProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, onUpdateState, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'pools' | 'users' | 'inventory'>('pools');
  const [editingPool, setEditingPool] = useState<Partial<PoolData> | null>(null);

  // --- Pool Management ---
  const handleSavePool = () => {
    if (!editingPool || !editingPool.config?.name) return;

    let newPools = [...state.pools];
    if (editingPool.id) {
      newPools = newPools.map(p => p.id === editingPool.id ? editingPool as PoolData : p);
    } else {
      const newPool: PoolData = {
        id: Date.now().toString(),
        config: editingPool.config!,
        notes: editingPool.notes || ''
      };
      newPools.push(newPool);
    }
    onUpdateState({ ...state, pools: newPools });
    setEditingPool(null);
  };

  const handleDeletePool = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pool? All logs associated with it will remain but the pool will be inaccessible.')) {
      onUpdateState({ ...state, pools: state.pools.filter(p => p.id !== id) });
    }
  };

  // --- User Management ---
  const toggleUserAccess = (userId: string, poolId: string) => {
    const updatedUsers = state.users.map(u => {
      if (u.id === userId) {
        const hasAccess = u.assignedPools.includes(poolId);
        return {
          ...u,
          assignedPools: hasAccess 
            ? u.assignedPools.filter(id => id !== poolId)
            : [...u.assignedPools, poolId]
        };
      }
      return u;
    });
    onUpdateState({ ...state, users: updatedUsers });
  };

  const handleDeleteUser = (userId: string) => {
      if (window.confirm("Delete this user?")) {
        onUpdateState({...state, users: state.users.filter(u => u.id !== userId)});
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">NeuPool <span className="text-purple-400">Admin</span></span>
          </div>
          <button onClick={onLogout} className="text-sm text-slate-400 hover:text-white transition-colors">Sign Out</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Tab Nav */}
        <div className="flex space-x-4 mb-8">
            <button 
                onClick={() => setActiveTab('pools')}
                className={`flex items-center px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'pools' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-200 text-slate-500 hover:bg-white/50'}`}
            >
                <Waves className="mr-2" size={20} /> Pool Accounts
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-200 text-slate-500 hover:bg-white/50'}`}
            >
                <Users className="mr-2" size={20} /> User Assignments
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-200 text-slate-500 hover:bg-white/50'}`}
            >
                <Package className="mr-2" size={20} /> Master Inventory
            </button>
        </div>

        {/* --- POOLS TAB --- */}
        {activeTab === 'pools' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Manage Pools</h2>
                <button 
                    onClick={() => setEditingPool({ 
                        config: { name: '', volume: 10000, type: 'chlorine', surface: 'plaster', category: 'pool' } 
                    })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-blue-500/20 transition-all"
                >
                    <Plus size={18} className="mr-2" /> Add New Pool
                </button>
            </div>

            {/* Edit Modal / Form Area */}
            {editingPool && (
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{editingPool.id ? 'Edit Pool' : 'Create New Pool'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Name</label>
                            <input 
                                value={editingPool.config?.name} 
                                onChange={e => setEditingPool({...editingPool, config: {...editingPool.config!, name: e.target.value}})}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Volume (Gallons)</label>
                            <input 
                                type="number"
                                value={editingPool.config?.volume} 
                                onChange={e => setEditingPool({...editingPool, config: {...editingPool.config!, volume: Number(e.target.value)}})}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                            <select 
                                value={editingPool.config?.type}
                                onChange={e => setEditingPool({...editingPool, config: {...editingPool.config!, type: e.target.value as any}})}
                                className="w-full p-2 border rounded"
                            >
                                <option value="chlorine">Chlorine</option>
                                <option value="salt">Saltwater</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setEditingPool({...editingPool, config: {...editingPool.config!, category: 'pool'}})}
                                    className={`flex-1 py-2 rounded border ${editingPool.config?.category === 'pool' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-slate-200'}`}
                                >
                                    Pool
                                </button>
                                <button 
                                    onClick={() => setEditingPool({...editingPool, config: {...editingPool.config!, category: 'spa'}})}
                                    className={`flex-1 py-2 rounded border ${editingPool.config?.category === 'spa' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-slate-200'}`}
                                >
                                    Spa
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingPool(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSavePool} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Save Configuration</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.pools.map(pool => (
                    <div key={pool.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{pool.config.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-semibold">{pool.config.category}</span>
                                    <span className="text-xs text-slate-400">{pool.config.volume.toLocaleString()} gal</span>
                                </div>
                            </div>
                            <div className="flex space-x-1">
                                <button onClick={() => setEditingPool(pool)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeletePool(pool.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                             <p className="text-xs text-slate-500 mb-2 font-medium uppercase">Assigned Staff:</p>
                             <div className="flex flex-wrap gap-1">
                                {state.users.filter(u => u.assignedPools.includes(pool.id)).map(u => (
                                    <span key={u.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100">
                                        {u.username}
                                    </span>
                                ))}
                                {state.users.filter(u => u.assignedPools.includes(pool.id)).length === 0 && (
                                    <span className="text-xs text-slate-400 italic">No users assigned</span>
                                )}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800">User Assignments</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Username</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Pool Assignments</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {state.users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {state.pools.map(pool => {
                                                const isAssigned = user.assignedPools.includes(pool.id);
                                                return (
                                                    <button 
                                                        key={pool.id}
                                                        onClick={() => toggleUserAccess(user.id, pool.id)}
                                                        className={`px-3 py-1 rounded-full text-xs border transition-all flex items-center ${
                                                            isAssigned 
                                                            ? 'bg-blue-600 border-blue-600 text-white' 
                                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                                                        }`}
                                                    >
                                                        {isAssigned && <Check size={12} className="mr-1" />}
                                                        {pool.config.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.role !== 'admin' && (
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
            <div className="animate-fade-in">
                <Inventory 
                    items={state.inventory} 
                    onUpdate={(newItems) => onUpdateState({...state, inventory: newItems})} 
                />
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
