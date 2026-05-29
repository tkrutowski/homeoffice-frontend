<script setup lang="ts">
  import router from '@/router';
  import DeviceDashboardPanel from '@/components/device/dashboard/DeviceDashboardPanel.vue';
  import type { ComputerListItem } from '@/types/DeviceDashboard';

  defineProps<{
    computers: ComputerListItem[];
    loading?: boolean;
  }>();

  function goToComputer(computerId: number) {
    router.push({ name: 'Computers', query: { id: String(computerId) } });
  }
</script>

<template>
  <DeviceDashboardPanel title="Moje komputery" icon="pi pi-desktop" :loading="loading">
    <ul v-if="computers.length" class="flex flex-col divide-y divide-surface-200 dark:divide-surface-700">
      <li v-for="computer in computers" :key="computer.id">
        <button
          type="button"
          class="flex w-full items-center gap-3 py-3 text-left transition hover:bg-surface-50 dark:hover:bg-surface-900/60 rounded-lg px-1 -mx-1"
          @click="goToComputer(computer.id)"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-800 text-primary dark:bg-surface-800"
          >
            <i :class="computer.icon" class="text-lg" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-surface-900 dark:text-surface-0">
              {{ computer.name }}
            </p>
            <p class="mt-0.5 line-clamp-2 text-xs text-surface-600 dark:text-surface-400">
              {{ computer.summary }}
            </p>
          </div>
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :class="
              computer.isActive
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                : 'bg-surface-400 dark:bg-surface-500'
            "
            :title="computer.isActive ? 'Aktywny' : 'Nieaktywny'"
            aria-hidden="true"
          />
        </button>
      </li>
    </ul>
    <p v-else class="text-sm text-surface-500 dark:text-surface-400">Brak zarejestrowanych komputerów.</p>
  </DeviceDashboardPanel>
</template>
