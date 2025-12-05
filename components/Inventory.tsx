import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Plus, Trash2, ShoppingBag, ExternalLink } from 'lucide-react';

interface InventoryProps {
  items: InventoryItem[];
  onUpdate?: (items: InventoryItem[]) => void; // Optional: Read-only for normal users if we wanted
}

const Inventory: React.FC<InventoryProps> = ({ items, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 0,
    unit: 'lbs',
    vendor: '',
    vendorUrl: ''
  });

  const canEdit = !!onUpdate;

  const handleAddItem = () => {
    if (!onUpdate || !newItem.name || newItem.quantity === undefined) return;
    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity,
      unit: newItem.unit || 'lbs',
      vendor: newItem.vendor,
      vendorUrl: newItem.vendorUrl,
      lastPurchased: new Date().toISOString()
    };
    onUpdate([...items, item]);
    setNewItem({ name: '', quantity: 0, unit: 'lbs', vendor: '', vendorUrl: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (onUpdate) onUpdate(items.filter(i => i.id !== id));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    if (!onUpdate) return;
    onUpdate(items.map(i => {
      if (i.id === id) {
        return { ...i, quantity: Math.max(0, i.quantity + delta) };
      }
      return i;
    }));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Chemical Inventory</h2>
        {canEdit && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all"
          >
            <Plus size={16} className="mr-1" /> Add Item
          </button>
        )}
      </div>

      {isAdding && canEdit && (
        <div className="bg-white p-4 rounded-xl shadow border border-blue-100 animate-fade-in-down">
          <h3 className="font-semibold text-slate-700 mb-3">Add New Supply</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Item Name (e.g. Chlorine Tabs)"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="p-3 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                className="p-3 border border-slate-200 rounded-lg w-24 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="p-3 border border-slate-200 rounded-lg flex-1 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="lbs">lbs</option>
                <option value="oz">oz</option>
                <option value="gal">gal</option>
                <option value="bags">bags</option>
                <option value="tabs">tabs</option>
              </select>
            </div>
            <input
              placeholder="Vendor Name"
              value={newItem.vendor}
              onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
              className="p-3 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              placeholder="Vendor Website URL"
              value={newItem.vendorUrl}
              onChange={(e) => setNewItem({ ...newItem, vendorUrl: e.target.value })}
              className="p-3 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
            <button onClick={handleAddItem} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Item</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                   <ShoppingBag size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800">{item.name}</h3>
                   {item.vendor && (
                     <div className="flex items-center text-xs text-slate-500 mt-1">
                       <span className="mr-1">Buy from: {item.vendor}</span>
                       {item.vendorUrl && (
                         <a href={item.vendorUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                           Link <ExternalLink size={10} className="ml-1" />
                         </a>
                       )}
                     </div>
                   )}
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="flex items-center border rounded-lg overflow-hidden border-slate-200">
                {canEdit && (
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-slate-600"
                  >
                    -
                  </button>
                )}
                <div className="px-4 py-1 font-mono font-medium text-slate-700 min-w-[3rem] text-center bg-white">
                  {item.quantity} <span className="text-xs text-slate-400">{item.unit}</span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-slate-600"
                  >
                    +
                  </button>
                )}
              </div>

              {canEdit && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
            {canEdit ? "No items in inventory. Add your chemicals here." : "Inventory is empty."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
