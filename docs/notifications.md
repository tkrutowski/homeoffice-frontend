# System globalnych powiadomień (dzwonek)

Dokumentacja architektury "rzeczy wymagających uwagi" widocznej w dzwonku w `TheHeader`
(`NotificationsBell.vue`) oraz sticky Toastów przy zmianie liczników (`useNotificationsWatcher`).

Dotyczy plików:
- `src/types/Notification.ts` — kontrakt `AppNotification`
- `src/features/<domain>/_shared/notifications.ts` — adapter per moduł (np. `useFinanceNotifications`)
- `src/composables/useAppNotifications.ts` — agregator wszystkich modułów
- `src/components/NotificationsBell.vue` — UI dzwonka
- `src/composables/useNotificationsWatcher.ts` — sticky Toasty przy zmianie liczników
- `src/composables/notificationToastSuppression.ts` — wyciszanie toasta watchera dla własnych akcji

## 1. Schemat architektury

```
┌──────────────────────────────────────────────────────────────────────────┐
│  features/finance/_shared/notifications.ts                               │
│  useFinanceNotifications()                                               │
│                                                                            │
│   useLoanProposalsListQuery(EXTRACTED)  ──► computed extractedCount      │
│                                              │                            │
│                                              ▼                            │
│                                   AppNotification {                      │
│                                     id: 'finance-loanProposals',          │
│                                     count, label, route,                 │
│                                     toastMessages: { increased, decreased }│
│                                   }                                       │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │  (w przyszłości: useLibraryNotifications,
                                 │   useDeviceNotifications, ...)
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  composables/useAppNotifications.ts                                      │
│  computed<AppNotification[]>  = [...finance, ...library, ...device]      │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 ▼                                 ▼
┌───────────────────────────────┐   ┌──────────────────────────────────────┐
│ NotificationsBell.vue          │   │ useNotificationsWatcher() (singleton) │
│ (TheHeader, wiele instancji     │   │ wołany DOKŁADNIE RAZ w App.vue        │
│  OK — Query dedupikuje request) │   │                                        │
│                                  │   │ watch(notifications, ...) {           │
│ - pokazuje listę z count > 0    │   │   diff count vs previousCounts        │
│ - klik → router.push(route)     │   │   → toast.add(...)                    │
└───────────────────────────────┘   └──────────────┬─────────────────────────┘
                                                     │ sprawdza przed toastem
                                                     ▼
                                    ┌──────────────────────────────────────┐
                                    │ notificationToastSuppression.ts       │
                                    │ Set<string> wyciszonych źródeł        │
                                    │ (ustawiane przez mutacje onSuccess)   │
                                    └──────────────────────────────────────┘
```

## 2. Kontrakt `AppNotification`

```ts
interface AppNotification {
  id: string;               // unikalny w skali apki, np. 'finance-loanProposals'
  module: NotificationModule;
  icon: string;              // klasa PrimeIcons
  label: string;             // etykieta w panelu dzwonka, np. "Propozycje z e-maila (3)"
  count: number;             // liczba pozycji
  route: RouteLocationRaw;   // dokąd przenosi klik
  severity?: 'info' | 'warn' | 'error' | 'success';
  toastMessages?: {
    increased: (count: number) => string;
    decreased: (count: number) => string;
  };
}
```

**Ważne:** źródło musi zwracać wpis **zawsze**, nawet przy `count === 0`. `NotificationsBell`
sam odfiltrowuje `count > 0` do wyświetlenia, ale `useNotificationsWatcher` potrzebuje
`toastMessages` dostępnych na każdym poziomie licznika (także przy przejściu *do* zera),
żeby poprawnie zdiffować zmianę.

## 3. Przepływ danych — od zapytania do dzwonka

1. Adapter modułu (`useFinanceNotifications`) **reużywa** istniejący hook Query
   (`useLoanProposalsListQuery`) — ten sam `queryKey` co w widoku listy, więc TanStack Query
   dedupikuje requesty i nic dodatkowego się nie odpytuje.
2. Adapter liczy `count` jako `computed` z danych zapytania i mapuje na `AppNotification`.
3. `useAppNotifications()` składa wszystkie adaptery modułów w jedną reaktywną listę.
4. `NotificationsBell.vue` czyta tę listę bezpośrednio (własne, niezależne wywołanie —
   bezpieczne, bo dedupikacja dzieje się na poziomie Query, nie na poziomie composable).
5. `useNotificationsWatcher()` — **wołany raz, w `App.vue`** — obserwuje tę samą listę i przy
   każdej zmianie `count` dla danego `id` pokazuje sticky Toast (`closable: true`, bez `life`,
   więc zamykany wyłącznie ręcznie).

## 4. Dlaczego watcher jest singletonem

`useNotificationsWatcher()` trzyma stan `previousCounts` (poprzednie liczniki) i porównuje go
przy każdej zmianie. Gdyby wywołać go w więcej niż jednym miejscu (np. dodatkowo w
`NotificationsBell.vue`), powstałyby dwie niezależne instancje `previousCounts`, każda odpalająca
własny Toast przy tej samej zmianie — użytkownik zobaczyłby zdublowane powiadomienia.
Dlatego woła się go dokładnie raz, obok `<Toast />` w `App.vue`.

