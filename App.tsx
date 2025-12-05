import React, { useState, useEffect } from 'react';
import { AppState, PoolData, LogEntry, InventoryItem, Tab, ChemicalReading, ChemicalAdjustment, User } from './types';
import Dashboard from './components/Dashboard';
import ReadingInput from './components/ReadingInput';
import Inventory from './components/Inventory';
import History from './components/History';
import Settings from './components/Settings';
import AuthSplash from './components/AuthSplash';
import AdminDashboard from './components/AdminDashboard';
import PoolSelector from './components/PoolSelector';
import { LayoutDashboard, FlaskConical, ClipboardList, Package, Settings as SettingsIcon, LogOut, ArrowLeft } from 'lucide-react';

// Initial Demo Data
const INITIAL_STATE: AppState = {
  users: [
    { id: '1', username: 'admin', password: 'password', role: 'admin', assignedPools: [] },
    { id: '2', username: 'tech', password: 'password', role: 'user', assignedPools: ['pool-1', 'pool-2'] }
  ],
  pools: [
    { id: 'pool-1', config: { name: 'Johnson Residence', volume: 15000, type: 'chlorine', surface: 'plaster', category: 'pool' } },
    { id: 'pool-2', config: { name: 'Sunset Hotel Spa', volume: 800, type: 'chlorine', surface: 'fiberglass', category: 'spa' } }
  ],
  inventory: [],
  logs: []
};

const App: React.FC = () => {
  // --- Global App State ---
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem('neuPoolState');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  // --- Session State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('neuPoolState', JSON.stringify(appState));
  }, [appState]);

  // --- Helpers ---
  const getCurrentPool = () => appState.pools.find(p => p.id === selectedPoolId) || appState.pools[0];
  const getPoolLogs = (poolId: string) => appState.logs.filter(l => l.poolId === poolId);

  // --- Handlers ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // If admin, they go to Admin Dashboard automatically.
    // If user, they go to Pool Selector.
  };

  const handleRegister = (username: string, password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role: 'user',
      assignedPools: []
    };
    setAppState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedPoolId(null);
    setActiveTab('dashboard');
  };

  const handleSaveReading = (
    reading: ChemicalReading,
    adjustments: ChemicalAdjustment[],
    waterEvents: { added: boolean; drained: boolean; drainedHalf: boolean },
    notes: string
  ) => {
    if (!selectedPoolId || !currentUser) return;

    const newLog: LogEntry = {
      id: Date.now().toString(),
      poolId: selectedPoolId,
      timestamp: new Date().toISOString(),
      user: currentUser.username,
      readings: reading,
      adjustments: adjustments,
      waterAdded: waterEvents.added,
      waterDrained: waterEvents.drained,
      waterDrainedHalf: waterEvents.drainedHalf,
      waterEvents: waterEvents,
      notes: notes
    };

    // Update Logs and Inventory in one go
    let newInventory = [...appState.inventory];
    if (adjustments.length > 0) {
      adjustments.forEach(adj => {
        const itemIndex = newInventory.findIndex(i => 
            adj.chemicalName.toLowerCase().includes(i.name.toLowerCase()) || 
            i.name.toLowerCase().includes(adj.chemicalName.toLowerCase())
        );
        if (itemIndex >= 0 && newInventory[itemIndex].unit === adj.unit) {
            newInventory[itemIndex].quantity = Math.max(0, newInventory[itemIndex].quantity - adj.amount);
        }
      });
    }

    setAppState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog],
      inventory: newInventory
    }));

    setActiveTab('dashboard');
  };

  // --- Pool Configuration Updates (from Settings inside User View) ---
  const handleUpdatePoolConfig = (newConfig: any) => {
      if (!selectedPoolId) return;
      const updatedPools = appState.pools.map(p => 
          p.id === selectedPoolId ? { ...p, config: newConfig } : p
      );
      setAppState(prev => ({ ...prev, pools: updatedPools }));
  };

  // --- Render Logic ---

  // 1. Splash / Auth
  if (!currentUser) {
    return <AuthSplash users={appState.users} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // 2. Admin Dashboard
  if (currentUser.role === 'admin') {
    return <AdminDashboard state={appState} onUpdateState={setAppState} onLogout={handleLogout} />;
  }

  // 3. Pool Selector (User Mode)
  if (!selectedPoolId) {
    // Filter pools assigned to this user
    const assignedPools = appState.pools.filter(p => currentUser.assignedPools.includes(p.id));
    return (
        <PoolSelector 
            pools={assignedPools} 
            username={currentUser.username} 
            onSelect={setSelectedPoolId} 
            onLogout={handleLogout} 
        />
    );
  }

  // 4. Main App (User Mode - Specific Pool)
  const activePool = getCurrentPool();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSelectedPoolId(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-1">
              <span className="text-blue-500 font-bold text-xl select-none">-</span>
              <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                  <FlaskConical className="text-white w-5 h-5" />
              </div>
              <span className="text-blue-500 font-bold text-xl select-none">+</span>
            </div>
            <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-slate-800 leading-tight">NeuPool</h1>
                <p className="text-xs text-slate-500">{activePool.config.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
             <span className="text-sm font-medium text-slate-600 mr-2">{currentUser.username}</span>
             <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24">
        {activeTab === 'dashboard' && (
          <Dashboard 
            logs={getPoolLogs(activePool.id)} 
            pool={activePool.config} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'measure' && (
          <ReadingInput 
            pool={activePool.config} 
            setPool={handleUpdatePoolConfig}
            inventory={appState.inventory} 
            currentUser={currentUser.username}
            onSave={handleSaveReading}
          />
        )}
        {activeTab === 'inventory' && (
            // Users can only VIEW inventory
            <Inventory items={appState.inventory} onUpdate={undefined} />
        )}
        {activeTab === 'history' && (
            <History logs={getPoolLogs(activePool.id)} />
        )}
        {activeTab === 'settings' && (
            // Simplified settings for User (just pool config mostly)
            <Settings 
                pool={activePool.config} 
                setPool={handleUpdatePoolConfig} 
                users={[]} // Users can't manage other users here
                setUsers={() => {}}
                currentUser={currentUser.username}
                setCurrentUser={() => {}}
            />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 w-full z-20 pb-safe">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-around">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <LayoutDashboard size={20} />
                <span className="text-[10px] font-medium mt-1">Dash</span>
            </button>

            <button 
                onClick={() => setActiveTab('measure')}
                className={`flex flex-col items-center p-2 ${activeTab === 'measure' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <FlaskConical size={20} />
                <span className="text-[10px] font-medium mt-1">Measure</span>
            </button>

            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex flex-col items-center p-2 ${activeTab === 'inventory' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Package size={20} />
                <span className="text-[10px] font-medium mt-1">Stock</span>
            </button>

            <button 
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center p-2 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <ClipboardList size={20} />
                <span className="text-[10px] font-medium mt-1">Logs</span>
            </button>

            <button 
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <SettingsIcon size={20} />
                <span className="text-[10px] font-medium mt-1">Config</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
