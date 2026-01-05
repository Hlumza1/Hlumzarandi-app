
import { useState, useEffect, useCallback } from 'react';
import { Trade, MonthlyBias, Asset, BiasType, Alignment, Direction } from '../types';
import { INITIAL_BIASES } from '../constants';
import { factoryService } from '../services/factoryService';

const TRADES_KEY = 'macro_journal_trades';
const BIASES_KEY = 'macro_journal_biases_cache';
const SYNC_KEY = 'macro_journal_last_sync';

export function useStore() {
  const [trades, setTrades] = useState<Trade[]>(() => {
    const stored = localStorage.getItem(TRADES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [biases, setBiases] = useState<MonthlyBias[]>(() => {
    const cached = localStorage.getItem(BIASES_KEY);
    return cached ? JSON.parse(cached) : INITIAL_BIASES;
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
        localStorage.setItem(BIASES_KEY, JSON.stringify(latestData));
        const now = Date.now();
        setLastSyncTime(now);
        localStorage.setItem(SYNC_KEY, now.toString());
      }
    } catch (err) {
      console.error("Failed to sync macro data:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    // Refresh data in background on every mount
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
