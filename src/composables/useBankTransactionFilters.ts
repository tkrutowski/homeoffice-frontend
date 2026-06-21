import { computed, ref, type Ref } from 'vue';
import { useBankTransactionsStore } from '@/stores/bankTransactions';
import { useUsersStore } from '@/stores/users';
import { useAuthorizationStore } from '@/stores/authorization';
import type {
  BankTransaction,
  TransactionCategoryDto,
  TransactionCategoryType,
  TransactionLabelDto,
} from '@/types/BankTransaction';
import { UtilsService } from '@/service/UtilsService';
import type { User } from '@/types/User';

export function parseTransactionAmount(amount: string | number): number {
  return Math.abs(Number(amount));
}

export function getTransactionCategoryType(
  t: BankTransaction,
  bankStore: ReturnType<typeof useBankTransactionsStore>
): TransactionCategoryType | null {
  const category = bankStore.resolveTransactionCategory(t.transactionCategory);
  return category?.type ?? UtilsService.inferCategoryTypeFromTransactionType(t.transactionType);
}

export function useBankTransactionFilters(rawTransactions: Ref<BankTransaction[]>) {
  const bankStore = useBankTransactionsStore();
  const usersStore = useUsersStore();
  const authStore = useAuthorizationStore();

  const noteFilter = ref('');
  const selectedCategoryIds = ref<number[]>([]);
  const selectedLabelIds = ref<number[]>([]);
  const selectedUsers = ref<User[]>([]);
  const amountRange = ref<[number, number]>([0, 0]);
  const amountRangeInitialized = ref(false);

  const isAdmin = computed(() => authStore.hasAccessAdmin);

  const peopleOptions = computed(() => {
    if (isAdmin.value) return usersStore.users;
    const logged = usersStore.getLoggedUser;
    return logged ? [logged] : [];
  });

  const allCategoriesSelected = computed(() => {
    const all = bankStore.categories.map(c => c.id);
    return selectedCategoryIds.value.length === all.length && all.length > 0;
  });

  const amountBounds = computed(() => {
    const amounts = rawTransactions.value.map(t => parseTransactionAmount(t.amount));
    if (amounts.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...amounts), max: Math.max(...amounts) };
  });

  function initCategoryFilter(categories: TransactionCategoryDto[]) {
    selectedCategoryIds.value = categories.map(c => c.id);
  }

  function initLabelFilter(labels?: TransactionLabelDto[]) {
    const all = labels ?? bankStore.labels;
    selectedLabelIds.value = all.map(l => l.id);
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
    initLabelFilter();
    initPeopleFilter();
    noteFilter.value = '';
    initAmountRange();
  }

  const filteredTransactions = computed(() => {
    let list = [...rawTransactions.value];
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

    const labelIds = selectedLabelIds.value;
    const allLabels = bankStore.labels.map(l => l.id);
    if (labelIds.length > 0 && labelIds.length < allLabels.length) {
      list = list.filter(t => t.transactionLabel?.some(l => labelIds.includes(l.id)));
    }

    if (amountRangeInitialized.value) {
      const [min, max] = amountRange.value;
      list = list.filter(t => {
        const a = parseTransactionAmount(t.amount);
        return a >= min && a <= max;
      });
    }

    return list;
  });

  const summaryIncome = computed(() =>
    filteredTransactions.value
      .filter(t => getTransactionCategoryType(t, bankStore) === 'INCOME')
      .reduce((s, t) => s + parseTransactionAmount(t.amount), 0)
  );

  const summaryExpenses = computed(() =>
    filteredTransactions.value
      .filter(t => getTransactionCategoryType(t, bankStore) === 'EXPENSE')
      .reduce((s, t) => s + parseTransactionAmount(t.amount), 0)
  );

  const summaryNetChange = computed(() => summaryIncome.value - summaryExpenses.value);

  function buildBalanceFilterParams() {
    const catIds = selectedCategoryIds.value;
    const allCats = bankStore.categories.map(c => c.id);
    const labelIds = selectedLabelIds.value;
    const allLabels = bankStore.labels.map(l => l.id);
    const userIds = selectedUsers.value.map(u => u.id);
    const allUserIds = usersStore.users.map(u => u.id);
    const note = noteFilter.value.trim();

    const params: {
      categoryIds?: number[];
      labelIds?: number[];
      userIds?: number[];
      note?: string;
      amountMin?: number;
      amountMax?: number;
    } = {};

    if (catIds.length > 0 && catIds.length < allCats.length) {
      params.categoryIds = catIds;
    }
    if (labelIds.length > 0 && labelIds.length < allLabels.length) {
      params.labelIds = labelIds;
    }
    if (userIds.length > 0 && userIds.length < allUserIds.length) {
      params.userIds = userIds;
    }
    if (note) params.note = note;
    if (amountRangeInitialized.value) {
      const [min, max] = amountRange.value;
      params.amountMin = min;
      params.amountMax = max;
    }

    return params;
  }

  return {
    noteFilter,
    selectedCategoryIds,
    selectedLabelIds,
    selectedUsers,
    amountRange,
    amountRangeInitialized,
    amountBounds,
    isAdmin,
    peopleOptions,
    allCategoriesSelected,
    filteredTransactions,
    summaryIncome,
    summaryExpenses,
    summaryNetChange,
    initCategoryFilter,
    initLabelFilter,
    initPeopleFilter,
    initAmountRange,
    resetFilters,
    buildBalanceFilterParams,
  };
}
