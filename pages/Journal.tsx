
import React, { useState } from 'react';
import { Trade, Alignment } from '../types';
import TradeForm from '../components/TradeForm';
import { geminiService } from '../services/geminiService';

interface JournalProps {
  trades: Trade[];
  onAdd: (data: any) => void;
  onDelete: (id: string) => void;
}

const Journal: React.FC<JournalProps> = ({ trades, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const lastMonthLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });

  const handleShowDetails = async (trade: Trade) => {
    setSelectedTrade(trade);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadFeedback = async () => {
    if (!selectedTrade) return;
    setLoadingFeedback(true);
    const text = await geminiService.getTradeFeedback(selectedTrade);
    setFeedback(text);
    setLoadingFeedback(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">Archive</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 active:bg-emerald-500 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          + Record
        </button>
      </div>

      {/* If a trade is selected, show details on top for Portrait mode focus */}
      {selectedTrade && (
        <div className="bg-[#0f172a] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <button 
            onClick={() => setSelectedTrade(null)}
            className="absolute top-4 right-4 text-slate-500 hover:text-white p-2"
          >
            ✕
          </button>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedTrade.asset} Audit</h3>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                  selectedTrade.alignment === Alignment.ALIGNED ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {selectedTrade.alignment}
                </span>
              </div>
              <p className="text-[8px] font-mono text-slate-500">ID: {selectedTrade.id.slice(0, 12)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
                <p className="text-[8px] text-slate-500 font-black uppercase mb-1">In</p>
                <p className="text-base font-black mono text-slate-100 italic">{selectedTrade.entryPrice}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
                <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Out</p>
                <p className="text-base font-black mono text-slate-100 italic">{selectedTrade.exitPrice}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/60 space-y-3">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Bias Snapshot</p>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold">Monthly Context:</span>
                <span className="text-white font-black italic uppercase tracking-tighter">{selectedTrade.snapshotBias.bias}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] border-t border-slate-800/50 pt-3">
                <span className="text-slate-400 font-bold">Reliability:</span>
                <span className="text-emerald-400 font-black mono">{selectedTrade.snapshotBias.confidence}%</span>
              </div>
            </div>

            {!feedback ? (
              <button 
                onClick={loadFeedback}
                disabled={loadingFeedback}
                className="w-full py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 active:scale-95 disabled:opacity-50"
              >
                {loadingFeedback ? 'Synthesizing...' : 'Request Performance Audit'}
              </button>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                <p className="text-[8px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-3">Institutional Feedback</p>
                <div className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                  {feedback}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Stream */}
      <div className="space-y-3">
        {trades.length === 0 ? (
          <div className="p-16 border-2 border-dashed border-slate-800 rounded-3xl text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Records Detected</p>
          </div>
        ) : (
          trades.map((trade) => (
            <div 
              key={trade.id} 
              onClick={() => handleShowDetails(trade)}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/50 shadow-md flex items-center justify-between ${
                selectedTrade?.id === trade.id ? 'border-emerald-500/40 bg-slate-800/40' : 'border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm ${
                  trade.direction === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {trade.direction === 'BUY' ? 'L' : 'S'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white italic tracking-tighter uppercase leading-none mb-1">{trade.asset}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-[8px] text-slate-500 font-black uppercase">{trade.timeframe}</p>
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-700"></span>
                    <p className="text-[8px] text-slate-600 font-bold uppercase">{lastMonthLabel}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-black mono italic leading-none ${trade.resultR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.resultR >= 0 ? '+' : ''}{trade.resultR.toFixed(1)}R
                  </p>
                  <p className="text-[8px] text-slate-600 font-black uppercase mt-1">{trade.alignment}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }}
                  className="text-slate-700 p-1"
                >
                  ⊘
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAdding && (
        <TradeForm 
          onAdd={onAdd}
          onClose={() => setIsAdding(false)}
        />
      )}
    </div>
  );
};

export default Journal;
