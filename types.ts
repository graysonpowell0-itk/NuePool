export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, this would be hashed. Storing plain for demo.
  role: 'admin' | 'user';
  assignedPools: string[]; // IDs of pools this user can access
}

export interface PoolConfig {
  name: string;
  volume: number; // in gallons
  type: 'salt' | 'chlorine';
  surface: 'plaster' | 'vinyl' | 'fiberglass';
  category: 'pool' | 'spa';
}

export interface PoolData {
  id: string;
  config: PoolConfig;
  notes?: string;
  // We could add specific schedules here later
}

export interface ChemicalReading {
  ph: number;
  freeChlorine: number;
  totalAlkalinity: number;
  cyanuricAcid: number;
  calciumHardness?: number;
  saltLevel?: number; // ppm
  temperature?: number; // fahrenheit
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  vendor?: string;
  vendorUrl?: string;
  lastPurchased?: string;
  minThreshold?: number;
}

export interface ChemicalAdjustment {
  chemicalId: string; // References InventoryItem.id or generic name
  chemicalName: string;
  amount: number;
  unit: string;
  reason: string;
}

export interface LogEntry {
  id: string;
  poolId: string; // Linked to specific pool
  timestamp: string; // ISO date string
  user: string;
  readings: ChemicalReading;
  adjustments: ChemicalAdjustment[];
  waterAdded: boolean;
  waterDrained?: boolean;
  waterDrainedHalf?: boolean;
  waterEvents?: {
    added: boolean;
    drained: boolean;
    drainedHalf: boolean;
  };
  notes?: string;
}

export interface AIAnalysisResult {
  analysis: string;
  adjustments: ChemicalAdjustment[];
}

export type Tab = 'dashboard' | 'measure' | 'inventory' | 'history' | 'settings';

export interface AppState {
  users: User[];
  pools: PoolData[];
  inventory: InventoryItem[];
  logs: LogEntry[];
}
