<script setup lang="ts">
  import TheMenuFinance from '@/features/finance/_shared/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import TransactionMonthToolbar from '@/features/finance/transactions/TransactionMonthToolbar.vue';
  import TransactionFiltersPanel from '@/features/finance/transactions/TransactionFiltersPanel.vue';
  import TransactionSummaryCards from '@/features/finance/transactions/TransactionSummaryCards.vue';
  import TransactionItemGroup from '@/features/finance/transactions/TransactionItemGroup.vue';
  import AddEditTransactionDialog from '@/features/finance/transactions/AddEditTransactionDialog.vue';
  import { UtilsService } from '@/service/UtilsService';
  import { useBankTransactionsView } from '@/features/finance/transactions/useBankTransactionsView';
  import { useUsersStore } from '@/stores/users';
  import type { BankTransaction } from '@/features/finance/transactions/types';
  import { onMounted, ref, watch } from 'vue';
  import Popover from 'primevue/popover';
  import { ptDatePickerField } from '@/config/formFieldPt';

  const usersStore = useUsersStore();

  const {
    selectedMonth,
    monthLabel,
    noteFilter,
    selectedCategoryIds,
    selectedLabelIds,
    selectedUsers,
    amountRange,
    amountBounds,
    isAdmin,
    peopleOptions,
    filteredByDate,
    summaryIncome,
    summaryExpenses,
    summaryNetChange,
    purchasesCardSum,
    loadingPurchasesSum,
    loadingTransactions,
    categories,
    labels,
    loadingCategories,
    loadingLabels,
    loadMonth,
    resetFilters,
    initCategoryFilter,
    initLabelFilter,
    initPeopleFilter,
    prevMonth,
    nextMonth,
    setMonthFromDate,
  } = useBankTransactionsView();

  const showAddDialog = ref(false);
  const editTransaction = ref<BankTransaction | null>(null);
  const monthPickerRef = ref<InstanceType<typeof Popover> | null>(null);
  const monthPickerDate = ref<Date>(new Date());

  UtilsService.getTypesForFinance();

  onMounted(async () => {
    if (usersStore.users.length === 0) await usersStore.getUsersFromDb();
    initPeopleFilter();
    monthPickerDate.value = selectedMonth.value;
    await loadMonth();
  });

  watch(
    categories,
    cats => {
      if (cats.length > 0 && selectedCategoryIds.value.length === 0) {
        initCategoryFilter(cats);
      }
    },
    { immediate: true }
  );

  watch(
    labels,
    labs => {
      if (labs.length > 0 && selectedLabelIds.value.length === 0) {
        initLabelFilter(labs);
      }
    },
    { immediate: true }
  );

  function openAddDialog() {
    editTransaction.value = null;
    showAddDialog.value = true;
  }

  function openEditDialog(tx: BankTransaction) {
    editTransaction.value = tx;
    showAddDialog.value = true;
  }

  function onDialogSaved() {
    void loadMonth();
  }

  function onResetFilters() {
    resetFilters();
  }

  function onCalendarClick(event: Event) {
    monthPickerDate.value = selectedMonth.value;
    monthPickerRef.value?.toggle(event);
  }

  function applyMonthPicker() {
    setMonthFromDate(monthPickerDate.value);
    monthPickerRef.value?.hide();
  }

  function onCategoryIdsUpdate(ids: number[]) {
    selectedCategoryIds.value = ids;
  }

  function onLabelIdsUpdate(ids: number[]) {
    selectedLabelIds.value = ids;
  }

  function onUsersUpdate(users: typeof selectedUsers.value) {
    selectedUsers.value = users;
  }

  watch(showAddDialog, v => {
    if (!v) editTransaction.value = null;
  });
</script>

<template>
  <AddEditTransactionDialog
    v-model:visible="showAddDialog"
    :edit-transaction="editTransaction"
    @saved="onDialogSaved"
  />

  <Popover ref="monthPickerRef" class="border border-surface-200 dark:border-surface-700">
    <div class="flex flex-col gap-3 p-2">
      <DatePicker v-model="monthPickerDate" view="month" date-format="mm/yy" :pt="ptDatePickerField" />
      <Button label="Zastosuj" size="small" @click="applyMonthPicker" />
    </div>
  </Popover>

  <MainPageShell :scroll-default-slot="false">
    <template #top>
      <TheMenuFinance />
    </template>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <TransactionMonthToolbar
        :month-label="monthLabel"
        :loading="loadingTransactions"
        @prev-month="prevMonth"
        @next-month="nextMonth"
        @add-click="openAddDialog"
        @calendar-click="onCalendarClick"
        @transactions-saved="onDialogSaved"
      />

      <TransactionFiltersPanel
        :categories="categories"
        :selected-category-ids="selectedCategoryIds"
        :labels="labels"
        :selected-label-ids="selectedLabelIds"
        :people-options="peopleOptions"
        :selected-users="selectedUsers"
        :is-admin="isAdmin"
        :note-filter="noteFilter"
        :amount-range="amountRange"
        :amount-min="amountBounds.min"
        :amount-max="amountBounds.max"
        :loading-categories="loadingCategories"
        :loading-labels="loadingLabels"
        :loading-users="usersStore.loadingUsers"
        @update:selected-category-ids="onCategoryIdsUpdate"
        @update:selected-label-ids="onLabelIdsUpdate"
        @update:selected-users="onUsersUpdate"
        @update:note-filter="noteFilter = $event"
        @update:amount-range="amountRange = $event"
        @reset="onResetFilters"
      />

      <TransactionSummaryCards
        :net-change="summaryNetChange"
        :expenses="summaryExpenses"
        :income="summaryIncome"
        :purchases-sum="purchasesCardSum"
        :loading-purchases="loadingPurchasesSum"
      />

      <div class="mx-6 min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden py-2">
        <div v-if="loadingTransactions" class="flex justify-center py-10">
          <ProgressSpinner />
        </div>
        <template v-else>
          <div v-for="group in filteredByDate" :key="group.date">
            <TransactionItemGroup :transaction-date="group.date" :transactions="group.items" @edit="openEditDialog" />
          </div>
          <h2
            v-if="filteredByDate.length === 0"
            class="mt-8 flex justify-center text-surface-600 dark:text-surface-400"
          >
            Brak transakcji w wybranym okresie
          </h2>
        </template>
      </div>
    </div>
  </MainPageShell>
</template>
