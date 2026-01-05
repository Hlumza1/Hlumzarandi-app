
export type Asset = 'EURUSD' | 'GBPUSD' | 'USDJPY' | 'XAUUSD';

export enum BiasType {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL'
}

export enum Direction {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum Timeframe {
  SCALP = 'Scalp',
  DAY = 'Day',
  SWING = 'Swing',
  POSITION = 'Position'
}

export enum Alignment {
  ALIGNED = 'ALIGNED',
  AGAINST = 'AGAINST',
  NEUTRAL = 'NEUTRAL'
}

export interface MacroDriver {
  title: string;
  description: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MonthlyBias {
  id: string;
  asset: Asset;
  month: string; // e.g., "2024-02"
  bias: BiasType;
  confidence: number; // 0-100
  validityPeriod: string;
  drivers: MacroDriver[];
  invalidationConditions?: string;
  centralBankStance: string;
  inflationTrend: string;
  employmentTrend: string;
  growthOutlook: string;
  riskSentiment: string;
  sources?: GroundingSource[];
}

export interface Trade {
  id: string;
  timestamp: number;
  asset: Asset;
  direction: Direction;
  timeframe: Timeframe;
  entryPrice: number;
  exitPrice: number;
  resultR: number; // Risk-Reward or R result
  notes: string;
  snapshotBias: MonthlyBias;
  alignment: Alignment;
}

export interface AnalyticsSummary {
  totalTrades: number;
  winRate: number;
  avgR: number;
  alignmentRate: number; // % of trades aligned with bias
}
