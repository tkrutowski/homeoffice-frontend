<script setup lang="ts">
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import BankCsvImportControl from '@/features/finance/transactions/BankCsvImportControl.vue';
  import type { PeriodMode } from '@/features/finance/transactions/dashboardTypes';

  defineProps<{
    periodLabel: string;
    periodMode: PeriodMode;
    loading?: boolean;
    filtersOpen?: boolean;
    summaryOpen?: boolean;
  }>();

  const periodModeModel = defineModel<PeriodMode>('periodMode', { required: true });

  const emit = defineEmits<{
    prevPeriod: [];
    nextPeriod: [];
    addClick: [event: Event];
    calendarClick: [event: Event];
    'transactions-saved': [];
    'purchases-saved': [];
    toggleFilters: [];
    toggleSummary: [];
  }>();

  const periodModeOptions = [
    { label: 'Miesiąc', value: 'month' as const },
    { label: 'Rok', value: 'year' as const },
    { label: 'Zakres', value: 'custom' as const },
  ];
</script>

<template>
  <div
    class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-surface-200 bg-surface-0 px-6 py-3 dark:border-surface-700 dark:bg-surface-950"
  >
    <div class="flex shrink-0 flex-wrap items-center gap-2">
      <OfficeIconButton
        class="text-amber-500"
        title="Dodaj transakcję"
        icon="pi pi-plus"
        @click="emit('addClick', $event)"
      />
      <BankCsvImportControl
        @transactions-saved="emit('transactions-saved')"
        @purchases-saved="emit('purchases-saved')"
      />
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2">
      <SelectButton
        v-model="periodModeModel"
        :options="periodModeOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        class="shrink-0"
      />
      <OfficeIconButton
        title="Poprzedni okres"
        icon="pi pi-chevron-left"
        class="text-primary"
        @click="emit('prevPeriod')"
      />
      <span
        class="min-w-[12rem] text-center text-sm font-medium text-surface-700 dark:text-surface-200 sm:min-w-[16rem]"
      >
        {{ periodLabel }}
      </span>
      <OfficeIconButton
        title="Następny okres"
        icon="pi pi-chevron-right"
        class="text-primary"
        @click="emit('nextPeriod')"
      />
      <OfficeIconButton
        title="Wybierz okres"
        icon="pi pi-calendar"
        class="text-primary"
        @click="emit('calendarClick', $event)"
      />
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <OfficeIconButton
        :title="`${filtersOpen ? 'Ukryj' : 'Pokaż'} filtry`"
        icon="pi pi-sliders-h"
        :class="filtersOpen ? 'text-primary' : 'text-surface-400 dark:text-surface-600'"
        @click="emit('toggleFilters')"
      />
      <OfficeIconButton
        :title="`${summaryOpen ? 'Ukryj' : 'Pokaż'} podsumowanie`"
        icon="pi pi-chart-bar"
        :class="summaryOpen ? 'text-primary' : 'text-surface-400 dark:text-surface-600'"
        @click="emit('toggleSummary')"
      />
    </div>
  </div>
</template>
