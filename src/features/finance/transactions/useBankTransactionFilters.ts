import { computed, ref, type Ref } from 'vue';
import { useUsersStore } from '@/stores/users';
import { useAuthorizationStore } from '@/stores/authorization';
import type {
  BankTransaction,
  TransactionCategoryDto,
  TransactionCategoryType,
  TransactionLabelDto,
} from '@/features/finance/transactions/types';
import { UtilsService } from '@/service/UtilsService';
import type { User } from '@/types/User';
import {
  useTransactionCategoriesQuery,
  useTransactionLabelsQuery,
} from '@/features/finance/transactions/queries/useTransactionsQueries';
import { resolveTransactionCategory } from '@/features/finance/transactions/transactionEnrichment';

export function parseTransactionAmount(amount: string | number): number {
  return Math.abs(Number(amount));
}

export function getTransactionCategoryType(
  t: BankTransaction,
  categories: TransactionCategoryDto[]
): TransactionCategoryType | null {
  const category = resolveTransactionCategory(t.transactionCategory, categories);
  return category?.type ?? UtilsService.inferCategoryTypeFromTransactionType(t.transactionType);
}

export function useBankTransactionFilters(rawTransactions: Ref<BankTransaction[]>) {
  const categoriesQuery = useTransactionCategoriesQuery();
  const labelsQuery = useTransactionLabelsQuery();
  const usersStore = useUsersStore();
  const authStore = useAuthorizationStore();

  const categories = computed(() => categoriesQuery.data.value ?? []);
  const labels = computed(() => labelsQuery.data.value ?? []);

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
    const all = categories.value.map(c => c.id);
    return selectedCategoryIds.value.length === all.length && all.length > 0;
  });

  const amountBounds = computed(() => {
    const amounts = rawTransactions.value.map(t => parseTransactionAmount(t.amount));
    if (amounts.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...amounts), max: Math.max(...amounts) };
  });

  function initCategoryFilter(cats: TransactionCategoryDto[]) {
    selectedCategoryIds.value = cats.map(c => c.id);
  }

  function initLabelFilter(labelList?: TransactionLabelDto[]) {
    const all = labelList ?? labels.value;
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
    initCategoryFilter(categories.value);
    initLabelFilter();
    initPeopleFilter();
    noteFilter.value = '';
    initAmountRange();
  }

  const filteredTransactions = computed(() => {
    let list = [...rawTransactions.value];
    const catIds = selectedCategoryIds.value;
    const allCats = categories.value.map(c => c.id);

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
    const allLabels = labels.value.map(l => l.id);
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
      .filter(t => getTransactionCategoryType(t, categories.value) === 'INCOME')
      .reduce((s, t) => s + parseTransactionAmount(t.amount), 0)
  );

  const summaryExpenses = computed(() =>
    filteredTransactions.value
      .filter(t => getTransactionCategoryType(t, categories.value) === 'EXPENSE')
      .reduce((s, t) => s + parseTransactionAmount(t.amount), 0)
  );

  const summaryNetChange = computed(() => summaryIncome.value - summaryExpenses.value);

  function buildBalanceFilterParams() {
    const catIds = selectedCategoryIds.value;
    const allCats = categories.value.map(c => c.id);
    const labelIds = selectedLabelIds.value;
    const allLabels = labels.value.map(l => l.id);
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
    categories,
    labels,
    loadingCategories: computed(() => categoriesQuery.isFetching.value),
    loadingLabels: computed(() => labelsQuery.isFetching.value),
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
