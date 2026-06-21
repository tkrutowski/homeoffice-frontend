<script setup lang="ts">
  import { UtilsService } from '@/service/UtilsService';
  import { computed } from 'vue';
  import type { ChangesBucketData, ChartGranularity } from '@/types/BankTransactionDashboard';

  const props = defineProps<{
    data: ChangesBucketData;
    periodLabel: string;
    loading?: boolean;
    granularity: ChartGranularity;
  }>();

  const granularityModel = defineModel<ChartGranularity>('granularity', { required: true });

  const granularityOptions = [
    { label: 'Dni', value: 'day' as const },
    { label: 'Tygodnie', value: 'week' as const },
    { label: 'Miesiące', value: 'month' as const },
  ];

  const hasData = computed(() => props.data.income.some(v => v > 0) || props.data.expenses.some(v => v > 0));

  const chartData = computed(() => ({
    labels: props.data.labels,
    datasets: [
      {
        label: 'Przychody',
        data: props.data.income,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Wydatki',
        data: props.data.expenses,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  }));

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${ctx.dataset.label}: ${UtilsService.formatCurrency(ctx.parsed.y)}`,
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

  const cardPt = {
    root: {
      class:
        'flex min-h-[280px] h-full min-w-0 flex-col border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-700 dark:bg-surface-950',
    },
    body: { class: 'flex min-h-0 flex-1 flex-col gap-2 p-4 sm:p-5' },
    title: { class: 'text-lg font-semibold text-surface-900 dark:text-surface-0' },
    subtitle: { class: 'text-sm text-surface-600 dark:text-surface-400' },
    content: { class: 'flex min-h-0 min-w-0 flex-1 flex-col' },
  };
</script>

<template>
  <Card :pt="cardPt">
    <template #title>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>Zmiany</span>
        <SelectButton
          v-model="granularityModel"
          :options="granularityOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          class="shrink-0"
        />
      </div>
    </template>
    <template #subtitle>{{ periodLabel }}</template>
    <template #content>
      <div v-if="loading" class="flex flex-1 items-center justify-center py-8">
        <ProgressSpinner />
      </div>
      <div
        v-else-if="!hasData"
        class="flex flex-1 items-center justify-center py-8 text-sm text-surface-600 dark:text-surface-400"
      >
        Brak transakcji w wybranym okresie
      </div>
      <div v-else class="relative min-h-[200px] flex-1">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-full min-h-[200px] w-full" />
      </div>
    </template>
  </Card>
</template>
