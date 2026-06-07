<script setup lang="ts">
  import { UtilsService } from '@/service/UtilsService';
  import { computed } from 'vue';

  const props = defineProps<{
    netChange: number;
    expenses: number;
    income: number;
    purchasesSum: number;
    loadingPurchases?: boolean;
  }>();

  const netClass = computed(() =>
    props.netChange >= 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'
  );

  const expensesClass = 'text-red-600 dark:text-red-400';
  const incomeClass = 'text-emerald-600 dark:text-emerald-400';
</script>

<template>
  <div
    class="grid shrink-0 grid-cols-1 gap-3 border-b border-surface-200 bg-surface-0 px-6 py-4 sm:grid-cols-2 xl:grid-cols-4 dark:border-surface-700 dark:bg-surface-950"
  >
    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-950">
      <p class="mb-1 text-xs text-surface-600 dark:text-surface-400">Zmiana okresu</p>
      <p class="text-2xl font-bold tabular-nums" :class="netClass">
        {{ netChange >= 0 ? '+' : '' }}{{ UtilsService.formatCurrency(netChange) }}
      </p>
    </div>

    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-950">
      <p class="mb-1 text-xs text-surface-600 dark:text-surface-400">Wydatki okresu</p>
      <p class="text-2xl font-bold tabular-nums" :class="expensesClass">
        {{ UtilsService.formatCurrency(expenses) }}
      </p>
    </div>

    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-950">
      <p class="mb-1 text-xs text-surface-600 dark:text-surface-400">Przychody okresu</p>
      <p class="text-2xl font-bold tabular-nums" :class="incomeClass">+{{ UtilsService.formatCurrency(income) }}</p>
    </div>

    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-950">
      <p class="mb-1 text-xs text-surface-600 dark:text-surface-400">Zakupy kartą kredytową</p>
      <p v-if="loadingPurchases" class="text-2xl font-bold text-surface-400">
        <i class="pi pi-spin pi-spinner" aria-hidden="true" />
      </p>
      <p v-else class="text-2xl font-bold tabular-nums text-surface-900 dark:text-surface-0">
        {{ UtilsService.formatCurrency(purchasesSum) }}
      </p>
    </div>
  </div>
</template>
