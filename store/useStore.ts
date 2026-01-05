
import { useState, useEffect, useCallback } from 'react';
import { Trade, MonthlyBias, Asset, BiasType, Alignment, Direction } from '../types';
import { INITIAL_BIASES } from '../constants';
import { factoryService } from '../services/factoryService';

const TRADES_KEY = 'macro_journal_trades_v2';
// Include Year-Month in the cache key to force fresh data on month roll-over
const getBiasKey = () => {
  const now = new Date();
  return `macro_journal_biases_${now.getFullYear()}_${now.getMonth() + 1}`;
};
const SYNC_KEY = 'macro_journal_last_sync_v2';

export function useStore() {
  const [trades, setTrades] = useState<Trade[]>(() => {
    const stored = localStorage.getItem(TRADES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [biases, setBiases] = useState<MonthlyBias[]>(() => {
    const key = getBiasKey();
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed: MonthlyBias[] = JSON.parse(cached);
        const now = new Date();
        const currentMonthValue = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Final sanity check on month value
        if (parsed.length > 0 && parsed[0].month === currentMonthValue) {
          return parsed;
        }
      } catch (e) {
        console.warn("Stale bias cache discarded.");
      }
    }
    return INITIAL_BIASES;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => {
    const last = localStorage.getItem(SYNC_KEY);
    return last ? parseInt(last, 10) : null;
  });

  const syncWithFactory = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const latestData = await factoryService.getLatestData();
      if (latestData && latestData.length > 0) {
        setBiases(latestData);
        localStorage.setItem(getBiasKey(), JSON.stringify(latestData));
        const now = Date.now();
        setLastSyncTime(now);
        localStorage.setItem(SYNC_KEY, now.toString());
      }
    } catch (err) {
      console.error("Macro Sync Failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    // Aggressive sync on mount to ensure user always sees latest from the prompt context
    syncWithFactory();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithFactory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const saveTrades = (newTrades: Trade[]) => {
    setTrades(newTrades);
    localStorage.setItem(TRADES_KEY, JSON.stringify(newTrades));
  };

  const calculateAlignment = (direction: Direction, biasType: BiasType): Alignment => {
    if (biasType === BiasType.NEUTRAL) return Alignment.NEUTRAL;
    if (biasType === BiasType.BULLISH) {
      return direction === Direction.BUY ? Alignment.ALIGNED : Alignment.AGAINST;
    }
    if (biasType === BiasType.BEARISH) {
      return direction === Direction.SELL ? Alignment.ALIGNED : Alignment.AGAINST;
    }
    return Alignment.NEUTRAL;
  };

  const addTrade = (tradeData: Omit<Trade, 'id' | 'timestamp' | 'snapshotBias' | 'alignment'>) => {
    const currentBias = biases.find(b => b.asset === tradeData.asset) || biases[0];
    const alignment = calculateAlignment(tradeData.direction, currentBias.bias);
    
    const newTrade: Trade = {
      ...tradeData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      snapshotBias: JSON.parse(JSON.stringify(currentBias)), 
      alignment
    };

    saveTrades([newTrade, ...trades]);
  };

  const deleteTrade = (id: string) => {
    saveTrades(trades.filter(t => t.id !== id));
  };

  return {
    trades,
    biases,
    addTrade,
    deleteTrade,
    isSyncing,
    lastSyncTime,
    syncWithFactory
  };
}
