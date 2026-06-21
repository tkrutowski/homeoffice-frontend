<script setup lang="ts">
  import TransactionItemGroup from '@/components/finance/TransactionItemGroup.vue';
  import { UtilsService } from '@/service/UtilsService';
  import { getCategoryDisplay } from '@/config/transactionCategoryIcons';
  import { parseTransactionAmount } from '@/composables/useBankTransactionFilters';
  import {
    buildAmountsByBucket,
    filterTransactionsByCategory,
    groupTransactionsByDate,
  } from '@/utils/transactionDashboardAggregation';
  import type { CategoryBreakdownItem, ChartGranularity } from '@/types/BankTransactionDashboard';
  import type { BankTransaction, TransactionCategoryType } from '@/types/BankTransaction';
  import { TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';
  import { computed, ref, watch } from 'vue';

  const visible = defineModel<boolean>('visible', { default: false });

  const props = defineProps<{
    category: CategoryBreakdownItem | null;
    type: TransactionCategoryType;
    periodLabel: string;
    dateFrom: string;
    dateTo: string;
    transactions: BankTransaction[];
  }>();

  const emit = defineEmits<{
    edit: [transaction: BankTransaction];
  }>();

  const chartGranularity = ref<ChartGranularity>('month');

  const granularityOptions = [
    { label: 'Dni', value: 'day' as const },
    { label: 'Tygodnie', value: 'week' as const },
    { label: 'Miesiące', value: 'month' as const },
  ];

  const categoryDisplay = computed(() => {
    if (!props.category) return null;
    return getCategoryDisplay({
      id: props.category.categoryId ?? 0,
      name: props.category.categoryName,
      icon: props.category.icon,
      color: props.category.color,
    });
  });

  const amountClass = computed(() =>
    props.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
  );

  const categoryTransactions = computed(() => {
    if (!props.category) return [];
    return filterTransactionsByCategory(props.transactions, props.category.categoryId);
  });

  const groupedByDate = computed(() => groupTransactionsByDate(categoryTransactions.value));

  const chartBucketData = computed(() =>
    buildAmountsByBucket(
      categoryTransactions.value,
      props.dateFrom,
      props.dateTo,
      chartGranularity.value,
      t => parseTransactionAmount(t.amount)
    )
  );

  const hasChartData = computed(() => chartBucketData.value.amounts.some(v => v > 0));

  const chartColor = computed(() =>
    props.type === 'INCOME' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
  );

  const chartBorderColor = computed(() => (props.type === 'INCOME' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'));

  const chartData = computed(() => ({
    labels: chartBucketData.value.labels,
    datasets: [
      {
        label: props.category?.categoryName ?? 'Kwota',
        data: chartBucketData.value.amounts,
        backgroundColor: chartColor.value,
        borderColor: chartBorderColor.value,
        borderWidth: 1,
      },
    ],
  }));

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => UtilsService.formatCurrency(ctx.parsed.y),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => {
            const n = Number(value);
            if (Number.isNaN(n)) return value;
            return UtilsService.formatCurrency(n);
          },
        },
      },
    },
  }));

  const dialogTitle = computed(() => props.category?.categoryName ?? 'Szczegóły kategorii');

  watch(visible, v => {
    if (!v) chartGranularity.value = 'month';
  });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="dialogTitle"
    class="w-full max-w-[min(96rem,calc(100vw-2rem))]"
    :pt="{
      root: { class: 'border border-surface-200 dark:border-surface-700' },
      header: { class: 'bg-surface-0 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-700' },
      content: { class: 'bg-surface-0 dark:bg-surface-950 pb-1' },
    }"
  >
    <div v-if="category" class="flex flex-col gap-5 pt-2">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
            :style="{
              backgroundColor: categoryDisplay?.backgroundColor ?? TRANSACTION_CATEGORY_DEFAULT_COLOR,
            }"
          >
            <i v-if="categoryDisplay?.iconClass" :class="categoryDisplay.iconClass" aria-hidden="true" />
            <span v-else class="text-base font-semibold">{{ categoryDisplay?.initial }}</span>
          </span>
          <div class="min-w-0">
            <p class="m-0 text-lg font-semibold text-surface-900 dark:text-surface-0">{{ category.categoryName }}</p>
            <p class="m-0 text-sm text-surface-600 dark:text-surface-400">{{ periodLabel }}</p>
          </div>
        </div>
        <p class="m-0 text-2xl font-bold tabular-nums" :class="amountClass">
          {{ type === 'INCOME' ? '+' : '−' }}{{ UtilsService.formatCurrency(category.total) }}
        </p>
      </div>

      <div
        class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900"
      >
        <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="m-0 text-sm font-medium text-surface-900 dark:text-surface-0">Wykres w okresie</p>
          <SelectButton
            v-model="chartGranularity"
            :options="granularityOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            class="shrink-0"
          />
        </div>
        <div v-if="hasChartData" class="relative min-h-[220px]">
          <Chart type="bar" :data="chartData" :options="chartOptions" class="h-full min-h-[220px] w-full" />
        </div>
        <p v-else class="m-0 py-8 text-center text-sm text-surface-600 dark:text-surface-400">
          Brak danych do wykresu
        </p>
      </div>

      <div class="flex min-h-0 flex-col">
        <p class="m-0 mb-3 text-sm font-medium text-surface-900 dark:text-surface-0">
          Transakcje ({{ categoryTransactions.length }})
        </p>
        <div class="max-h-[min(50vh,28rem)] overflow-y-auto overflow-x-hidden">
          <div v-if="groupedByDate.length === 0" class="py-6 text-center text-sm text-surface-600 dark:text-surface-400">
            Brak transakcji w wybranym okresie
          </div>
          <div v-else class="flex flex-col items-center gap-2 pb-2">
            <TransactionItemGroup
              v-for="group in groupedByDate"
              :key="group.date"
              :transaction-date="group.date"
              :transactions="group.items"
              @edit="emit('edit', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
  :deep(.item-group) {
    margin: 0.75rem auto;
  }
</style>
