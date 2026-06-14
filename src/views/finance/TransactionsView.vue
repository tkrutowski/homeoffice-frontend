<script setup lang="ts">
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import TransactionMonthToolbar from '@/components/finance/TransactionMonthToolbar.vue';
  import TransactionFiltersPanel from '@/components/finance/TransactionFiltersPanel.vue';
  import TransactionSummaryCards from '@/components/finance/TransactionSummaryCards.vue';
  import TransactionItemGroup from '@/components/finance/TransactionItemGroup.vue';
  import AddEditTransactionDialog from '@/components/finance/AddEditTransactionDialog.vue';
  import { UtilsService } from '@/service/UtilsService';
  import { useBankTransactionsView } from '@/composables/useBankTransactionsView';
  import { useUsersStore } from '@/stores/users';
  import type { BankTransaction } from '@/types/BankTransaction';
  import { onMounted, ref, watch } from 'vue';
  import Popover from 'primevue/popover';
  import { ptDatePickerField } from '@/config/formFieldPt';

  const usersStore = useUsersStore();

  const {
    bankStore,
    selectedMonth,
    monthLabel,
    noteFilter,
    selectedCategoryIds,
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
    loadMonth,
    resetFilters,
    initCategoryFilter,
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
    await bankStore.getCategoriesFromDb();
    await bankStore.getLabelsFromDb();
    initCategoryFilter(bankStore.categories);
    initPeopleFilter();
    monthPickerDate.value = selectedMonth.value;
    await loadMonth();
  });

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
        :loading="bankStore.loadingTransactions"
        @prev-month="prevMonth"
        @next-month="nextMonth"
        @add-click="openAddDialog"
        @calendar-click="onCalendarClick"
        @transactions-saved="onDialogSaved"
      />

      <TransactionFiltersPanel
        :categories="bankStore.categories"
        :selected-category-ids="selectedCategoryIds"
        :people-options="peopleOptions"
        :selected-users="selectedUsers"
        :is-admin="isAdmin"
        :note-filter="noteFilter"
        :amount-range="amountRange"
        :amount-min="amountBounds.min"
        :amount-max="amountBounds.max"
        :loading-categories="bankStore.loadingCategories"
        :loading-users="usersStore.loadingUsers"
        @update:selected-category-ids="onCategoryIdsUpdate"
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
        <div v-if="bankStore.loadingTransactions" class="flex justify-center py-10">
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
