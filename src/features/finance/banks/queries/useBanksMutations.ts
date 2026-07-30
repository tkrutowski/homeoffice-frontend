import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createBank, deleteBank, updateBank } from '@/features/finance/banks/api/banksApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import type { Bank } from '@/features/finance/banks/types';

export function useCreateBankMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bank: Bank) => createBank(bank),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.banks.all() });
    },
  });
}

export function useUpdateBankMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bank: Bank) => updateBank(bank),
    onSuccess: bank => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.banks.all() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.banks.detail(bank.id) });
    },
  });
}

export function useDeleteBankMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bankId: number) => deleteBank(bankId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.banks.all() });
    },
  });
}
