<script setup lang="ts">
  import { UtilsService } from '@/service/UtilsService';
  import { computed } from 'vue';

  const props = defineProps<{
    currentBalance: number | null;
    netChange: number;
    expenses: number;
    income: number;
    loadingBalance?: boolean;
  }>();

  const netClass = computed(() =>
    props.netChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
  );

  const balanceClass = computed(() => {
    if (props.currentBalance === null) return 'text-surface-400';
    return props.currentBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  });

  const expensesClass = 'text-red-600 dark:text-red-400';
  const incomeClass = 'text-emerald-600 dark:text-emerald-400';
</script>

<template>
  <div
    class="grid shrink-0 grid-cols-1 gap-3 border-b border-surface-200 bg-surface-0 px-6 py-4 sm:grid-cols-2 xl:grid-cols-4 dark:border-surface-700 dark:bg-surface-950"
  >
    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-950">
      <p class="mb-1 text-xs text-surface-600 dark:text-surface-400">Aktualne saldo konta</p>
      <p v-if="loadingBalance" class="text-2xl font-bold text-surface-400">
        <i class="pi pi-spin pi-spinner" aria-hidden="true" />
      </p>
      <p v-else-if="currentBalance === null" class="text-2xl font-bold text-surface-400">—</p>
      <p v-else class="text-2xl font-bold tabular-nums" :class="balanceClass">
        {{ currentBalance >= 0 ? '+' : '' }}{{ UtilsService.formatCurrency(currentBalance) }}
      </p>
    </div>

    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-950">
      <p class="mb-1 text-xs text-surface-600 dark:text-surface-400">Zmiana okresu</p>
      <p class="text-2xl font-bold tabular-nums" :class="netClass">
        {{ netChange >= 0 ? '+' : '' }}{{ UtilsService.formatCurrency(netChange) }}
      </p>
    </div>

    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-950">
      <p class="mb-1 text-xs text-surface-600 dark:text-surface-400">Wydatki okresu</p>
      <p class="text-2xl font-bold tabular-nums" :class="expensesClass">−{{ UtilsService.formatCurrency(expenses) }}</p>
    </div>

    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-950">
      <p class="mb-1 text-xs text-surface-600 dark:text-surface-400">Przychody okresu</p>
      <p class="text-2xl font-bold tabular-nums" :class="incomeClass">+{{ UtilsService.formatCurrency(income) }}</p>
    </div>
  </div>
</template>
