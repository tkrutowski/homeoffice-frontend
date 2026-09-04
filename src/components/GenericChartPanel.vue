<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import DeviceDashboardPanel from '@/features/device/home/dashboard/DeviceDashboardPanel.vue';
  import { UtilsService } from '@/service/UtilsService';
  import type { ChartOptions } from 'chart.js';

  export interface ChartDatasetConfig {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
    borderWidth?: number;
  }

  export interface GenericChartData {
    labels: string[];
    datasets: ChartDatasetConfig[];
    categoryTotals: { label: string; total: number; color: string }[];
  }

  const props = defineProps<{
    chartData: GenericChartData;
    title: string;
    icon?: string;
    chartType?: 'line' | 'bar' | 'doughnut' | 'pie';
    loading?: boolean;
    panelClass?: string;
    helpText?: string;
    emptyMessage?: string;
    showTotals?: boolean;
  }>();

  const visibleLabels = ref<Set<string>>(new Set());
  const isDark = ref(false);

  // Detekcja ciemnego trybu
  watch(
    () => {
      if (typeof window === 'undefined') return false;
      return (
        window.matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.classList.contains('dark')
      );
    },
    value => {
      isDark.value = value;
    },
    { immediate: true }
  );

  // Nasłuch zmian klasy .dark na html
  if (typeof window !== 'undefined') {
    const observer = new MutationObserver(() => {
      isDark.value = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  watch(
    () => props.chartData.categoryTotals.map(p => p.label).join('\0'),
    () => {
      visibleLabels.value = new Set(props.chartData.categoryTotals.map(p => p.label));
    },
    { immediate: true }
  );

  function toggleLine(label: string) {
    const next = new Set(visibleLabels.value);
    if (next.has(label)) {
      if (next.size <= 1) return;
      next.delete(label);
    } else {
      next.add(label);
    }
    visibleLabels.value = next;
  }

  function isLineVisible(label: string): boolean {
    return visibleLabels.value.has(label);
  }

  const displayedChartData = computed(() => {
    // Dla pie/doughnut, nie ukrywamy dataset, bo struktura jest inna
    const isPieChart = props.chartType === 'pie' || props.chartType === 'doughnut';

    return {
      labels: props.chartData.labels,
      datasets: props.chartData.datasets.map(ds => ({
        ...ds,
        hidden: isPieChart ? false : !visibleLabels.value.has(ds.label),
      })),
    };
  });

  const chartOptions = computed<ChartOptions>(() => {
    // Kolory dla jasnego i ciemnego trybu
    const gridColor = isDark.value ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.2)';
    const textColor = isDark.value ? 'rgb(203, 213, 225)' : 'rgb(15, 23, 42)';

    const baseOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          filter: (item: { dataset: { hidden?: boolean } }) => !item.dataset.hidden,
          callbacks: {
            title: (items: { label?: string }[]) => {
              return items[0]?.label ?? '';
            },
            label: (context: any) => {
              // Dla pie/doughnut: context.label to nazwa segmentu, context.parsed to wartość
              if (props.chartType === 'pie' || props.chartType === 'doughnut') {
                const value = context.parsed ?? context.value ?? 0;
                return `${context.label}: ${UtilsService.formatCurrency(value)}`;
              }

              // Dla line/bar: context.dataset.label i context.parsed.y
              const label = context.dataset.label ?? '';
              const value = typeof context.parsed?.y === 'number' ? context.parsed.y : 0;
              return `${label}: ${UtilsService.formatCurrency(value)}`;
            },
          },
        },
      },
    };

    // Ustawienia specyficzne dla wykresu liniowego
    if (props.chartType === 'line') {
      return {
        ...baseOptions,
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              callback: (value: number | string) => {
                const n = Number(value);
                if (Number.isNaN(n)) return value;
                if (n >= 1000) return `${(n / 1000).toFixed(0)}k zł`;
                return `${n} zł`;
              },
            },
            grid: {
              color: gridColor,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 12 },
              color: textColor,
            },
          },
        },
      };
    }

    // Ustawienia dla wykresów słupkowych
    if (props.chartType === 'bar') {
      return {
        ...baseOptions,
        indexAxis: 'x' as const,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              callback: (value: number | string) => {
                const n = Number(value);
                if (Number.isNaN(n)) return value;
                if (n >= 1000) return `${(n / 1000).toFixed(0)}k zł`;
                return `${n} zł`;
              },
            },
            grid: {
              color: gridColor,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: textColor,
            },
          },
        },
      };
    }

    // Ustawienia dla wykresów kołowych/pierścieniowych
    return baseOptions;
  });

  const chartTypeValue = computed(() => props.chartType ?? 'line');
</script>

<template>
  <DeviceDashboardPanel
    :title="title"
    :icon="icon"
    :loading="loading"
    :panel-class="panelClass || 'h-full min-h-[22rem]'"
  >
    <div v-if="!loading && chartData.datasets.length" class="flex min-h-[18rem] flex-col gap-4">
      <!-- Help text -->
      <p v-if="helpText" class="text-center text-xs text-surface-500 dark:text-surface-400">
        {{ helpText }}
      </p>

      <!-- Legend pills -->
      <div class="flex flex-wrap justify-center gap-2">
        <button
          v-for="pill in chartData.categoryTotals"
          :key="pill.label"
          type="button"
          :disabled="chartType === 'pie' || chartType === 'doughnut'"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default"
          :class="
            isLineVisible(pill.label)
              ? 'border-surface-300 bg-surface-50 dark:border-surface-600 dark:bg-surface-900'
              : 'border-surface-200 bg-surface-100/80 opacity-50 dark:border-surface-700 dark:bg-surface-800/50'
          "
          :aria-pressed="isLineVisible(pill.label)"
          :title="isLineVisible(pill.label) ? 'Wyłącz' : 'Włącz'"
          @click="chartType !== 'pie' && chartType !== 'doughnut' && toggleLine(pill.label)"
        >
          <span
            class="h-2 w-2 shrink-0 rounded-full"
            :style="{ backgroundColor: isLineVisible(pill.label) ? pill.color : 'var(--p-surface-400)' }"
          />
          <span
            class="font-medium"
            :class="
              isLineVisible(pill.label)
                ? 'text-surface-700 dark:text-surface-300'
                : 'text-surface-500 line-through dark:text-surface-500'
            "
          >
            {{ pill.label }}
          </span>
          <span v-if="showTotals" class="tabular-nums text-surface-500 dark:text-surface-400">
            {{ UtilsService.formatCurrency(pill.total) }}
          </span>
        </button>
      </div>

      <!-- Chart -->
      <Chart
        :key="[...visibleLabels].sort().join(',')"
        :type="chartTypeValue"
        :data="displayedChartData"
        :options="chartOptions"
        class="h-64 w-full md:h-72"
      />
    </div>
    <p v-else-if="!loading" class="text-sm text-surface-500 dark:text-surface-400">
      {{ emptyMessage || 'Brak danych do wyświetlenia na wykresie.' }}
    </p>
  </DeviceDashboardPanel>
</template>
