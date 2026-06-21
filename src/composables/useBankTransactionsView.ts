import { computed, ref, watch } from 'vue';
import moment from 'moment';
import { useBankTransactionsStore } from '@/stores/bankTransactions';
import { usePurchasesStore } from '@/stores/purchases';
import { useUsersStore } from '@/stores/users';
import type { BankTransaction } from '@/types/BankTransaction';
import { useBankTransactionFilters } from '@/composables/useBankTransactionFilters';

function monthStart(d: Date): Date {
  return moment(d).startOf('month').toDate();
}

function monthEnd(d: Date): string {
  return moment(d).endOf('month').format('YYYY-MM-DD');
}

function monthStartStr(d: Date): string {
  return moment(d).startOf('month').format('YYYY-MM-DD');
}

export function useBankTransactionsView() {
  const bankStore = useBankTransactionsStore();
  const purchasesStore = usePurchasesStore();
  const usersStore = useUsersStore();

  const selectedMonth = ref(monthStart(new Date()));
  const purchasesCardSum = ref(0);
  const loadingPurchasesSum = ref(false);

  const rawMonthTransactions = computed(() => bankStore.rawTransactions);

  const filters = useBankTransactionFilters(rawMonthTransactions);

  const dateFrom = computed(() => monthStartStr(selectedMonth.value));
  const dateTo = computed(() => monthEnd(selectedMonth.value));

  const monthLabel = computed(() => {
    const fmt = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
    const from = moment(selectedMonth.value).startOf('month').toDate();
    const to = moment(selectedMonth.value).endOf('month').toDate();
    return `${fmt.format(from)} – ${fmt.format(to)}`;
  });

  const filteredByDate = computed(() => {
    const map = new Map<string, BankTransaction[]>();
    for (const t of filters.filteredTransactions.value) {
      const key = t.transactionDate;
      const arr = map.get(key);
      if (arr) arr.push(t);
      else map.set(key, [t]);
    }
    const sortedKeys = [...map.keys()].sort((a, b) => b.localeCompare(a));
    return sortedKeys.map(key => ({ date: key, items: map.get(key)! }));
  });

  async function loadMonth() {
    await bankStore.getTransactionsBetween(dateFrom.value, dateTo.value);
    filters.initAmountRange();
    await loadPurchasesSum();
  }

  async function loadPurchasesSum() {
    loadingPurchasesSum.value = true;
    try {
      const userIds = filters.selectedUsers.value.map(u => u.id);
      purchasesCardSum.value = await purchasesStore.getPurchasesSumBetween(
        dateFrom.value,
        dateTo.value,
        filters.isAdmin.value && userIds.length === usersStore.users.length ? undefined : userIds
      );
    } finally {
      loadingPurchasesSum.value = false;
    }
  }

  function prevMonth() {
    selectedMonth.value = moment(selectedMonth.value).subtract(1, 'month').startOf('month').toDate();
  }

  function nextMonth() {
    selectedMonth.value = moment(selectedMonth.value).add(1, 'month').startOf('month').toDate();
  }

  function setMonthFromDate(d: Date) {
    selectedMonth.value = monthStart(d);
  }

  watch(selectedMonth, () => {
    filters.amountRangeInitialized.value = false;
    void loadMonth();
  });

  watch(
    filters.selectedUsers,
    () => {
      void loadPurchasesSum();
    },
    { deep: true }
  );

  return {
    bankStore,
    selectedMonth,
    dateFrom,
    dateTo,
    monthLabel,
    ...filters,
    filteredByDate,
    purchasesCardSum,
    loadingPurchasesSum,
    loadMonth,
    prevMonth,
    nextMonth,
    setMonthFromDate,
  };
}
