
import React from 'react';
import { MonthlyBias, Trade, Alignment } from '../types';
import BiasCard from '../components/BiasCard';

interface DashboardProps {
  biases: MonthlyBias[];
  trades: Trade[];
  onRefresh?: () => void;
  isSyncing?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ biases, trades, onRefresh, isSyncing }) => {
  const recentTrades = trades.slice(0, 4);
  
  const alignedCount = trades.filter(t => t.alignment === Alignment.ALIGNED).length;
  const alignmentRate = trades.length > 0 ? (alignedCount / trades.length) * 100 : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-8">
      {/* Terminal Access Quick Action */}
      <section>
        <a 
          href="https://www.tradingview.com/chart/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative block w-full p-4 bg-slate-900 border border-emerald-500/20 rounded-2xl overflow-hidden transition-all hover:border-emerald-500/40 active:scale-[0.98] shadow-lg shadow-emerald-500/5"
        >
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <span className="text-emerald-500 text-lg">📈</span>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] leading-none mb-1">External Terminal</h3>
              <p className="text-sm font-bold text-white italic tracking-tighter">Launch TradingView</p>
            </div>
          </div>
        </a>
      </section>

      {/* Stacked Hero Metrics for Portrait */}
      <section className="flex flex-col gap-4">
        <div className="bg-[#0f172a] border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group shadow-xl">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Bias Adherence</p>
              <p className="text-3xl font-black text-emerald-400 tracking-tighter italic leading-none">{alignmentRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-500">A/B</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              style={{ width: `${alignmentRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0f172a] border border-slate-800/60 p-5 rounded-2xl shadow-xl">
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Entries</p>
            <p className="text-2xl font-black text-white italic mono leading-none">{trades.length}</p>
            <p className="text-slate-600 text-[9px] mt-1 font-bold">Verified</p>
          </div>
          <div className="bg-[#0f172a] border border-slate-800/60 p-5 rounded-2xl shadow-xl">
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Efficiency</p>
            <p className="text-2xl font-black text-emerald-400 italic mono leading-none">
              {trades.filter(t => t.alignment === Alignment.ALIGNED).length > 0
                ? `${(trades.filter(t => t.alignment === Alignment.ALIGNED).reduce((acc, t) => acc + t.resultR, 0) / 
                   trades.filter(t => t.alignment === Alignment.ALIGNED).length).toFixed(1)}R`
                : '0.0R'}
            </p>
            <p className="text-slate-600 text-[9px] mt-1 font-bold">Aligned Avg</p>
          </div>
        </div>
      </section>

      {/* Vertical Bias Feed */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-black tracking-tighter text-white uppercase italic">Context Engine</h3>
          <button 
            onClick={onRefresh}
            disabled={isSyncing}
            className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
          >
             <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
              {isSyncing ? 'Syncing...' : 'Sync Intelligence'}
             </span>
          </button>
        </div>
        <div className="space-y-4">
          {biases.map((bias) => (
            <BiasCard key={bias.id} bias={bias} />
          ))}
        </div>
      </section>

      {/* Condensed List for Portrait */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-black tracking-tighter text-white uppercase italic">Execution Feed</h3>
        </div>
        
        <div className="space-y-3">
          {recentTrades.length === 0 ? (
            <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-2xl text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Waiting for initial record...
            </div>
          ) : (
            recentTrades.map((trade) => (
              <div key={trade.id} className="bg-[#0f172a] border border-slate-800/50 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-xs ${
                      trade.direction === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {trade.direction === 'BUY' ? 'L' : 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-white italic uppercase tracking-tighter leading-none">{trade.asset}</p>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{trade.alignment}</span>
                    </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black mono leading-none ${trade.resultR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.resultR >= 0 ? '+' : ''}{trade.resultR.toFixed(1)}R
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
