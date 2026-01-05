
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSyncing?: boolean;
  lastSyncTime?: number | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isSyncing, lastSyncTime }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: '⧉' },
    { id: 'outlook', label: 'Macro', icon: '🌐' },
    { id: 'journal', label: 'Journal', icon: '✍︎' },
    { id: 'analytics', label: 'Edge', icon: '📈' },
  ];

  const d = new Date();
  const activeMonthName = d.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const fullDateStr = d.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatLastSync = (time: number | null) => {
    if (!time) return "Sync Required";
    const date = new Date(time);
    return `Synced ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* Mobile Top Header */}
      <header className="flex-none h-16 border-b border-slate-800/50 flex items-center justify-between px-5 bg-slate-950/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-emerald-950 font-black text-xs italic">H</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase italic leading-none">
              <span className="techno-animate">hlumzarandi</span>
            </h1>
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{fullDateStr}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-1">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              {isSyncing ? 'Accessing Factory.com...' : 'ForexFactory Grounded'}
            </span>
            <span className={`text-[10px] font-bold ${isSyncing ? 'text-amber-500' : 'text-emerald-500'} mono leading-none mt-0.5`}>
              {isSyncing ? 'Processing' : formatLastSync(lastSyncTime)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            JD
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-5 py-6 pb-24 no-scrollbar">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{activeTab}</h2>
              <p className="text-[8px] text-emerald-500/60 font-bold uppercase tracking-widest mt-0.5 italic">{activeMonthName} INTELLIGENCE</p>
            </div>
            <div className="h-0.5 flex-1 ml-4 bg-slate-800/50"></div>
          </div>
          {children}
        </div>
      </main>

      {/* Institutional Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-800/60 flex items-center justify-around px-2 pb-safe z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-1/4 h-full gap-1 transition-all duration-300 relative ${
              activeTab === item.id 
                ? 'text-emerald-400' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute top-0 w-8 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] rounded-full"></div>
            )}
            <span className={`text-2xl transition-transform ${activeTab === item.id ? 'scale-110 -translate-y-0.5' : 'opacity-60'}`}>
              {item.icon}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
