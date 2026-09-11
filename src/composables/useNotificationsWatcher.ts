import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthorizationStore } from '@/stores/authorization';
import { useAppNotifications } from '@/composables/useAppNotifications';

/**
 * Obserwuje `useAppNotifications` i przy każdej zmianie licznika (`count`) danego źródła pokazuje
 * sticky Toast (bez `life` — zamykany wyłącznie ręcznie):
 * - licznik wzrósł → nowa pozycja do przejrzenia,
 * - licznik spadł → pozycja obsłużona/usunięta (np. przez innego użytkownika / na innym urządzeniu).
 *
 * Nie odpala Toastów przy pierwszym odczycie (start aplikacji / dopiero po zalogowaniu) — tylko baseline.
 *
 * WAŻNE: wołać DOKŁADNIE RAZ, w `App.vue` (obok istniejącego `<Toast />`). Powtórne wywołanie
 * (np. z poziomu `NotificationsBell.vue`) zdublowałoby Toasty — `NotificationsBell` ma czytać dane
 * przez własne, niezależne wywołanie `useAppNotifications()` (samo w sobie bezpieczne, bo
 * zapytania są dedupikowane przez TanStack Query po `queryKey`).
 */
export function useNotificationsWatcher() {
  const toast = useToast();
  const authorizationStore = useAuthorizationStore();
  const notifications = useAppNotifications();

  const previousCounts = ref<Map<string, number>>(new Map());
  let initialized = false;

  watch(
    notifications,
    current => {
      // Przed zalogowaniem (np. ekran logowania) nie ustalaj baseline'u ani nie pokazuj Toastów.
      if (!authorizationStore.isAuthenticatedOrToken) return;

      if (initialized) {
        for (const notification of current) {
          if (!notification.toastMessages) continue;
          const previous = previousCounts.value.get(notification.id) ?? notification.count;
          if (notification.count === previous) continue;

          if (notification.count > previous) {
            toast.add({
              severity: notification.severity ?? 'info',
              summary: 'Nowe powiadomienie',
              detail: notification.toastMessages.increased(notification.count),
              closable: true,
            });
          } else {
            toast.add({
              severity: 'success',
              summary: 'Powiadomienie obsłużone',
              detail: notification.toastMessages.decreased(notification.count),
              closable: true,
            });
          }
        }
      }

      previousCounts.value = new Map(current.map(n => [n.id, n.count]));
      initialized = true;
    },
    { deep: true }
  );
}
