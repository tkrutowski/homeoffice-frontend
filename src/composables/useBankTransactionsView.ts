import { computed, ref, watch } from 'vue';
import moment from 'moment';
import { useBankTransactionsStore } from '@/stores/bankTransactions';
import { usePurchasesStore } from '@/stores/purchases';
import { useUsersStore } from '@/stores/users';
import { useAuthorizationStore } from '@/stores/authorization';
import type { BankTransaction, TransactionCategoryDto, TransactionCategoryType } from '@/types/BankTransaction';
import { UtilsService } from '@/service/UtilsService';
import type { User } from '@/types/User';

function parseAmount(amount: string | number): number {
  return Math.abs(Number(amount));
}

function getTransactionCategoryType(t: BankTransaction, bankStore: ReturnType<typeof useBankTransactionsStore>): TransactionCategoryType | null {
  const category = bankStore.resolveTransactionCategory(t.transactionCategory);
  return category?.type ?? UtilsService.inferCategoryTypeFromTransactionType(t.transactionType);
}

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
  const authStore = useAuthorizationStore();

  const selectedMonth = ref(monthStart(new Date()));
  const noteFilter = ref('');
  const selectedCategoryIds = ref<number[]>([]);
  const selectedUsers = ref<User[]>([]);
  const amountRange = ref<[number, number]>([0, 0]);
  const amountRangeInitialized = ref(false);
  const purchasesCardSum = ref(0);
  const loadingPurchasesSum = ref(false);

  const isAdmin = computed(() => authStore.hasAccessAdmin);

  const dateFrom = computed(() => monthStartStr(selectedMonth.value));
  const dateTo = computed(() => monthEnd(selectedMonth.value));

  const monthLabel = computed(() => {
    const from = moment(selectedMonth.value).startOf('month');
    const to = moment(selectedMonth.value).endOf('month');
    return `${from.format('MMM DD, YYYY')} – ${to.format('MMM DD, YYYY')}`;
  });

  const peopleOptions = computed(() => {
    if (isAdmin.value) return usersStore.users;
    const logged = usersStore.getLoggedUser;
    return logged ? [logged] : [];
  });

  const allCategoriesSelected = computed(() => {
    const all = bankStore.categories.map(c => c.id);
    return selectedCategoryIds.value.length === all.length && all.length > 0;
  });

  const rawMonthTransactions = computed(() => bankStore.rawTransactions);

  const amountBounds = computed(() => {
    const amounts = rawMonthTransactions.value.map(t => parseAmount(t.amount));
    if (amounts.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...amounts), max: Math.max(...amounts) };
  });

  function initCategoryFilter(categories: TransactionCategoryDto[]) {
    selectedCategoryIds.value = categories.map(c => c.id);
  }

  function initPeopleFilter() {
    const logged = usersStore.getLoggedUser;
    selectedUsers.value = logged ? [logged] : [];
  }

  function initAmountRange() {
    const { min, max } = amountBounds.value;
    amountRange.value = min === max ? [min, min] : [min, max];
    amountRangeInitialized.value = true;
  }

  function resetFilters() {
    initCategoryFilter(bankStore.categories);
    initPeopleFilter();
    noteFilter.value = '';
    initAmountRange();
  }

  const filteredTransactions = computed(() => {
    let list = [...rawMonthTransactions.value];
    const catIds = selectedCategoryIds.value;
    const allCats = bankStore.categories.map(c => c.id);

    if (catIds.length > 0 && catIds.length < allCats.length) {
      list = list.filter(t => t.transactionCategory && catIds.includes(t.transactionCategory.id));
    }

    const userIds = selectedUsers.value.map(u => u.id);
    const allUserIds = usersStore.users.map(u => u.id);
    if (userIds.length > 0 && userIds.length < allUserIds.length) {
      list = list.filter(t => userIds.includes(t.idUser));
    }

    const note = noteFilter.value.trim().toLowerCase();
    if (note) {
      list = list.filter(t => (t.description ?? '').toLowerCase().includes(note));
    }

    if (amountRangeInitialized.value) {
      const [min, max] = amountRange.value;
      list = list.filter(t => {
        const a = parseAmount(t.amount);
        return a >= min && a <= max;
      });
    }

    return list;
  });

  const filteredByDate = computed(() => {
    const map = new Map<string, BankTransaction[]>();
    for (const t of filteredTransactions.value) {
      const key = t.transactionDate;
      const arr = map.get(key);
      if (arr) arr.push(t);
      else map.set(key, [t]);
    }
    const sortedKeys = [...map.keys()].sort((a, b) => b.localeCompare(a));
    return sortedKeys.map(key => ({ date: key, items: map.get(key)! }));
  });

  const summaryIncome = computed(() =>
    filteredTransactions.value
      .filter(t => getTransactionCategoryType(t, bankStore) === 'INCOME')
      .reduce((s, t) => s + parseAmount(t.amount), 0)
  );

  const summaryExpenses = computed(() =>
    filteredTransactions.value
      .filter(t => getTransactionCategoryType(t, bankStore) === 'EXPENSE')
      .reduce((s, t) => s + parseAmount(t.amount), 0)
  );

  const summaryNetChange = computed(() => summaryIncome.value - summaryExpenses.value);

  async function loadMonth() {
    await bankStore.getTransactionsBetween(dateFrom.value, dateTo.value);
    initAmountRange();
    await loadPurchasesSum();
  }

  async function loadPurchasesSum() {
    loadingPurchasesSum.value = true;
    try {
      const userIds = selectedUsers.value.map(u => u.id);
      purchasesCardSum.value = await purchasesStore.getPurchasesSumBetween(
        dateFrom.value,
        dateTo.value,
        isAdmin.value && userIds.length === usersStore.users.length ? undefined : userIds
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
    amountRangeInitialized.value = false;
    void loadMonth();
  });

  watch(
    selectedUsers,
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
    noteFilter,
    selectedCategoryIds,
    selectedUsers,
    amountRange,
    amountRangeInitialized,
    amountBounds,
    isAdmin,
    peopleOptions,
    allCategoriesSelected,
    filteredByDate,
    filteredTransactions,
    summaryIncome,
    summaryExpenses,
    summaryNetChange,
    purchasesCardSum,
    loadingPurchasesSum,
    loadMonth,
    resetFilters,
    initCategoryFilter,
    initPeopleFilter,
    initAmountRange,
    prevMonth,
    nextMonth,
    setMonthFromDate,
  };
}
