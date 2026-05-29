<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import DeviceDashboardPanel from '@/components/device/dashboard/DeviceDashboardPanel.vue';
  import { UtilsService } from '@/service/UtilsService';
  import type { DeviceChartData } from '@/types/DeviceDashboard';

  const props = defineProps<{
    chartData: DeviceChartData;
    loading?: boolean;
  }>();

  const visibleLabels = ref<Set<string>>(new Set());

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

  const displayedChartData = computed(() => ({
    labels: props.chartData.labels,
    datasets: props.chartData.datasets.map(ds => ({
      ...ds,
      hidden: !visibleLabels.value.has(ds.label),
    })),
  }));

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        filter: (item: { dataset: { hidden?: boolean } }) => !item.dataset.hidden,
        callbacks: {
          title: (items: { label?: string }[]) => {
            const year = items[0]?.label;
            return year ? `Rok ${year}` : '';
          },
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
            const label = context.dataset.label ?? '';
            return `${label}: ${UtilsService.formatCurrency(context.parsed.y)}`;
          },
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
            if (n >= 1000) return `${(n / 1000).toFixed(0)}k zł`;
            return `${n} zł`;
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Rok zakupu',
          font: { size: 12 },
        },
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 12 },
        },
      },
    },
  }));

  const chartType = 'line' as const;
</script>

<template>
  <DeviceDashboardPanel
    title="Koszty zakupów wg kategorii"
    icon="pi pi-chart-line"
    :loading="loading"
    panel-class="h-full min-h-[22rem]"
  >
    <div v-if="!loading && chartData.datasets.length" class="flex min-h-[18rem] flex-col gap-4">
      <p class="text-center text-xs text-surface-500 dark:text-surface-400">
        Kliknij kategorię, aby włączyć lub wyłączyć linię na wykresie. Konsola, Kamery i RTV są w „Inne”.
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        <button
          v-for="pill in chartData.categoryTotals"
          :key="pill.label"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="
            isLineVisible(pill.label)
              ? 'border-surface-300 bg-surface-50 dark:border-surface-600 dark:bg-surface-900'
              : 'border-surface-200 bg-surface-100/80 opacity-50 dark:border-surface-700 dark:bg-surface-800/50'
          "
          :aria-pressed="isLineVisible(pill.label)"
          :title="isLineVisible(pill.label) ? 'Wyłącz linię' : 'Włącz linię'"
          @click="toggleLine(pill.label)"
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
          <span class="tabular-nums text-surface-500 dark:text-surface-400">
            {{ UtilsService.formatCurrency(pill.total) }}
          </span>
        </button>
      </div>

      <Chart
        :key="[...visibleLabels].sort().join(',')"
        :type="chartType"
        :data="displayedChartData"
        :options="chartOptions"
        class="h-64 w-full md:h-72"
      />
    </div>
    <p v-else-if="!loading" class="text-sm text-surface-500 dark:text-surface-400">
      Brak urządzeń z datą zakupu — uzupełnij pole „Data zakupu” w formularzu urządzenia, aby zobaczyć wykres.
    </p>
  </DeviceDashboardPanel>
</template>
