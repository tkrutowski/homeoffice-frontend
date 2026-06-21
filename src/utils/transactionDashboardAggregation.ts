import moment from 'moment';
import type { BankTransaction } from '@/types/BankTransaction';
import type { ChartGranularity } from '@/types/BankTransactionDashboard';

export function bucketKey(date: string, granularity: ChartGranularity): string {
  const m = moment(date);
  if (granularity === 'day') return m.format('YYYY-MM-DD');
  if (granularity === 'week') return m.startOf('isoWeek').format('YYYY-MM-DD');
  return m.startOf('month').format('YYYY-MM');
}

export function bucketLabel(key: string, granularity: ChartGranularity): string {
  if (granularity === 'month') {
    return moment(key, 'YYYY-MM').format('MMM YYYY');
  }
  const m = moment(key);
  if (granularity === 'week') {
    const end = m.clone().endOf('isoWeek');
    return `${m.format('D MMM')} – ${end.format('D MMM')}`;
  }
  return m.format('D MMM');
}

export function enumerateBuckets(dateFrom: string, dateTo: string, granularity: ChartGranularity): string[] {
  const keys: string[] = [];
  const start = moment(dateFrom);
  const end = moment(dateTo);
  const cursor =
    granularity === 'day'
      ? start.clone().startOf('day')
      : granularity === 'week'
        ? start.clone().startOf('isoWeek')
        : start.clone().startOf('month');

  while (cursor.isSameOrBefore(end, 'day')) {
    keys.push(bucketKey(cursor.format('YYYY-MM-DD'), granularity));
    if (granularity === 'day') cursor.add(1, 'day');
    else if (granularity === 'week') cursor.add(1, 'week');
    else cursor.add(1, 'month');
  }

  return [...new Set(keys)];
}

export function filterTransactionsByCategory(
  transactions: BankTransaction[],
  categoryId: number | null
): BankTransaction[] {
  return transactions.filter(t => {
    if (categoryId === null) return !t.transactionCategory;
    return t.transactionCategory?.id === categoryId;
  });
}

export function groupTransactionsByDate(transactions: BankTransaction[]): { date: string; items: BankTransaction[] }[] {
  const map = new Map<string, BankTransaction[]>();
  for (const t of transactions) {
    const key = t.transactionDate;
    const arr = map.get(key);
    if (arr) arr.push(t);
    else map.set(key, [t]);
  }
  const sortedKeys = [...map.keys()].sort((a, b) => b.localeCompare(a));
  return sortedKeys.map(key => ({ date: key, items: map.get(key)! }));
}

export function buildAmountsByBucket(
  transactions: BankTransaction[],
  dateFrom: string,
  dateTo: string,
  granularity: ChartGranularity,
  getAmount: (t: BankTransaction) => number
): { labels: string[]; amounts: number[] } {
  const keys = enumerateBuckets(dateFrom, dateTo, granularity);
  const amountMap = new Map<string, number>();
  for (const key of keys) amountMap.set(key, 0);

  for (const t of transactions) {
    const key = bucketKey(t.transactionDate, granularity);
    if (!amountMap.has(key)) continue;
    amountMap.set(key, (amountMap.get(key) ?? 0) + getAmount(t));
  }

  return {
    labels: keys.map(k => bucketLabel(k, granularity)),
    amounts: keys.map(k => amountMap.get(k) ?? 0),
  };
}
