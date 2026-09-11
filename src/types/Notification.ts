import type { RouteLocationRaw } from 'vue-router';

/**
 * Moduł, z którego pochodzi powiadomienie. Rozszerzać w miarę dodawania kolejnych źródeł
 * (np. 'library' po dodaniu pierwszego powiadomienia w module Library).
 */
export type NotificationModule = 'finance' | 'library' | 'device' | 'share' | 'admin';

export interface NotificationToastMessages {
  /** Treść sticky Toasta, gdy licznik wzrósł (pojawiła się nowa pozycja). */
  increased: (count: number) => string;
  /** Treść sticky Toasta, gdy licznik spadł (pozycja obsłużona/usunięta, np. na innym urządzeniu). */
  decreased: (count: number) => string;
}

/**
 * Powiadomienie agregowane w globalnym dzwonku (`NotificationsBell.vue`, `TheHeader.vue`).
 * Każdy moduł dostarcza własną listę przez composable w `features/<domain>/_shared/notifications.ts`
 * (patrz `useFinanceNotifications`), a `useAppNotifications` składa je w jedną listę.
 *
 * Uwaga: źródło powinno zwracać wpis zawsze (nawet przy `count === 0`), żeby `useNotificationsWatcher`
 * miał dostęp do `toastMessages` również przy przejściu do zera — UI (np. `NotificationsBell`) filtruje
 * wyświetlanie po `count > 0` samodzielnie.
 */
export interface AppNotification {
  /** Unikalny identyfikator źródła powiadomienia w skali całej aplikacji (nie pojedynczego wpisu). */
  id: string;
  module: NotificationModule;
  /** Klasa ikony PrimeIcons, np. 'pi pi-envelope'. */
  icon: string;
  /** Etykieta wyświetlana w panelu dzwonka, np. "Propozycje z e-maila (3)". */
  label: string;
  /** Liczba pozycji składających się na to powiadomienie. */
  count: number;
  /** Miejsce, do którego przenosi kliknięcie powiadomienia. */
  route: RouteLocationRaw;
  /** Zgodne z severity PrimeVue Toast (`useNotificationsWatcher` przekazuje je wprost do `toast.add`). */
  severity?: 'info' | 'warn' | 'error' | 'success';
  /** Treści Toastów przy zmianie `count`; brak = `useNotificationsWatcher` pomija to źródło. */
  toastMessages?: NotificationToastMessages;
}
