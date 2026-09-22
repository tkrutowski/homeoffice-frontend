/**
 * Pozwala mutacjom, które same pokazują konkretny Toast (np. "Odrzucono propozycję"),
 * wyciszyć najbliższy sticky Toast `useNotificationsWatcher` dla danego źródła (`AppNotification.id`).
 *
 * Bez tego watcher nie odróżnia zmiany licznika spowodowanej lokalną akcją użytkownika od zmiany
 * zrobionej na innym urządzeniu/przez innego użytkownika — obie wyglądają identycznie w cache Query.
 *
 * Użycie: mutacja woła `suppressNotificationToast(id)` w `onSuccess`, tuż przed `invalidateQueries`.
 * Flaga jest jednorazowa — znika po pierwszym odczycie przez watcher (`consumeNotificationToastSuppression`),
 * niezależnie od tego, ile czasu zajmie refetch.
 */
const suppressedSourceIds = new Set<string>();

export function suppressNotificationToast(id: string): void {
  suppressedSourceIds.add(id);
}

export function consumeNotificationToastSuppression(id: string): boolean {
  return suppressedSourceIds.delete(id);
}
