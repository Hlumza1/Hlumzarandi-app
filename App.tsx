
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import { useStore } from './store/useStore';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    trades, 
    biases, 
    addTrade, 
    deleteTrade, 
    isSyncing, 
    lastSyncTime, 
    syncWithFactory 
  } = useStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard biases={biases} trades={trades} onRefresh={syncWithFactory} isSyncing={isSyncing} />;
      case 'outlook':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Global Macro Outlook</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Fundamental divergence across capital markets.</p>
            </div>
            <div className="flex flex-col gap-6">
              {biases.map(b => (
                <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{b.asset}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      b.bias === 'BULLISH' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                      b.bias === 'BEARISH' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    }`}>
                      {b.bias}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Institutional Drivers</h4>
                      <ul className="space-y-3">
                        {b.drivers.map((d, i) => (
                          <li key={i} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
                            <p className="text-[11px] font-bold text-slate-200 mb-0.5">{d.title}</p>
                            <p className="text-[10px] text-slate-500 leading-normal">{d.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {b.sources && b.sources.length > 0 && (
                    <div className="pt-4 border-t border-slate-800/50">
                      <h4 className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Grounding Sources</h4>
                      <div className="flex flex-wrap gap-2">
                        {b.sources.slice(0, 2).map((s, idx) => (
                          <a 
                            key={idx} 
                            href={s.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] text-emerald-500/80 hover:text-emerald-400 font-bold border-b border-emerald-500/20 transition-colors"
                          >
                            {s.title.slice(0, 30)}...
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'journal':
        return <Journal trades={trades} onAdd={addTrade} onDelete={deleteTrade} />;
      case 'analytics':
        return <Analytics trades={trades} />;
      default:
        return <Dashboard biases={biases} trades={trades} onRefresh={syncWithFactory} isSyncing={isSyncing} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isSyncing={isSyncing}
      lastSyncTime={lastSyncTime}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
