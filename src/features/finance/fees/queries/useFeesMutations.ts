import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createFee,
  deleteFee,
  updateFee,
  updateFeeInstallment,
  updateFeeStatus,
} from '@/features/finance/fees/api/feesApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import type { Fee, FeeInstallment } from '@/features/finance/fees/types';
import type { PaymentStatus } from '@/features/finance/payments/types';

export function useCreateFeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fee: Fee) => createFee(fee),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.fees.all() });
    },
  });
}

export function useUpdateFeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fee: Fee) => updateFee(fee),
    onSuccess: fee => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.fees.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.fees.detail(fee.id) });
    },
  });
}

export function useDeleteFeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feeId: number) => deleteFee(feeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.fees.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.payments.all() });
    },
  });
}

export function useUpdateFeeStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feeId, status }: { feeId: number; status: PaymentStatus }) => updateFeeStatus(feeId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.fees.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.payments.all() });
    },
  });
}

export function useUpdateFeeInstallmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (installment: FeeInstallment) => updateFeeInstallment(installment),
    onSuccess: fee => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.fees.all() });
      if (fee) void queryClient.invalidateQueries({ queryKey: financeKeys.fees.detail(fee.id) });
      void queryClient.invalidateQueries({ queryKey: financeKeys.payments.all() });
    },
  });
}
