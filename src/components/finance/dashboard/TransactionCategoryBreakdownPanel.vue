<script setup lang="ts">
  import { UtilsService } from '@/service/UtilsService';
  import { getCategoryDisplay } from '@/config/transactionCategoryIcons';
  import { computed } from 'vue';
  import type { CategoryBreakdownItem } from '@/types/BankTransactionDashboard';
  import type { TransactionCategoryType } from '@/types/BankTransaction';
  import { TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';

  const props = defineProps<{
    type: TransactionCategoryType;
    breakdown: CategoryBreakdownItem[];
    periodLabel: string;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    categoryClick: [item: CategoryBreakdownItem];
  }>();

  const title = computed(() => (props.type === 'INCOME' ? 'Przychody okresu' : 'Wydatki okresu'));

  const total = computed(() => props.breakdown.reduce((s, item) => s + item.total, 0));

  const amountClass = computed(() =>
    props.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
  );

  const chartData = computed(() => {
    if (props.breakdown.length === 0) {
      return {
        labels: ['Brak danych'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#78909C'],
            borderWidth: 0,
          },
        ],
      };
    }
    return {
      labels: props.breakdown.map(b => b.categoryName),
      datasets: [
        {
          data: props.breakdown.map(b => b.total),
          backgroundColor: props.breakdown.map(b => b.color),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx: { raw: number; dataset: { data?: number[] } }) {
            const raw = ctx.raw;
            if (ctx.dataset.data?.length === 1) return '';
            const pct = total.value > 0 ? ((raw / total.value) * 100).toFixed(1) : '0';
            return `${UtilsService.formatCurrency(raw)} (${pct}%)`;
          },
        },
      },
    },
  };

  function categoryDisplay(item: CategoryBreakdownItem) {
    return getCategoryDisplay({
      id: item.categoryId ?? 0,
      name: item.categoryName,
      icon: item.icon,
      color: item.color,
    });
  }

  const cardPt = {
    root: {
      class:
        'flex min-h-[360px] h-full min-w-0 flex-col border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-700 dark:bg-surface-950',
    },
    body: { class: 'flex min-h-0 flex-1 flex-col gap-2 p-4 sm:p-5' },
    title: { class: 'text-lg font-semibold text-surface-900 dark:text-surface-0' },
    subtitle: { class: 'text-sm text-surface-600 dark:text-surface-400' },
    content: { class: 'flex min-h-0 min-w-0 flex-1 flex-col gap-4' },
  };
</script>

<template>
  <Card :pt="cardPt">
    <template #title>{{ title }}</template>
    <template #subtitle>{{ periodLabel }}</template>
    <template #content>
      <div v-if="loading" class="flex flex-1 items-center justify-center py-8">
        <ProgressSpinner />
      </div>
      <template v-else>
        <div class="flex shrink-0 flex-col items-center justify-center py-2">
          <div class="relative mx-auto aspect-square w-full max-w-[220px]">
            <Chart type="doughnut" :data="chartData" :options="chartOptions" class="h-full w-full" />
            <div
              v-if="breakdown.length > 0"
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
              aria-hidden="true"
            >
              <p class="m-0 text-lg font-bold tabular-nums text-surface-900 dark:text-surface-0">
                {{ UtilsService.formatCurrency(total) }}
              </p>
              <p class="m-0 mt-1 text-xs font-medium uppercase tracking-wide text-surface-600 dark:text-surface-400">
                Łącznie
              </p>
            </div>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <ul v-if="breakdown.length > 0" class="m-0 flex list-none flex-col gap-2 p-0">
            <li v-for="item in breakdown" :key="`${item.categoryId ?? 'none'}-${item.categoryName}`">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-900 dark:hover:border-primary/40 dark:hover:bg-surface-800"
                @click="emit('categoryClick', item)"
              >
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm text-white"
                  :style="{
                    backgroundColor: categoryDisplay(item)?.backgroundColor ?? TRANSACTION_CATEGORY_DEFAULT_COLOR,
                  }"
                >
                  <i
                    v-if="categoryDisplay(item)?.iconClass"
                    :class="categoryDisplay(item)?.iconClass"
                    aria-hidden="true"
                  />
                  <span v-else class="font-semibold">{{ categoryDisplay(item)?.initial }}</span>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="m-0 truncate text-sm font-medium text-surface-900 dark:text-surface-0">
                    {{ item.categoryName }}
                  </p>
                  <p class="m-0 text-xs text-surface-600 dark:text-surface-400">
                    {{ item.count }}
                    {{ item.count === 1 ? 'transakcja' : item.count < 5 ? 'transakcje' : 'transakcji' }}
                  </p>
                </div>
                <p class="m-0 shrink-0 text-sm font-semibold tabular-nums" :class="amountClass">
                  {{ type === 'INCOME' ? '+' : '−' }}{{ UtilsService.formatCurrency(item.total) }}
                </p>
              </button>
            </li>
          </ul>
          <p v-else class="py-4 text-center text-sm text-surface-600 dark:text-surface-400">
            Brak transakcji w wybranym okresie
          </p>
        </div>
      </template>
    </template>
  </Card>
</template>
