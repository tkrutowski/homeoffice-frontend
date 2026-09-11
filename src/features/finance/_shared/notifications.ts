import { computed } from 'vue';
import { useAuthorizationStore } from '@/stores/authorization';
import { useLoanProposalsListQuery } from '@/features/finance/loanProposals/queries/useLoanProposalsQueries';
import { LoanProposalStatus } from '@/features/finance/loanProposals/types';
import type { AppNotification } from '@/types/Notification';

/**
 * Powiadomienia modułu Finance dla globalnego dzwonka (patrz `useAppNotifications`).
 * Reużywa istniejący `useLoanProposalsListQuery` (ten sam `queryKey` co w `TheMenuFinance` /
 * `FinanceHomeView`) — TanStack Query dedupikuje zapytania, więc nie dokłada to nowych requestów.
 */
export function useFinanceNotifications() {
  const authorizationStore = useAuthorizationStore();

  // Nie odpytuj przed zalogowaniem — dzwonek (w TheHeader) i watcher żyją na każdej stronie, w tym na ekranie logowania.
  const loanProposalsQuery = useLoanProposalsListQuery(
    LoanProposalStatus.EXTRACTED,
    computed(() => authorizationStore.isAuthenticatedOrToken)
  );
  const extractedCount = computed(() => loanProposalsQuery.data.value?.length ?? 0);

  return computed<AppNotification[]>(() => [
    {
      id: 'finance-loanProposals',
      module: 'finance',
      icon: 'pi pi-envelope',
      label: `Propozycje z e-maila (${extractedCount.value})`,
      count: extractedCount.value,
      route: { name: 'LoanProposals' },
      severity: 'info',
      toastMessages: {
        increased: n => `Pojawiła się nowa propozycja z e-maila (łącznie ${n} do przejrzenia)`,
        decreased: n =>
          n > 0
            ? `Propozycja z e-maila została obsłużona na innym urządzeniu (zostało ${n})`
            : 'Wszystkie propozycje z e-maila zostały obsłużone',
      },
    },
  ]);
}
