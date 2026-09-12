import { computed } from 'vue';
import { useFinanceNotifications } from '@/features/finance/_shared/notifications';
import type { AppNotification } from '@/types/Notification';

/**
 * Agreguje powiadomienia ze wszystkich modułów w jedną listę, widoczną globalnie w `NotificationsBell.vue`
 * i obserwowaną przez `useNotificationsWatcher` (sticky Toasty przy zmianie liczników).
 *
 * Dodanie kolejnego źródła (np. Library): dopisać `features/library/_shared/notifications.ts`
 * z `useLibraryNotifications()` w tym samym kształcie co `useFinanceNotifications`, a tutaj dołożyć je do listy.
 */
export function useAppNotifications() {
  const finance = useFinanceNotifications();
  // const library = useLibraryNotifications(); // dodać, gdy Library dorobi własne powiadomienia

  return computed<AppNotification[]>(() => [...finance.value /* , ...library.value */]);
}
