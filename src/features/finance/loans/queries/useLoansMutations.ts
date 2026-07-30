import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createLoan,
  deleteLoan,
  updateLoan,
  updateLoanInstallment,
  updateLoanStatus,
} from '@/features/finance/loans/api/loansApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import type { Loan, LoanInstallment } from '@/features/finance/loans/types';
import type { PaymentStatus } from '@/features/finance/payments/types';

export function useCreateLoanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (loan: Loan) => createLoan(loan),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.loans.all() });
    },
  });
}

export function useUpdateLoanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (loan: Loan) => updateLoan(loan),
    onSuccess: loan => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.loans.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.loans.detail(loan.id) });
    },
  });
}

export function useDeleteLoanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (loanId: number) => deleteLoan(loanId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.loans.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.payments.all() });
    },
  });
}

export function useUpdateLoanStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loanId, status }: { loanId: number; status: PaymentStatus }) => updateLoanStatus(loanId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.loans.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.payments.all() });
    },
  });
}

export function useUpdateLoanInstallmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (installment: LoanInstallment) => updateLoanInstallment(installment),
    onSuccess: loan => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.loans.all() });
      if (loan) void queryClient.invalidateQueries({ queryKey: financeKeys.loans.detail(loan.id) });
      void queryClient.invalidateQueries({ queryKey: financeKeys.payments.all() });
    },
  });
}
