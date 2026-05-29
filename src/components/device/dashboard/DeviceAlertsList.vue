<script setup lang="ts">
  import { computed } from 'vue';
  import DeviceDashboardPanel from '@/components/device/dashboard/DeviceDashboardPanel.vue';
  import type { DashboardAlert } from '@/types/DeviceDashboard';

  const props = defineProps<{
    alerts: DashboardAlert[];
    loading?: boolean;
  }>();

  const alertCountBadge = computed(() => {
    const n = props.alerts.length;
    if (n === 1) return '1 alert';
    if (n >= 2 && n <= 4) return `${n} alerty`;
    return `${n} alertów`;
  });
</script>

<template>
  <DeviceDashboardPanel
    title="Alerty"
    icon="pi pi-exclamation-circle"
    :loading="loading"
    :badge="loading ? undefined : alertCountBadge"
  >
    <div v-if="alerts.length" class="max-h-80 overflow-y-auto overflow-x-hidden pr-1">
      <ul class="flex flex-col gap-3">
        <li
          v-for="alert in alerts"
          :key="alert.id"
          class="flex gap-3 rounded-lg border px-3 py-2.5 text-sm"
          :class="
            alert.severity === 'warn'
              ? 'border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-600/50 dark:bg-amber-950/30 dark:text-amber-100'
              : 'border-sky-300/80 bg-sky-50 text-sky-950 dark:border-sky-600/50 dark:bg-sky-950/30 dark:text-sky-100'
          "
        >
          <i
            :class="alert.severity === 'warn' ? 'pi pi-exclamation-triangle' : 'pi pi-info-circle'"
            class="mt-0.5 shrink-0 text-base"
            aria-hidden="true"
          />
          <span class="min-w-0 leading-snug">{{ alert.message }}</span>
        </li>
      </ul>
    </div>
    <p v-else class="text-sm text-surface-500 dark:text-surface-400">Brak alertów — wszystko wygląda w porządku.</p>
  </DeviceDashboardPanel>
</template>
