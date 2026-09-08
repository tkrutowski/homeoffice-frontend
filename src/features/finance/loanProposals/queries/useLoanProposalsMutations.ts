import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  acceptLoanProposal,
  deleteLoanProposal,
  ignoreLoanProposal,
} from '@/features/finance/loanProposals/api/loanProposalsApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import type { Loan } from '@/features/finance/loans/types';

export function useAcceptLoanProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ proposalId, loan }: { proposalId: number; loan: Loan }) => acceptLoanProposal(proposalId, loan),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.loanProposals.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.loans.all() });
    },
  });
}

export function useIgnoreLoanProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: number) => ignoreLoanProposal(proposalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.loanProposals.all() });
    },
  });
}

export function useDeleteLoanProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: number) => deleteLoanProposal(proposalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.loanProposals.all() });
    },
  });
}
