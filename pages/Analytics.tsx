
import React from 'react';
import { Trade, Alignment } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AnalyticsProps {
  trades: Trade[];
}

const Analytics: React.FC<AnalyticsProps> = ({ trades }) => {
  const alignedTrades = trades.filter(t => t.alignment === Alignment.ALIGNED);
  const againstTrades = trades.filter(t => t.alignment === Alignment.AGAINST);
  const neutralTrades = trades.filter(t => t.alignment === Alignment.NEUTRAL);

  const getWinRate = (ts: Trade[]) => {
    if (ts.length === 0) return 0;
    return (ts.filter(t => t.resultR > 0).length / ts.length) * 100;
  };

  const performanceData = [
    { name: 'Aligned', winRate: getWinRate(alignedTrades), color: '#10b981' },
    { name: 'Against', winRate: getWinRate(againstTrades), color: '#f43f5e' },
    { name: 'Neutral', winRate: getWinRate(neutralTrades), color: '#f59e0b' },
  ];

  const distributionData = [
    { name: 'Aligned', value: alignedTrades.length },
    { name: 'Against', value: againstTrades.length },
    { name: 'Neutral', value: neutralTrades.length },
  ];

  const COLORS = ['#10b981', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
        <div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Macro Alpha</p>
          <p className="text-sm font-bold text-white">Edge Performance</p>
        </div>
        <div className="px-3 py-1 bg-slate-800 rounded text-[9px] font-mono text-slate-400 border border-slate-700">
          N={trades.length}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Win Rate by Alignment */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Win Rate % Performance</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                />
                <Bar dataKey="winRate" radius={[2, 2, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Distribution */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Volume Mix</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategic Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="p-5 bg-[#0f172a] border border-slate-800/60 rounded-2xl">
            <p className="text-[8px] text-slate-500 font-black uppercase mb-2">High-Conf Delta</p>
            <p className="text-base font-black text-emerald-500 italic tracking-tighter">
              {performanceData.sort((a,b) => b.winRate - a.winRate)[0].name} SETUP
            </p>
            <p className="text-[9px] text-slate-500 mt-1 font-medium leading-relaxed">
              Trading with institutional flow yields the highest probabilistic outcome for this strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
