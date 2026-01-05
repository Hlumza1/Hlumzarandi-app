import React, { useState } from 'react';
import { Asset, Direction, Timeframe } from '../types';
// ASSETS is defined in constants.ts, not types.ts
import { ASSETS } from '../constants';

interface TradeFormProps {
  onAdd: (data: any) => void;
  onClose: () => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    asset: 'EURUSD' as Asset,
    direction: Direction.BUY,
    timeframe: Timeframe.DAY,
    entryPrice: 0,
    exitPrice: 0,
    resultR: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Log Trade Entry</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Asset</label>
              <select 
                value={formData.asset}
                onChange={(e) => setFormData({...formData, asset: e.target.value as Asset})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Direction</label>
              <select 
                value={formData.direction}
                onChange={(e) => setFormData({...formData, direction: e.target.value as Direction})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value={Direction.BUY}>BUY / LONG</option>
                <option value={Direction.SELL}>SELL / SHORT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Entry Price</label>
              <input 
                type="number" step="0.00001"
                required
                value={formData.entryPrice}
                onChange={(e) => setFormData({...formData, entryPrice: parseFloat(e.target.value)})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Exit Price</label>
              <input 
                type="number" step="0.00001"
                required
                value={formData.exitPrice}
                onChange={(e) => setFormData({...formData, exitPrice: parseFloat(e.target.value)})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">R Result</label>
              <input 
                type="number" step="0.1"
                required
                value={formData.resultR}
                onChange={(e) => setFormData({...formData, resultR: parseFloat(e.target.value)})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                placeholder="e.g., 2.5 or -1.0"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Timeframe</label>
              <select 
                value={formData.timeframe}
                onChange={(e) => setFormData({...formData, timeframe: e.target.value as Timeframe})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value={Timeframe.SCALP}>SCALP</option>
                <option value={Timeframe.DAY}>DAY</option>
                <option value={Timeframe.SWING}>SWING</option>
                <option value={Timeframe.POSITION}>POSITION</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trade Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 h-24 resize-none"
              placeholder="Logic for entry, alignment thoughts..."
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 italic">Note</p>
            <p className="text-[10px] text-slate-400">
              The current monthly fundamental bias will be automatically attached to this entry and cannot be changed retroactively.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Confirm & Log Trade
          </button>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;