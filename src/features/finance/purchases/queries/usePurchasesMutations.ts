import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { PaymentStatus } from '@/features/finance/payments/types';
import type { Purchase } from '@/features/finance/purchases/types';
import { createPurchase, deletePurchase, updatePurchase, updatePurchaseStatus } from '@/features/finance/purchases/api/purchasesApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';

export function useCreatePurchaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchase: Purchase) => createPurchase(purchase),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.purchases.all() });
    },
  });
}

export function useUpdatePurchaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchase: Purchase) => updatePurchase(purchase),
    onSuccess: (_data, purchase) => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.purchases.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.purchases.detail(purchase.id) });
    },
  });
}

export function useDeletePurchaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseId: number) => deletePurchase(purchaseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.purchases.all() });
    },
  });
}

export function useUpdatePurchaseStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseId, status }: { purchaseId: number; status: PaymentStatus }) => updatePurchaseStatus(purchaseId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.purchases.all() });
    },
  });
}