## 5. Problem: podwójny Toast przy własnej akcji użytkownika

### Sekwencja zdarzeń (przed poprawką)

```
Użytkownik klika "Odrzuć" na LoanProposalsView
        │
        ▼
ignoreProposalMutation.mutateAsync(id)
        │
        ├─► onSuccess mutacji: invalidateQueries(financeKeys.loanProposals.all())
        │         │
        │         ▼
        │   refetch w tle → count: 18 → 17
        │         │
        │         ▼
        │   useFinanceNotifications → AppNotification.count = 17
        │         │
        │         ▼
        │   useNotificationsWatcher widzi 17 ≠ 18 (poprzednie)
        │         │
        │         ▼
        │   toast.add("Powiadomienie obsłużone / ... zostało 17")   ◄── TOAST #2
        │
        └─► .then() w LoanProposalsView.vue:
                  toast.add("Potwierdzenie / Odrzucono propozycję")  ◄── TOAST #1
```

Watcher nie ma żadnego sposobu odróżnienia: *"to ja sam przed chwilą coś zrobiłem"* od
*"ktoś inny / inna karta właśnie coś zmieniła"* — obie sytuacje wyglądają identycznie jako
diff licznika w cache Query. Stąd przy kilku akcjach z rzędu toasty z watchera piętrzą się
(bo są `closable` bez `life`).

### Rozwiązanie: jednorazowa flaga wyciszenia

`notificationToastSuppression.ts` udostępnia moduł-singleton z `Set<string>`:

```ts
const suppressedSourceIds = new Set<string>();

export function suppressNotificationToast(id: string): void {
  suppressedSourceIds.add(id);
}

export function consumeNotificationToastSuppression(id: string): boolean {
  return suppressedSourceIds.delete(id); // true tylko przy pierwszym odczycie
}
```

### Sekwencja zdarzeń (po poprawce)

```
onSuccess mutacji:
  1. suppressNotificationToast('finance-loanProposals')   ← SYNCHRONICZNIE, zanim cokolwiek inne się stanie
  2. invalidateQueries(...)                                ← ASYNCHRONICZNIE, refetch w tle

...jakiś czas później, gdy refetch się skończy...

useNotificationsWatcher:
  count 17 ≠ previous 18
  consumeNotificationToastSuppression('finance-loanProposals') → true, flaga usunięta
  → `continue`, TOAST #2 SIĘ NIE POJAWIA

  (poza pętlą, zawsze) previousCounts.set('finance-loanProposals', 17)  ← baseline zaktualizowany
```

Kluczowe właściwości:
- **Odporność na timing** — flaga nie ma `setTimeout`/okna czasowego. Czeka w `Set`, aż watcher
  ją odczyta, niezależnie od tego, ile trwa refetch.
- **Jednorazowość** — `Set.delete()` zwraca `true` tylko przy pierwszym trafieniu, więc kolejna,
  **prawdziwa** zmiana z innego urządzenia (np. count 17 → 16 zrobione przez kogoś innego) nie
  jest wyciszona — `Set` jest już pusty dla tego `id`, więc Toast się pokaże normalnie.
- **Baseline aktualizuje się zawsze** — niezależnie od tego, czy Toast się pokazał, żeby kolejny
  diff porównywał się z aktualnym stanem, a nie ze starym.

## 6. Jak dodać nowe źródło powiadomień (np. dla Library)

1. Utwórz `features/library/_shared/notifications.ts` z `useLibraryNotifications()` w tym samym
   kształcie co `useFinanceNotifications` — reużyj istniejący hook Query danego modułu, policz
   `count`, zwróć `AppNotification[]` (zawsze z wpisem, nawet przy `count: 0`).
2. Wyeksportuj stałą z `id` źródła (np. `LIBRARY_XXX_NOTIFICATION_ID`), żeby uniknąć magicznych
   stringów przy wyciszaniu toasta w mutacjach.
3. Dopisz `useLibraryNotifications()` do listy w `useAppNotifications.ts`.
4. W mutacjach, które lokalnie już pokazują swój Toast i jednocześnie zmieniają licznik tego
   źródła (przez `invalidateQueries`), wywołaj `suppressNotificationToast(ID)` w `onSuccess`,
   **przed** `invalidateQueries` — dokładnie tak jak w `useLoanProposalsMutations.ts`.
5. Nie wołaj `useNotificationsWatcher()` ponownie — pozostaje jeden singleton w `App.vue`.

## 7. Powiązane pliki

| Plik | Rola |
|---|---|
| `src/types/Notification.ts` | Kontrakt `AppNotification` / `NotificationToastMessages` |
| `src/features/finance/_shared/notifications.ts` | Adapter Finance (`useFinanceNotifications`) |
| `src/composables/useAppNotifications.ts` | Agregator wszystkich modułów |
| `src/components/NotificationsBell.vue` | UI dzwonka w `TheHeader` |
| `src/composables/useNotificationsWatcher.ts` | Sticky Toasty przy zmianie liczników (singleton) |
| `src/composables/notificationToastSuppression.ts` | Wyciszanie toasta watchera dla akcji lokalnych |
| `src/features/finance/loanProposals/queries/useLoanProposalsMutations.ts` | Przykład użycia `suppressNotificationToast` |
