
import React, { useState } from 'react';
import { MonthlyBias, BiasType } from '../types';
import { geminiService } from '../services/geminiService';

interface BiasCardProps {
  bias: MonthlyBias;
}

const BiasCard: React.FC<BiasCardProps> = ({ bias }) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getTheme = () => {
    switch (bias.bias) {
      case BiasType.BULLISH: return {
        border: 'border-emerald-500/20',
        bg: 'from-emerald-500/10 to-transparent',
        accent: 'text-emerald-400',
        badge: 'bg-emerald-500 text-white shadow-emerald-500/20'
      };
      case BiasType.BEARISH: return {
        border: 'border-rose-500/20',
        bg: 'from-rose-500/10 to-transparent',
        accent: 'text-rose-400',
        badge: 'bg-rose-500 text-white shadow-rose-500/20'
      };
      default: return {
        border: 'border-amber-500/20',
        bg: 'from-amber-500/10 to-transparent',
        accent: 'text-amber-400',
        badge: 'bg-amber-500 text-white shadow-amber-500/20'
      };
    }
  };

  const theme = getTheme();

  const loadExplanation = async () => {
    setLoading(true);
    const text = await geminiService.explainBias(bias);
    setExplanation(text);
    setLoading(false);
  };

  const getTradingViewUrl = (asset: string) => {
    const symbolMap: Record<string, string> = {
      'EURUSD': 'FX:EURUSD',
      'GBPUSD': 'FX:GBPUSD',
      'USDJPY': 'FX:USDJPY',
      'XAUUSD': 'OANDA:XAUUSD'
    };
    return `https://www.tradingview.com/chart/?symbol=${symbolMap[asset] || asset}`;
  };

  return (
    <div className={`relative group rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bg} p-5 overflow-hidden transition-all duration-300 active:scale-[0.98]`}>
      {/* Background Asset Label Ghosted */}
      <div className="absolute -bottom-2 -right-1 text-7xl font-black text-white/5 pointer-events-none italic uppercase">
        {bias.asset.slice(0, 3)}
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-xl font-black tracking-tighter text-white uppercase italic">{bias.asset}</h3>
              <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-lg ${theme.badge}`}>
                {bias.bias}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{bias.validityPeriod}</p>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <a 
                href={getTradingViewUrl(bias.asset)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-black text-emerald-500/80 hover:text-emerald-400 uppercase tracking-widest underline decoration-emerald-500/20"
              >
                View Chart
              </a>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-white leading-none mono">{bias.confidence}%</div>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Conf. Score</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              Fundamental Drivers
            </h4>
            <div className="grid gap-2">
              {bias.drivers.map((driver, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl">
                  <p className={`text-[10px] font-bold mb-0.5 ${theme.accent}`}>{driver.title}</p>
                  <p className="text-[10px] text-slate-400 leading-snug font-medium line-clamp-2">{driver.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Bank', value: bias.centralBankStance },
              { label: 'Inf.', value: bias.inflationTrend },
            ].map((item, i) => (
              <div key={i} className="py-2 px-3 bg-slate-950/50 border border-slate-800/40 rounded-lg text-center">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">{item.label}</span>
                <span className="text-[10px] font-bold text-slate-300 truncate block">{item.value}</span>
              </div>
            ))}
          </div>

          {!explanation ? (
            <button 
              onClick={loadExplanation}
              disabled={loading}
              className="w-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-800/60 transition-all disabled:opacity-50"
            >
              {loading ? 'Synthesizing Analysis...' : 'Model Intelligence'}
            </button>
          ) : (
            <div className="p-4 bg-slate-950/80 border border-emerald-500/10 rounded-xl text-[10px] font-medium italic text-slate-400 leading-relaxed animate-in zoom-in-95">
              {explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiasCard;
