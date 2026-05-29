<script setup lang="ts">
  import DeviceDashboardPanel from '@/components/device/dashboard/DeviceDashboardPanel.vue';
  import type { AuditChangeEntry } from '@/types/DeviceDashboard';
  import moment from 'moment';

  defineProps<{
    changes: AuditChangeEntry[];
    loading?: boolean;
  }>();

  function formatRelative(date: Date): string {
    return moment(date).fromNow();
  }

  function actionIcon(action: AuditChangeEntry['action']): string {
    switch (action) {
      case 'CREATE':
        return 'pi pi-plus-circle';
      case 'DELETE':
        return 'pi pi-trash';
      case 'UPDATE':
      default:
        return 'pi pi-pencil';
    }
  }

  function actionLabel(action: AuditChangeEntry['action']): string {
    switch (action) {
      case 'CREATE':
        return 'Dodano';
      case 'DELETE':
        return 'Usunięto';
      case 'UPDATE':
      default:
        return 'Edycja';
    }
  }
</script>

<template>
  <DeviceDashboardPanel title="Ostatnie zmiany" icon="pi pi-history" :loading="loading">
    <ul v-if="changes.length" class="flex flex-col gap-3">
      <li
        v-for="entry in changes"
        :key="`${entry.entityType}-${entry.id}`"
        class="flex gap-3 rounded-lg border border-surface-200 bg-surface-50/80 px-3 py-2.5 dark:border-surface-700 dark:bg-surface-900/50"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-200 text-surface-700 dark:bg-surface-800 dark:text-surface-300"
        >
          <i :class="actionIcon(entry.action)" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm leading-snug text-surface-900 dark:text-surface-0">
            <span class="font-semibold">{{ actionLabel(entry.action) }}</span>
            <span class="text-surface-600 dark:text-surface-400">
              · {{ entry.entityType === 'DEVICE' ? 'Urządzenie' : 'Komputer' }}
            </span>
          </p>
          <p class="mt-0.5 truncate text-sm font-medium text-surface-800 dark:text-surface-200">
            {{ entry.entityName }}
          </p>
          <p class="mt-1 text-xs text-surface-500 dark:text-surface-400">
            {{ formatRelative(entry.timestamp) }}
            <span v-if="entry.user"> · {{ entry.user }}</span>
          </p>
        </div>
      </li>
    </ul>
    <p v-else class="text-sm text-surface-500 dark:text-surface-400">Brak zarejestrowanych zmian.</p>
  </DeviceDashboardPanel>
</template>
