import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchLoan, fetchLoansByYearAndStatusAndUser, fetchLoansPage } from '@/features/finance/loans/api/loansApi';
import { financeKeys, type LoanPageParams } from '@/features/finance/_shared/queryKeys';
import type { StatusType } from '@/types/StatusType';

export function useLoansPageQuery(params: MaybeRefOrGetter<LoanPageParams>) {
  return useQuery({
    queryKey: computed(() => financeKeys.loans.page(toValue(params))),
    queryFn: () => fetchLoansPage(toValue(params)),
  });
}

export function useLoanQuery(loanId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => financeKeys.loans.detail(toValue(loanId))),
    queryFn: () => fetchLoan(toValue(loanId)),
    enabled: computed(() => toValue(enabled) && toValue(loanId) > 0),
  });
}

export function useLoansByYearStatusUserQuery(
  year: MaybeRefOrGetter<number>,
  status: MaybeRefOrGetter<StatusType>,
  userId: MaybeRefOrGetter<number | undefined> = undefined,
  enabled: MaybeRefOrGetter<boolean> = true
) {
  return useQuery({
    queryKey: computed(() =>
      financeKeys.loans.byYearStatusUser(toValue(year), toValue(status), toValue(userId))
    ),
    queryFn: () => fetchLoansByYearAndStatusAndUser(toValue(year), toValue(status), toValue(userId)),
    enabled: computed(() => toValue(enabled)),
  });
}
