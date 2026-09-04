<script setup lang="ts">
  import { UtilsService } from '@/service/UtilsService';

  export interface FinanceSummaryCardProps {
    icon: string;
    label: string;
    value: number;
    hint: string;
    colorClass: 'red' | 'purple' | 'amber' | 'blue';
  }

  defineProps<FinanceSummaryCardProps>();
</script>

<template>
  <article
    class="flex flex-col justify-between rounded-2xl border border-surface-200 bg-surface-0 p-5 shadow-sm dark:border-surface-700 dark:bg-surface-950 md:p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
  >
    <div>
      <div class="flex items-start gap-3 mb-4">
        <div
          :class="[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl',
            {
              'bg-red-500/10 text-red-600 dark:bg-red-500/20': colorClass === 'red',
              'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20': colorClass === 'purple',
              'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20': colorClass === 'amber',
              'bg-primary/10 text-primary dark:bg-primary/20': colorClass === 'blue',
            },
          ]"
          aria-hidden="true"
        >
          {{ icon }}
        </div>
        <div>
          <p class="text-sm font-medium text-surface-600 dark:text-surface-400">
            {{ label }}
          </p>
        </div>
      </div>
      <p class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0 tabular-nums">
        {{ UtilsService.formatCurrency(value) }}
      </p>
    </div>
    <p class="mt-4 text-xs text-surface-500 dark:text-surface-400">
      {{ hint }}
    </p>
  </article>
</template>
