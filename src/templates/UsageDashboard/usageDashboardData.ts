export type UsagePeriod = '1d' | '7d' | '30d' | 'mtd' | 'last-month';

export type GroupByOption = 'model' | 'user' | 'type';

export type MetricOption = 'spend' | 'tokens';

export type UsageLogRow = {
  cost: string;
  costNote: string;
  date: string;
  model: string;
  tokens: string;
  type: string;
  user: string;
};

export const MONTHLY_BUDGET = 200;
export const MONTHLY_SPENT = 101.01;
export const MONTHLY_RESET_LABEL = 'Resets Sep 1, 2024';

export const SUMMARY_STATS = {
  included: '$84.43',
  onDemand: '$0',
  total: '$84.43',
} as const;

export const PERIOD_OPTIONS: { id: UsagePeriod; label: string }[] = [
  { id: '1d', label: '1d' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: 'mtd', label: 'MTD' },
  { id: 'last-month', label: 'Last month' },
];

export const GROUP_BY_OPTIONS = [
  { label: 'Model', value: 'model' },
  { label: 'User', value: 'user' },
  { label: 'Type', value: 'type' },
] as const;

export const METRIC_OPTIONS = [
  { label: 'Spend', value: 'spend' },
  { label: 'Tokens', value: 'tokens' },
] as const;

export const CHART_SERIES = [
  { color: 'var(--modus-wc-color-primary)', id: 'grok', label: 'cursor-grok-1.0-high-fast' },
  { color: 'var(--modus-wc-color-success)', id: 'composer-fast', label: 'composer-2.5-fast' },
  { color: 'var(--modus-wc-color-warning)', id: 'composer', label: 'composer-2.5' },
] as const;

export type ChartPoint = {
  composer: number;
  composerFast: number;
  date: string;
  grok: number;
  label: string;
};

export const CHART_DATA: ChartPoint[] = [
  { label: 'Aug 22', date: '2024-08-22', grok: 8, composerFast: 4, composer: 6 },
  { label: 'Aug 23', date: '2024-08-23', grok: 18, composerFast: 10, composer: 14 },
  { label: 'Aug 24', date: '2024-08-24', grok: 28, composerFast: 16, composer: 22 },
  { label: 'Aug 25', date: '2024-08-25', grok: 42, composerFast: 24, composer: 30 },
  { label: 'Aug 26', date: '2024-08-26', grok: 55, composerFast: 32, composer: 38 },
  { label: 'Aug 27', date: '2024-08-27', grok: 68, composerFast: 40, composer: 46 },
  { label: 'Aug 28', date: '2024-08-28', grok: 84, composerFast: 48, composer: 54 },
];

export const USAGE_LOG_ROWS: UsageLogRow[] = [
  {
    cost: '$0.09',
    costNote: 'Included',
    date: 'Aug 25, 06:09 PM',
    model: 'composer-2.5',
    tokens: '427.4K',
    type: 'Included',
    user: 'martin_espericueta@trimble.com',
  },
  {
    cost: '$0.19',
    costNote: 'Included',
    date: 'Aug 25, 05:42 PM',
    model: 'composer-2.5-fast',
    tokens: '1M',
    type: 'Included',
    user: 'martin_espericueta@trimble.com',
  },
  {
    cost: '$0.12',
    costNote: 'Included',
    date: 'Aug 24, 11:18 AM',
    model: 'cursor-grok-1.0-high-fast',
    tokens: '612K',
    type: 'Included',
    user: 'martin_espericueta@trimble.com',
  },
  {
    cost: '$0.08',
    costNote: 'Included',
    date: 'Aug 23, 09:03 PM',
    model: 'composer-2.5',
    tokens: '318.2K',
    type: 'Included',
    user: 'martin_espericueta@trimble.com',
  },
  {
    cost: '$0.15',
    costNote: 'Included',
    date: 'Aug 23, 02:27 PM',
    model: 'composer-2.5-fast',
    tokens: '892K',
    type: 'Included',
    user: 'martin_espericueta@trimble.com',
  },
  {
    cost: '$0.11',
    costNote: 'Included',
    date: 'Aug 22, 04:55 PM',
    model: 'composer-2.5',
    tokens: '501K',
    type: 'Included',
    user: 'martin_espericueta@trimble.com',
  },
];
