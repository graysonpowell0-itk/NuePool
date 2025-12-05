import React, { useState } from 'react';
import { ChemicalReading, PoolConfig, InventoryItem, AIAnalysisResult, ChemicalAdjustment } from '../types';
import { calculatePoolAdjustments } from '../services/geminiService';
import { FlaskConical, Save, Loader2, Sparkles, AlertTriangle, Waves, Plus, Trash2 } from 'lucide-react';

interface ReadingInputProps {
  pool: PoolConfig;
  setPool: (pool: PoolConfig) => void;
  inventory: InventoryItem[];
  currentUser: string;
  onSave: (reading: ChemicalReading, adjustments: ChemicalAdjustment[], waterEvents: { added: boolean; drained: boolean; drainedHalf: boolean }, notes: string) => void;
}

const ReadingInput: React.FC<ReadingInputProps> = ({ pool, setPool, inventory, currentUser, onSave }) => {
  // Local state for inputs. Temp is string to allow empty value.
  const [ph, setPh] = useState<string>('7.4');
  const [fc, setFc] = useState<string>('3.0');
  const [alk, setAlk] = useState<string>('100');
  const [cya, setCya] = useState<string>('50');
  const [calcium, setCalcium] = useState<string>('250');
  const [salt, setSalt] = useState<string>(pool.type === 'salt' ? '3000' : '');
  const [temp, setTemp] = useState<string>(pool.category === 'spa' ? '100' : '');

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  
  // Manual Adjustments State
  const [manualAdjustments, setManualAdjustments] = useState<ChemicalAdjustment[]>([]);
  const [manualName, setManualName] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualUnit, setManualUnit] = useState('lbs');
  
  // Water Flags
  const [waterAdded, setWaterAdded] = useState(false);
  const [waterDrained, setWaterDrained] = useState(false);
  const [drainedHalf, setDrainedHalf] = useState(false);

  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getReadingObject = (): ChemicalReading => ({
    ph: parseFloat(ph) || 0,
    freeChlorine: parseFloat(fc) || 0,
    totalAlkalinity: parseFloat(alk) || 0,
    cyanuricAcid: parseFloat(cya) || 0,
    calciumHardness: parseFloat(calcium) || 0,
    saltLevel: pool.type === 'salt' ? (parseFloat(salt) || 0) : undefined,
    temperature: temp ? parseFloat(temp) : undefined
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setManualAdjustments([]); // Reset manual adjustments on new analysis
    try {
      const result = await calculatePoolAdjustments(
          pool, 
          getReadingObject(), 
          inventory, 
          { added: waterAdded, drained: waterDrained, drainedHalf }
        );
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = () => {
    // Combine AI adjustments with manual user adjustments
    const finalAdjustments = [
      ...(analysis?.adjustments || []),
      ...manualAdjustments
    ];

    onSave(
        getReadingObject(), 
        finalAdjustments, 
        { added: waterAdded, drained: waterDrained, drainedHalf }, 
        notes
    );
    
    // Reset form
    setAnalysis(null);
    setManualAdjustments([]);
    setNotes('');
    setWaterAdded(false);
    setWaterDrained(false);
    setDrainedHalf(false);
    setManualName('');
    setManualAmount('');
  };

  const handleAddManualAdjustment = () => {
    if (!manualName || !manualAmount) return;
    const newAdj: ChemicalAdjustment = {
      chemicalId: `manual-${Date.now()}`,
      chemicalName: manualName,
      amount: parseFloat(manualAmount),
      unit: manualUnit,
      reason: 'Manual Addition'
    };
    setManualAdjustments([...manualAdjustments, newAdj]);
    setManualName('');
    setManualAmount('');
    setManualUnit('lbs');
  };

  const handleRemoveManualAdjustment = (id: string) => {
    setManualAdjustments(manualAdjustments.filter(a => a.chemicalId !== id));
  };

  const handleDrainedHalfChange = (checked: boolean) => {
      setDrainedHalf(checked);
      if (checked) setWaterDrained(true);
  };

  const handleCategoryToggle = (category: 'pool' | 'spa') => {
    setPool({ ...pool, category });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4 sm:mb-0">
                <FlaskConical className="mr-2 text-blue-500" />
                New Measurement
            </h2>
            
            {/* Pool/Spa Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                <button
                    onClick={() => handleCategoryToggle('pool')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${
                        pool.category === 'pool' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Waves size={14} className="mr-1.5" /> Pool
                </button>
                <button
                    onClick={() => handleCategoryToggle('spa')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${
                        pool.category === 'spa' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Waves size={14} className="mr-1.5" /> Spa
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">pH Level</label>
            <input
              type="number"
              step="0.1"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
              placeholder="e.g. 7.4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Free Chlorine (ppm)</label>
            <input
              type="number"
              step="0.5"
              value={fc}
              onChange={(e) => setFc(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
              placeholder="e.g. 3.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Alkalinity (ppm)</label>
            <input
              type="number"
              step="10"
              value={alk}
              onChange={(e) => setAlk(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
              placeholder="e.g. 100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cyanuric Acid (ppm)</label>
            <input
              type="number"
              step="10"
              value={cya}
              onChange={(e) => setCya(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
              placeholder="e.g. 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Calcium Hardness (ppm)</label>
            <input
              type="number"
              step="10"
              value={calcium}
              onChange={(e) => setCalcium(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
              placeholder="e.g. 250"
            />
          </div>

          {pool.type === 'salt' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salt Level (ppm)</label>
              <input
                type="number"
                step="100"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
                placeholder="e.g. 3000"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Water Temp (°F)
              {pool.category === 'pool' ? 
                <span className="text-slate-400 font-normal ml-1">(Optional)</span> : 
                <span className="text-amber-600 font-normal ml-1 text-xs">* Recommended for Spas</span>
              }
            </label>
            <input
              type="number"
              value={temp}
              placeholder={pool.category === 'pool' ? "Optional" : "Required for Spa"}
              onChange={(e) => setTemp(e.target.value)}
              className={`w-full p-3 bg-white text-slate-900 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400 ${
                  pool.category === 'spa' && !temp ? 'border-amber-300 bg-amber-50' : 'border-slate-300'
              }`}
            />
          </div>
        </div>

        {/* Water Level Adjustments Section */}
        <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Water Level Adjustments</h3>
            <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                        type="checkbox"
                        checked={waterAdded}
                        onChange={(e) => setWaterAdded(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <div>
                        <span className="text-slate-900 font-medium">Added Fresh Water</span>
                        <p className="text-xs text-slate-500">Topped off pool/spa using hose</p>
                    </div>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                        type="checkbox"
                        checked={waterDrained}
                        onChange={(e) => {
                            setWaterDrained(e.target.checked);
                            if (!e.target.checked) setDrainedHalf(false);
                        }}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                    />
                     <div>
                        <span className="text-slate-900 font-medium">Drained Water</span>
                        <p className="text-xs text-slate-500">Removed water (e.g., backwashing or lowering level)</p>
                    </div>
                </label>

                <label className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${waterDrained ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                    <input
                        type="checkbox"
                        checked={drainedHalf}
                        disabled={!waterDrained}
                        onChange={(e) => handleDrainedHalfChange(e.target.checked)}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
                    />
                     <div>
                        <span className={`font-medium ${waterDrained ? 'text-red-800' : 'text-slate-500'}`}>Drained 50% or more</span>
                        <p className="text-xs text-slate-500">Major water replacement</p>
                    </div>
                </label>
            </div>
        </div>

        <div className="mt-8">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full flex items-center justify-center px-6 py-4 rounded-xl text-white font-bold text-lg transition-all ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Analyzing Water Chemistry...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" size={24} />
                  Calculate Adjustment
                </>
              )}
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center">
            <AlertTriangle className="mr-2" />
            {error}
        </div>
      )}

      {/* Results Section */}
      {analysis && (
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in-up">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
            <h3 className="text-indigo-900 font-bold text-lg flex items-center">
              <Sparkles className="mr-2 text-indigo-500" size={18} />
              AI Recommendations
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm leading-relaxed border border-slate-100">
              <span className="font-semibold text-slate-900 block mb-1">Analysis:</span>
              {analysis.analysis}
            </div>

            {/* AI Recommended Chemicals */}
            {analysis.adjustments.length > 0 ? (
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Required Chemicals:</h4>
                <div className="space-y-3">
                  {analysis.adjustments.map((adj, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                      <div className="flex items-center space-x-3">
                         <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                           {idx + 1}
                         </div>
                         <div>
                           <p className="font-bold text-slate-800">{adj.chemicalName}</p>
                           <p className="text-xs text-slate-500">{adj.reason}</p>
                         </div>
                      </div>
                      <div className="mt-2 sm:mt-0 text-right">
                        <span className="text-lg font-bold text-indigo-600">{adj.amount}</span>
                        <span className="text-sm text-slate-600 font-medium ml-1">{adj.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                Water is perfectly balanced! No chemicals needed.
              </div>
            )}

            {/* Manual Adjustments Section */}
            <div className="border-t border-slate-100 pt-4">
                <h4 className="font-semibold text-slate-800 mb-3">Additional Chemicals Added:</h4>
                {manualAdjustments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {manualAdjustments.map((adj) => (
                      <div key={adj.chemicalId} className="flex justify-between items-center p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <div>
                          <span className="font-bold text-slate-800">{adj.chemicalName}</span>
                          <span className="text-sm text-slate-500 ml-2">({adj.amount} {adj.unit})</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveManualAdjustment(adj.chemicalId)} 
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Manual Add Form */}
                <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input 
                        type="text" 
                        placeholder="Chemical Name (e.g. Algaecide)" 
                        value={manualName}
                        onChange={e => setManualName(e.target.value)}
                        className="flex-[2] p-2 bg-white text-slate-900 border border-slate-300 rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="flex gap-2 flex-1">
                        <input 
                            type="number" 
                            placeholder="Amt" 
                            value={manualAmount}
                            onChange={e => setManualAmount(e.target.value)}
                            className="w-20 p-2 bg-white text-slate-900 border border-slate-300 rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <select
                            value={manualUnit}
                            onChange={e => setManualUnit(e.target.value)}
                            className="flex-1 min-w-[80px] p-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="lbs">lbs</option>
                            <option value="oz">oz</option>
                            <option value="gal">gal</option>
                            <option value="tabs">tabs</option>
                            <option value="cups">cups</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleAddManualAdjustment}
                        disabled={!manualName || !manualAmount}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Log Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Cleaned skimmer baskets, backwashed filter..."
                className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm placeholder-slate-400"
              />
            </div>

            <button
              onClick={handleCommit}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center text-lg"
            >
              <Save className="mr-2" />
              Save to Log & Apply Updates
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingInput;