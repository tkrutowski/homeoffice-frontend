import { computed, ref, watch } from 'vue';
import moment from 'moment';
import { useBankTransactionsStore } from '@/stores/bankTransactions';
import {
  getTransactionCategoryType,
  parseTransactionAmount,
  useBankTransactionFilters,
} from '@/composables/useBankTransactionFilters';
import type { TransactionCategoryType } from '@/types/BankTransaction';
import type {
  BalanceGranularity,
  CategoryBreakdownItem,
  ChangesBucketData,
  ChartGranularity,
  PeriodMode,
} from '@/types/BankTransactionDashboard';
import { TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';
import { UtilsService } from '@/service/UtilsService';
import { bucketKey, bucketLabel, enumerateBuckets } from '@/utils/transactionDashboardAggregation';

function monthStart(d: Date): Date {
  return moment(d).startOf('month').toDate();
}

function yearStart(d: Date): Date {
  return moment(d).startOf('year').toDate();
}

function toChartGranularity(g: ChartGranularity): BalanceGranularity {
  if (g === 'day') return 'DAY';
  if (g === 'week') return 'WEEK';
  return 'MONTH';
}

export function useBankTransactionsDashboard() {
  const bankStore = useBankTransactionsStore();

  const periodMode = ref<PeriodMode>('month');
  const anchorDate = ref(monthStart(new Date()));
  const customRange = ref<[Date, Date] | null>(null);
  const chartGranularity = ref<ChartGranularity>('month');

  const currentBalance = ref<number | null>(null);
  const balanceSeries = ref<{ date: string; balance: number }[]>([]);
  const loadingBalance = ref(false);

  const rawTransactions = computed(() => bankStore.rawTransactions);
  const filters = useBankTransactionFilters(rawTransactions);

  const dateFrom = computed(() => {
    if (periodMode.value === 'month') {
      return moment(anchorDate.value).startOf('month').format('YYYY-MM-DD');
    }
    if (periodMode.value === 'year') {
      return moment(anchorDate.value).startOf('year').format('YYYY-MM-DD');
    }
    const range = customRange.value;
    if (range?.[0]) return moment(range[0]).format('YYYY-MM-DD');
    return moment().startOf('month').format('YYYY-MM-DD');
  });

  const dateTo = computed(() => {
    if (periodMode.value === 'month') {
      return moment(anchorDate.value).endOf('month').format('YYYY-MM-DD');
    }
    if (periodMode.value === 'year') {
      return moment(anchorDate.value).endOf('year').format('YYYY-MM-DD');
    }
    const range = customRange.value;
    if (range?.[1]) return moment(range[1]).format('YYYY-MM-DD');
    return moment().endOf('month').format('YYYY-MM-DD');
  });

  const periodLabel = computed(() => {
    const fmt = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
    const from = moment(dateFrom.value).toDate();
    const to = moment(dateTo.value).toDate();
    return `${fmt.format(from)} – ${fmt.format(to)}`;
  });

  const incomeBreakdown = computed(() => buildCategoryBreakdown('INCOME'));
  const expenseBreakdown = computed(() => buildCategoryBreakdown('EXPENSE'));

  const changesChartData = computed(() => buildChangesByBucket(chartGranularity.value));

  function buildCategoryBreakdown(type: TransactionCategoryType): CategoryBreakdownItem[] {
    const map = new Map<string, CategoryBreakdownItem>();

    for (const t of filters.filteredTransactions.value) {
      if (getTransactionCategoryType(t, bankStore) !== type) continue;

      const cat = bankStore.resolveTransactionCategory(t.transactionCategory);
      const key = cat ? String(cat.id) : '__uncategorized__';
      const name = cat?.name ?? 'Bez kategorii';
      const amount = parseTransactionAmount(t.amount);

      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.total += amount;
      } else {
        map.set(key, {
          categoryId: cat?.id ?? null,
          categoryName: name,
          count: 1,
          total: amount,
          color: UtilsService.normalizeHexColor(cat?.color) ?? TRANSACTION_CATEGORY_DEFAULT_COLOR,
          icon: cat?.icon,
        });
      }
    }

    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  function buildChangesByBucket(granularity: ChartGranularity): ChangesBucketData {
    const keys = enumerateBuckets(dateFrom.value, dateTo.value, granularity);
    const incomeMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();

    for (const key of keys) {
      incomeMap.set(key, 0);
      expenseMap.set(key, 0);
    }

    for (const t of filters.filteredTransactions.value) {
      const key = bucketKey(t.transactionDate, granularity);
      if (!incomeMap.has(key)) continue;
      const type = getTransactionCategoryType(t, bankStore);
      const amount = parseTransactionAmount(t.amount);
      if (type === 'INCOME') incomeMap.set(key, (incomeMap.get(key) ?? 0) + amount);
      else if (type === 'EXPENSE') expenseMap.set(key, (expenseMap.get(key) ?? 0) + amount);
    }

    return {
      labels: keys.map(k => bucketLabel(k, granularity)),
      income: keys.map(k => incomeMap.get(k) ?? 0),
      expenses: keys.map(k => expenseMap.get(k) ?? 0),
    };
  }

  async function loadPeriod() {
    await bankStore.getTransactionsBetween(dateFrom.value, dateTo.value);
    filters.initAmountRange();
    await loadBalanceData();
  }

  async function loadBalanceData() {
    loadingBalance.value = true;
    try {
      const filterParams = filters.buildBalanceFilterParams();
      const [balance, series] = await Promise.all([
        bankStore.getCurrentBalance({ dateTo: dateTo.value, ...filterParams }),
        bankStore.getBalanceSeries({
          dateFrom: dateFrom.value,
          dateTo: dateTo.value,
          granularity: toChartGranularity(chartGranularity.value),
          ...filterParams,
        }),
      ]);
      currentBalance.value = balance;
      balanceSeries.value = series;
    } finally {
      loadingBalance.value = false;
    }
  }

  function prevPeriod() {
    if (periodMode.value === 'month') {
      anchorDate.value = moment(anchorDate.value).subtract(1, 'month').startOf('month').toDate();
    } else if (periodMode.value === 'year') {
      anchorDate.value = moment(anchorDate.value).subtract(1, 'year').startOf('year').toDate();
    } else if (customRange.value) {
      const [from, to] = customRange.value;
      const days = moment(to).diff(moment(from), 'days') + 1;
      customRange.value = [moment(from).subtract(days, 'days').toDate(), moment(to).subtract(days, 'days').toDate()];
    }
  }

  function nextPeriod() {
    if (periodMode.value === 'month') {
      anchorDate.value = moment(anchorDate.value).add(1, 'month').startOf('month').toDate();
    } else if (periodMode.value === 'year') {
      anchorDate.value = moment(anchorDate.value).add(1, 'year').startOf('year').toDate();
    } else if (customRange.value) {
      const [from, to] = customRange.value;
      const days = moment(to).diff(moment(from), 'days') + 1;
      customRange.value = [moment(from).add(days, 'days').toDate(), moment(to).add(days, 'days').toDate()];
    }
  }

  function setMonthFromDate(d: Date) {
    anchorDate.value = monthStart(d);
  }

  function setYearFromDate(d: Date) {
    anchorDate.value = yearStart(d);
  }

  function setCustomRangeFromDates(dates: Date[]) {
    if (dates.length >= 2 && dates[0] && dates[1]) {
      customRange.value = [dates[0], dates[1]];
    }
  }

  function initCustomRange() {
    if (!customRange.value) {
      customRange.value = [moment().startOf('month').toDate(), moment().endOf('month').toDate()];
    }
  }

  watch(periodMode, mode => {
    filters.amountRangeInitialized.value = false;
    if (mode === 'custom') initCustomRange();
    if (mode === 'month') anchorDate.value = monthStart(anchorDate.value);
    if (mode === 'year') anchorDate.value = yearStart(anchorDate.value);
  });

  watch([periodMode, anchorDate, customRange], () => {
    filters.amountRangeInitialized.value = false;
    void loadPeriod();
  });

  watch(chartGranularity, () => {
    void loadBalanceData();
  });

  watch(
    [
      filters.noteFilter,
      filters.selectedCategoryIds,
      filters.selectedLabelIds,
      filters.selectedUsers,
      filters.amountRange,
    ],
    () => {
      void loadBalanceData();
    },
    { deep: true }
  );

  return {
    bankStore,
    periodMode,
    anchorDate,
    customRange,
    chartGranularity,
    dateFrom,
    dateTo,
    periodLabel,
    currentBalance,
    balanceSeries,
    loadingBalance,
    incomeBreakdown,
    expenseBreakdown,
    changesChartData,
    ...filters,
    loadPeriod,
    loadBalanceData,
    prevPeriod,
    nextPeriod,
    setMonthFromDate,
    setYearFromDate,
    setCustomRangeFromDates,
    initCustomRange,
  };
}
