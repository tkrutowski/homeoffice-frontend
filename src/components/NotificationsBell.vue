<script setup lang="ts">
  /**
   * Globalny dzwonek powiadomień — widoczny na każdej stronie (osadzony w `TheHeader.vue`).
   * Agreguje powiadomienia ze wszystkich modułów przez `useAppNotifications` (patrz też
   * `useNotificationsWatcher` — osobny mechanizm sticky Toastów przy zmianie liczników).
   */
  import { computed, ref } from 'vue';
  import Popover from 'primevue/popover';
  import router from '@/router';
  import { useAppNotifications } from '@/composables/useAppNotifications';
  import type { AppNotification } from '@/types/Notification';

  const notifications = useAppNotifications();
  const visibleNotifications = computed(() => notifications.value.filter(n => n.count > 0));
  const totalCount = computed(() => visibleNotifications.value.reduce((sum, n) => sum + n.count, 0));

  const popoverRef = ref<InstanceType<typeof Popover> | null>(null);

  function toggle(event: Event) {
    popoverRef.value?.toggle(event);
  }

  function openNotification(notification: AppNotification) {
    popoverRef.value?.hide();
    router.push(notification.route);
  }
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex h-12 w-12 items-center justify-center rounded-full text-surface-0 transition-colors hover:bg-white/10"
      :aria-label="totalCount > 0 ? `Powiadomienia (${totalCount})` : 'Powiadomienia'"
      @click="toggle"
    >
      <OverlayBadge
        v-if="totalCount > 0"
        :value="totalCount"
        severity="danger"
        class="flex h-12 w-12 items-center justify-center"
      >
        <i class="pi pi-bell text-2xl" aria-hidden="true" />
      </OverlayBadge>
      <i v-else class="pi pi-bell text-2xl" aria-hidden="true" />
    </button>

    <Popover
      ref="popoverRef"
      class="w-[min(22rem,calc(100vw-2rem))] border border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-950"
      :pt="{ content: { class: 'p-0' } }"
    >
      <div class="flex flex-col">
        <div
          class="border-b border-surface-200 px-4 py-2 text-sm font-semibold text-surface-900 dark:border-surface-700 dark:text-surface-0"
        >
          Powiadomienia
        </div>
        <ul v-if="visibleNotifications.length > 0" class="max-h-80 overflow-y-auto py-1">
          <li v-for="notification in visibleNotifications" :key="notification.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
              @click="openNotification(notification)"
            >
              <i :class="notification.icon" class="shrink-0 text-primary" aria-hidden="true" />
              <span class="min-w-0 flex-1 truncate text-surface-900 dark:text-surface-0">{{ notification.label }}</span>
              <i class="pi pi-arrow-right shrink-0 text-surface-400 dark:text-surface-500" aria-hidden="true" />
            </button>
          </li>
        </ul>
        <div v-else class="px-4 py-6 text-center text-sm text-surface-500 dark:text-surface-400">
          Brak nowych powiadomień
        </div>
      </div>
    </Popover>
  </div>
</template>
