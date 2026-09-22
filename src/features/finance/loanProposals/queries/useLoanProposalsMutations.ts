import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  acceptLoanProposal,
  acceptLoanProposalAsPurchase,
  deleteLoanProposal,
  ignoreLoanProposal,
} from '@/features/finance/loanProposals/api/loanProposalsApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import { FINANCE_LOAN_PROPOSALS_NOTIFICATION_ID } from '@/features/finance/_shared/notifications';
import { suppressNotificationToast } from '@/composables/notificationToastSuppression';
import type { Loan } from '@/features/finance/loans/types';
import type { Purchase } from '@/features/finance/purchases/types';

export function useAcceptLoanProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ proposalId, loan }: { proposalId: number; loan: Loan }) => acceptLoanProposal(proposalId, loan),
    onSuccess: () => {
      suppressNotificationToast(FINANCE_LOAN_PROPOSALS_NOTIFICATION_ID);
      void queryClient.invalidateQueries({ queryKey: financeKeys.loanProposals.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.loans.all() });
    },
  });
}

export function useAcceptLoanProposalAsPurchaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ proposalId, purchase }: { proposalId: number; purchase: Purchase }) =>
      acceptLoanProposalAsPurchase(proposalId, purchase),
    onSuccess: () => {
      suppressNotificationToast(FINANCE_LOAN_PROPOSALS_NOTIFICATION_ID);
      void queryClient.invalidateQueries({ queryKey: financeKeys.loanProposals.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.purchases.all() });
    },
  });
}

export function useIgnoreLoanProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: number) => ignoreLoanProposal(proposalId),
    onSuccess: () => {
      suppressNotificationToast(FINANCE_LOAN_PROPOSALS_NOTIFICATION_ID);
      void queryClient.invalidateQueries({ queryKey: financeKeys.loanProposals.all() });
    },
  });
}

export function useDeleteLoanProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: number) => deleteLoanProposal(proposalId),
    onSuccess: () => {
      suppressNotificationToast(FINANCE_LOAN_PROPOSALS_NOTIFICATION_ID);
      void queryClient.invalidateQueries({ queryKey: financeKeys.loanProposals.all() });
    },
  });
}
