
import { Asset, BiasType, MonthlyBias } from './types';

export const ASSETS: Asset[] = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'];

export const INITIAL_BIASES: MonthlyBias[] = [
  {
    id: 'b1',
    asset: 'EURUSD',
    month: '2024-02',
    bias: BiasType.BEARISH,
    confidence: 75,
    validityPeriod: 'Feb 1 - Feb 29',
    drivers: [
      { title: 'Divergent Central Banks', description: 'ECB turning dovish while Fed remains restrictive.' },
      { title: 'Growth Slowdown', description: 'EU PMIs indicate stagnation in manufacturing.' },
      { title: 'Yield Spread', description: 'US Treasury yields outperforming Bunds.' }
    ],
    invalidationConditions: 'ECB surprise hike or significant US CPI miss.',
    centralBankStance: 'Dovish Tilt',
    inflationTrend: 'Falling steadily',
    employmentTrend: 'Weakening slightly',
    growthOutlook: 'Stagnant',
    riskSentiment: 'Risk-Off'
  },
  {
    id: 'b2',
    asset: 'XAUUSD',
    month: '2024-02',
    bias: BiasType.BULLISH,
    confidence: 85,
    validityPeriod: 'Feb 1 - Feb 29',
    drivers: [
      { title: 'Geopolitical Risk', description: 'Increased tensions in Middle East driving safe haven demand.' },
      { title: 'Real Yields', description: 'Anticipated peak in real rates supporting non-yielding assets.' },
      { title: 'Central Bank Buying', description: 'Emerging markets continue heavy accumulation.' }
    ],
    invalidationConditions: 'Significant escalation in US rates or dollar strength spike.',
    centralBankStance: 'Neutral',
    inflationTrend: 'Sticky',
    employmentTrend: 'Stable',
    growthOutlook: 'Uncertain',
    riskSentiment: 'Risk-Off'
  },
  {
    id: 'b3',
    asset: 'USDJPY',
    month: '2024-02',
    bias: BiasType.BULLISH,
    confidence: 65,
    validityPeriod: 'Feb 1 - Feb 29',
    drivers: [
      { title: 'BoJ Inertia', description: 'Bank of Japan maintaining negative interest rates longer than expected.' },
      { title: 'US Exceptionalism', description: 'US economy outperforming G7 counterparts.' },
      { title: 'Carry Trade Demand', description: 'Yield differentials favor long USD positions.' }
    ],
    centralBankStance: 'Hawkish (USD) / Dovish (JPY)',
    inflationTrend: 'Rising (USD) / Stable (JPY)',
    employmentTrend: 'Tight (USD)',
    growthOutlook: 'Strong (USD)',
    riskSentiment: 'Mixed'
  },
  {
    id: 'b4',
    asset: 'GBPUSD',
    month: '2024-02',
    bias: BiasType.NEUTRAL,
    confidence: 50,
    validityPeriod: 'Feb 1 - Feb 29',
    drivers: [
      { title: 'Mixed Data', description: 'UK inflation sticky but growth outlook remains dismal.' },
      { title: 'Political Risk', description: 'Early election rumors creating volatility without direction.' }
    ],
    centralBankStance: 'Neutral',
    inflationTrend: 'Sticky',
    employmentTrend: 'Moderating',
    growthOutlook: 'Fragile',
    riskSentiment: 'Neutral'
  }
];
