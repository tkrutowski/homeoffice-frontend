<script setup lang="ts">
  import { UtilsService } from '@/service/UtilsService';
  import type { CategoryAggregate } from '@/types/DeviceDashboard';

  defineProps<{
    totalValue: number;
    valueByCategory: CategoryAggregate[];
    loading?: boolean;
  }>();
</script>

<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <!-- Łączna wartość -->
    <article
      class="flex flex-col justify-between rounded-2xl border border-surface-200 bg-surface-0 p-5 shadow-sm dark:border-surface-700 dark:bg-surface-950 md:p-6"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20"
        >
          <i class="pi pi-wallet text-xl" aria-hidden="true" />
        </div>
        <div>
          <p class="text-sm font-medium text-surface-600 dark:text-surface-400">Łączna wartość sprzętu</p>
          <p v-if="loading" class="mt-2">
            <Skeleton width="8rem" height="2.5rem" />
          </p>
          <p v-else class="mt-1 text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
            {{ UtilsService.formatCurrency(totalValue) }}
          </p>
        </div>
      </div>
      <p class="mt-4 text-xs text-surface-500 dark:text-surface-400">Suma cen zakupu wszystkich urządzeń w katalogu</p>
    </article>

    <!-- Wartość wg kategorii -->
    <article
      class="flex flex-col rounded-2xl border border-surface-200 bg-surface-0 p-5 shadow-sm dark:border-surface-700 dark:bg-surface-950 md:p-6"
    >
      <div class="mb-4 flex items-center gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
        >
          <i class="pi pi-chart-pie text-xl" aria-hidden="true" />
        </div>
        <p class="text-sm font-medium text-surface-600 dark:text-surface-400">Wartość wg kategorii</p>
      </div>

      <div v-if="loading" class="flex flex-col gap-2">
        <Skeleton v-for="n in 5" :key="n" height="1.75rem" border-radius="0.375rem" />
      </div>
      <ul v-else-if="valueByCategory.length" class="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
        <li v-for="cat in valueByCategory" :key="cat.name" class="flex items-center justify-between gap-3 text-sm">
          <span class="min-w-0 truncate font-medium text-surface-800 dark:text-surface-200">
            {{ cat.name }}
          </span>
          <span class="shrink-0 font-semibold tabular-nums pr-3" :class="cat.colorClass">
            {{ UtilsService.formatCurrency(cat.totalValue) }}
          </span>
        </li>
      </ul>
      <p v-else class="text-sm text-surface-500 dark:text-surface-400">Brak urządzeń w katalogu.</p>
    </article>
  </div>
</template>
