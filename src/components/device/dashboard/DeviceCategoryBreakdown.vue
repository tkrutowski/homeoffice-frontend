<script setup lang="ts">
  import DeviceDashboardPanel from '@/components/device/dashboard/DeviceDashboardPanel.vue';
  import type { CategoryAggregate } from '@/types/DeviceDashboard';

  defineProps<{
    categories: CategoryAggregate[];
    maxCount: number;
    loading?: boolean;
  }>();
</script>

<template>
  <DeviceDashboardPanel title="Podział szczegółowy" icon="pi pi-list" :loading="loading">
    <ul v-if="categories.length" class="flex flex-col gap-4">
      <li
        v-for="cat in categories"
        :key="cat.name"
        class="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-3"
      >
        <span class="truncate text-sm font-medium text-surface-800 dark:text-surface-200">
          {{ cat.name }}
        </span>
        <div
          class="h-2 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700"
          role="presentation"
        >
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="cat.barColorClass"
            :style="{ width: `${Math.max(4, (cat.count / maxCount) * 100)}%` }"
          />
        </div>
        <span class="w-8 text-right text-sm font-semibold tabular-nums text-surface-900 dark:text-surface-0">
          {{ cat.count }}
        </span>
      </li>
    </ul>
    <p v-else class="text-sm text-surface-500 dark:text-surface-400">Brak danych do wyświetlenia.</p>
  </DeviceDashboardPanel>
</template>
