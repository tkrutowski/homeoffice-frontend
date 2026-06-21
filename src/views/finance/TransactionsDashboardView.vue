<script setup lang="ts">
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import TransactionDashboardToolbar from '@/components/finance/TransactionDashboardToolbar.vue';
  import TransactionFiltersPanel from '@/components/finance/TransactionFiltersPanel.vue';
  import TransactionDashboardSummaryCards from '@/components/finance/TransactionDashboardSummaryCards.vue';
  import TransactionBalanceChart from '@/components/finance/dashboard/TransactionBalanceChart.vue';
  import TransactionChangesChart from '@/components/finance/dashboard/TransactionChangesChart.vue';
  import TransactionCategoryBreakdownPanel from '@/components/finance/dashboard/TransactionCategoryBreakdownPanel.vue';
  import TransactionCategoryDetailDialog from '@/components/finance/dashboard/TransactionCategoryDetailDialog.vue';
  import AddEditTransactionDialog from '@/components/finance/AddEditTransactionDialog.vue';
  import { UtilsService } from '@/service/UtilsService';
  import { useBankTransactionsDashboard } from '@/composables/useBankTransactionsDashboard';
  import { useUsersStore } from '@/stores/users';
  import type { BankTransaction, TransactionCategoryType } from '@/types/BankTransaction';
  import type { CategoryBreakdownItem } from '@/types/BankTransactionDashboard';
  import { onMounted, ref, watch } from 'vue';
  import Popover from 'primevue/popover';
  import { ptDatePickerField } from '@/config/formFieldPt';

  const usersStore = useUsersStore();

  const {
    bankStore,
    periodMode,
    periodLabel,
    chartGranularity,
    noteFilter,
    selectedCategoryIds,
    selectedLabelIds,
    selectedUsers,
    amountRange,
    amountBounds,
    isAdmin,
    peopleOptions,
    summaryIncome,
    summaryExpenses,
    summaryNetChange,
    currentBalance,
    balanceSeries,
    loadingBalance,
    incomeBreakdown,
    expenseBreakdown,
    changesChartData,
    filteredTransactions,
    dateFrom,
    dateTo,
    loadPeriod,
    resetFilters,
    initCategoryFilter,
    initLabelFilter,
    initPeopleFilter,
    prevPeriod,
    nextPeriod,
    setMonthFromDate,
    setYearFromDate,
    setCustomRangeFromDates,
    customRange,
    anchorDate,
  } = useBankTransactionsDashboard();

  const showAddDialog = ref(false);
  const editTransaction = ref<BankTransaction | null>(null);
  const showCategoryDetailDialog = ref(false);
  const selectedCategoryDetail = ref<CategoryBreakdownItem | null>(null);
  const selectedCategoryType = ref<TransactionCategoryType>('EXPENSE');
  const periodPickerRef = ref<InstanceType<typeof Popover> | null>(null);
  const monthPickerDate = ref<Date>(new Date());
  const yearPickerDate = ref<Date>(new Date());
  const rangePickerDates = ref<Date[]>([]);

  UtilsService.getTypesForFinance();

  onMounted(async () => {
    if (usersStore.users.length === 0) await usersStore.getUsersFromDb();
    await bankStore.getCategoriesFromDb();
    await bankStore.getLabelsFromDb();
    initCategoryFilter(bankStore.categories);
    initLabelFilter(bankStore.labels);
    initPeopleFilter();
    monthPickerDate.value = anchorDate.value;
    yearPickerDate.value = anchorDate.value;
    if (customRange.value) {
      rangePickerDates.value = [...customRange.value];
    }
    await loadPeriod();
  });

  function openAddDialog() {
    editTransaction.value = null;
    showAddDialog.value = true;
  }

  function onDialogSaved() {
    void loadPeriod();
  }

  function onCategoryClick(item: CategoryBreakdownItem, type: TransactionCategoryType) {
    selectedCategoryDetail.value = item;
    selectedCategoryType.value = type;
    showCategoryDetailDialog.value = true;
  }

  function onCategoryDetailEdit(tx: BankTransaction) {
    editTransaction.value = tx;
    showAddDialog.value = true;
  }

  function onResetFilters() {
    resetFilters();
  }

  function onCalendarClick(event: Event) {
    monthPickerDate.value = anchorDate.value;
    yearPickerDate.value = anchorDate.value;
    if (customRange.value) {
      rangePickerDates.value = [...customRange.value];
    }
    periodPickerRef.value?.toggle(event);
  }

  function applyPeriodPicker() {
    if (periodMode.value === 'month') {
      setMonthFromDate(monthPickerDate.value);
    } else if (periodMode.value === 'year') {
      setYearFromDate(yearPickerDate.value);
    } else {
      setCustomRangeFromDates(rangePickerDates.value);
    }
    periodPickerRef.value?.hide();
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

  <TransactionCategoryDetailDialog
    v-model:visible="showCategoryDetailDialog"
    :category="selectedCategoryDetail"
    :type="selectedCategoryType"
    :period-label="periodLabel"
    :date-from="dateFrom"
    :date-to="dateTo"
    :transactions="filteredTransactions"
    @edit="onCategoryDetailEdit"
  />

  <Popover ref="periodPickerRef" class="border border-surface-200 dark:border-surface-700">
    <div class="flex flex-col gap-3 p-2">
      <DatePicker
        v-if="periodMode === 'month'"
        v-model="monthPickerDate"
        view="month"
        date-format="mm/yy"
        :pt="ptDatePickerField"
      />
      <DatePicker
        v-else-if="periodMode === 'year'"
        v-model="yearPickerDate"
        view="year"
        date-format="yy"
        :pt="ptDatePickerField"
      />
      <DatePicker
        v-else
        v-model="rangePickerDates"
        selection-mode="range"
        date-format="dd/mm/yy"
        :pt="ptDatePickerField"
      />
      <Button label="Zastosuj" size="small" @click="applyPeriodPicker" />
    </div>
  </Popover>

  <MainPageShell :scroll-default-slot="false">
    <template #top>
      <TheMenuFinance />
    </template>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <TransactionDashboardToolbar
        v-model:period-mode="periodMode"
        :period-label="periodLabel"
        :loading="bankStore.loadingTransactions"
        @prev-period="prevPeriod"
        @next-period="nextPeriod"
        @add-click="openAddDialog"
        @calendar-click="onCalendarClick"
        @transactions-saved="onDialogSaved"
      />

      <TransactionFiltersPanel
        :categories="bankStore.categories"
        :selected-category-ids="selectedCategoryIds"
        :labels="bankStore.labels"
        :selected-label-ids="selectedLabelIds"
        :people-options="peopleOptions"
        :selected-users="selectedUsers"
        :is-admin="isAdmin"
        :note-filter="noteFilter"
        :amount-range="amountRange"
        :amount-min="amountBounds.min"
        :amount-max="amountBounds.max"
        :loading-categories="bankStore.loadingCategories"
        :loading-labels="bankStore.loadingLabels"
        :loading-users="usersStore.loadingUsers"
        @update:selected-category-ids="onCategoryIdsUpdate"
        @update:selected-label-ids="onLabelIdsUpdate"
        @update:selected-users="onUsersUpdate"
        @update:note-filter="noteFilter = $event"
        @update:amount-range="amountRange = $event"
        @reset="onResetFilters"
      />

      <TransactionDashboardSummaryCards
        :current-balance="currentBalance"
        :net-change="summaryNetChange"
        :expenses="summaryExpenses"
        :income="summaryIncome"
        :loading-balance="loadingBalance"
      />

      <div class="mx-6 min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden py-4">
        <div v-if="bankStore.loadingTransactions" class="flex justify-center py-10">
          <ProgressSpinner />
        </div>
        <div v-else class="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
          <TransactionBalanceChart
            v-model:granularity="chartGranularity"
            :series="balanceSeries"
            :period-label="periodLabel"
            :loading="loadingBalance"
          />
          <TransactionChangesChart
            v-model:granularity="chartGranularity"
            :data="changesChartData"
            :period-label="periodLabel"
          />
          <TransactionCategoryBreakdownPanel
            type="INCOME"
            :breakdown="incomeBreakdown"
            :period-label="periodLabel"
            @category-click="onCategoryClick($event, 'INCOME')"
          />
          <TransactionCategoryBreakdownPanel
            type="EXPENSE"
            :breakdown="expenseBreakdown"
            :period-label="periodLabel"
            @category-click="onCategoryClick($event, 'EXPENSE')"
          />
        </div>
      </div>
    </div>
  </MainPageShell>
</template>
