<script setup lang="ts">
  import DeviceDashboardPanel from '@/components/device/dashboard/DeviceDashboardPanel.vue';
  import { UtilsService } from '@/service/UtilsService';
  import type { RecentPurchaseItem } from '@/types/DeviceDashboard';

  defineProps<{
    purchases: RecentPurchaseItem[];
    loading?: boolean;
  }>();
</script>

<template>
  <DeviceDashboardPanel title="Ostatnio kupione" icon="pi pi-shopping-cart" :loading="loading">
    <ul v-if="purchases.length" class="flex flex-col divide-y divide-surface-200 dark:divide-surface-700">
      <li
        v-for="item in purchases"
        :key="item.id"
        class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-surface-900 dark:text-surface-0">
            {{ item.name }}
          </p>
          <p class="mt-0.5 text-xs text-surface-600 dark:text-surface-400">
            {{ item.category }}
            <span class="mx-1 text-surface-400">·</span>
            {{ UtilsService.formatDateToString(item.purchaseDate) }}
          </p>
        </div>
        <span class="shrink-0 text-sm font-semibold tabular-nums text-primary">
          {{ UtilsService.formatCurrency(item.amount) }}
        </span>
      </li>
    </ul>
    <p v-else class="text-sm text-surface-500 dark:text-surface-400">Brak urządzeń z datą zakupu.</p>
  </DeviceDashboardPanel>
</template>
