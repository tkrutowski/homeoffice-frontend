export type BalanceGranularity = 'DAY' | 'WEEK' | 'MONTH';

export type ChartGranularity = 'day' | 'week' | 'month';

export type PeriodMode = 'month' | 'year' | 'custom';

export interface BalanceFilterParams {
  categoryIds?: number[];
  labelIds?: number[];
  userIds?: number[];
  note?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface BalanceQueryParams extends BalanceFilterParams {
  dateTo: string;
}

export interface BalanceSeriesQueryParams extends BalanceFilterParams {
  dateFrom: string;
  dateTo: string;
  granularity: BalanceGranularity;
}

export interface BalanceSeriesPoint {
  date: string;
  balance: number;
}

export interface CategoryBreakdownItem {
  categoryId: number | null;
  categoryName: string;
  count: number;
  total: number;
  color: string;
  icon?: string | null;
}

export interface ChangesBucketData {
  labels: string[];
  income: number[];
  expenses: number[];
}
