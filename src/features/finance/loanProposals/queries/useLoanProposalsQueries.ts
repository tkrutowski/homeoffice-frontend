import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchLoanProposal, fetchLoanProposals } from '@/features/finance/loanProposals/api/loanProposalsApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import type { LoanProposalStatus } from '@/features/finance/loanProposals/types';

export function useLoanProposalsListQuery(status: MaybeRefOrGetter<LoanProposalStatus | undefined>) {
  return useQuery({
    queryKey: computed(() => financeKeys.loanProposals.list(toValue(status))),
    queryFn: () => fetchLoanProposals(toValue(status)),
    refetchInterval: 60_000,
  });
}

export function useLoanProposalQuery(
  proposalId: MaybeRefOrGetter<number | null>,
  enabled: MaybeRefOrGetter<boolean> = true
) {
  return useQuery({
    queryKey: computed(() => financeKeys.loanProposals.detail(toValue(proposalId) ?? 0)),
    queryFn: () => fetchLoanProposal(toValue(proposalId) as number),
    enabled: computed(() => toValue(enabled) && !!toValue(proposalId)),
  });
}
