<script setup lang="ts">
  import { onMounted } from 'vue';
  import TheMenuDevice from '@/components/device/TheMenuDevice.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { useDeviceDashboard } from '@/composables/useDeviceDashboard';
  import DeviceFinancialSummary from '@/components/device/dashboard/DeviceFinancialSummary.vue';
  import DeviceCostChart from '@/components/device/dashboard/DeviceCostChart.vue';
  import DeviceCategoryBreakdown from '@/components/device/dashboard/DeviceCategoryBreakdown.vue';
  import DeviceComputerList from '@/components/device/dashboard/DeviceComputerList.vue';
  import DeviceAlertsList from '@/components/device/dashboard/DeviceAlertsList.vue';
  import DeviceRecentPurchases from '@/components/device/dashboard/DeviceRecentPurchases.vue';
  import DeviceRecentChanges from '@/components/device/dashboard/DeviceRecentChanges.vue';

  const {
    isLoading,
    isLoadingAudit,
    loadDashboardData,
    isEmpty,
    totalValue,
    categoryAggregates,
    valueByCategory,
    maxCategoryCount,
    chartData,
    alerts,
    computerListItems,
    recentPurchases,
    recentChanges,
  } = useDeviceDashboard();

  onMounted(() => {
    loadDashboardData();
  });
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenuDevice />
    </template>

    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <header class="shrink-0">
        <h1 class="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
          Tablica urządzeń
        </h1>
        <p class="mt-1 text-sm text-surface-600 dark:text-surface-400">
          Przegląd inwentarza, kosztów i alertów w jednym miejscu.
        </p>
      </header>

      <p
        v-if="!isLoading && isEmpty"
        class="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400"
      >
        Katalog jest pusty. Dodaj urządzenia lub komputery, aby zobaczyć statystyki.
      </p>

      <!-- Finansowe -->
      <DeviceFinancialSummary
        :total-value="totalValue"
        :value-by-category="valueByCategory"
        :loading="isLoading"
      />

      <!-- Wykres + podział kategorii -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <DeviceCostChart :chart-data="chartData" :loading="isLoading" />
        </div>
        <DeviceCategoryBreakdown
          :categories="categoryAggregates"
          :max-count="maxCategoryCount"
          :loading="isLoading"
        />
      </div>

      <!-- Komputery + alerty -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DeviceComputerList :computers="computerListItems" :loading="isLoading" />
        <DeviceAlertsList :alerts="alerts" :loading="isLoading" />
      </div>

      <!-- Czasowe -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DeviceRecentPurchases :purchases="recentPurchases" :loading="isLoading" />
        <DeviceRecentChanges :changes="recentChanges" :loading="isLoadingAudit" />
      </div>
    </div>
  </MainPageShell>
</template>
