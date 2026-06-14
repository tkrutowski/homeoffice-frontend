<script setup lang="ts">
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import BankCsvImportControl from '@/components/finance/BankCsvImportControl.vue';

  defineProps<{
    monthLabel: string;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    prevMonth: [];
    nextMonth: [];
    addClick: [event: Event];
    calendarClick: [event: Event];
    'transactions-saved': [];
    'purchases-saved': [];
  }>();
</script>

<template>
  <div
    class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-surface-200 bg-surface-0 px-6 py-3 dark:border-surface-700 dark:bg-surface-950"
  >
    <div class="flex shrink-0 items-center gap-1">
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
      <OfficeIconButton
        title="Poprzedni miesiąc"
        icon="pi pi-chevron-left"
        class="text-primary"
        @click="emit('prevMonth')"
      />
      <span
        class="min-w-[12rem] text-center text-sm font-medium text-surface-700 dark:text-surface-200 sm:min-w-[16rem]"
      >
        {{ monthLabel }}
      </span>
      <OfficeIconButton
        title="Następny miesiąc"
        icon="pi pi-chevron-right"
        class="text-primary"
        @click="emit('nextMonth')"
      />
      <OfficeIconButton
        title="Wybierz miesiąc"
        icon="pi pi-calendar"
        class="text-primary"
        @click="emit('calendarClick', $event)"
      />
    </div>

    <div class="hidden w-[8rem] shrink-0 sm:block" aria-hidden="true" />
  </div>
</template>
