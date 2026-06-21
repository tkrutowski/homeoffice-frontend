<script setup lang="ts">
  import { UtilsService } from '@/service/UtilsService';
  import { computed } from 'vue';
  import type { ChartGranularity } from '@/types/BankTransactionDashboard';

  const props = defineProps<{
    series: { date: string; balance: number }[];
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

  const hasData = computed(() => props.series.length > 0);

  const chartData = computed(() => ({
    labels: props.series.map(p => p.date),
    datasets: [
      {
        label: 'Saldo',
        data: props.series.map(p => p.balance),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        <span>Saldo konta</span>
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
        Brak danych salda — oczekiwanie na endpoint backendu
      </div>
      <div v-else class="relative min-h-[200px] flex-1">
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-full min-h-[200px] w-full" />
      </div>
    </template>
  </Card>
</template>
