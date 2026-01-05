
import { Asset, BiasType, MonthlyBias } from './types';

export const ASSETS: Asset[] = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'];

const now = new Date();
const currentMonthValue = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
const currentMonthName = now.toLocaleString('default', { month: 'long' });
const currentYear = now.getFullYear();
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const validity = `${currentMonthName} 1 - ${currentMonthName} ${lastDay}, ${currentYear}`;

export const INITIAL_BIASES: MonthlyBias[] = ASSETS.map((asset, index) => ({
  id: `placeholder-${asset}-${currentMonthValue}`,
  asset: asset,
  month: currentMonthValue,
  bias: BiasType.NEUTRAL,
  confidence: 0,
  validityPeriod: validity,
  drivers: [
    { 
      title: 'Connecting to Factory...', 
      description: `Institutional intelligence for ${currentMonthName} ${currentYear} is being synthesized. Press "Sync Intelligence" if this does not update automatically.` 
    }
  ],
  centralBankStance: 'Fetching...',
  inflationTrend: 'Analyzing...',
  employmentTrend: 'Waiting...',
  growthOutlook: 'Pending...',
  riskSentiment: 'Neutral'
}));
