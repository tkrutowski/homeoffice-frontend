import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createTransaction,
  createTransactionCategory,
  createTransactionLabel,
  deleteTransaction,
  updateTransaction,
} from '@/features/finance/transactions/api/transactionsApi';
import { startCsvImportJob } from '@/features/finance/transactions/api/csvImportApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import type {
  BankTransactionCreatePayload,
  TransactionCategoryCreatePayload,
} from '@/features/finance/transactions/types';

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BankTransactionCreatePayload) => createTransaction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions.all() });
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BankTransactionCreatePayload & { id: number }) => updateTransaction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions.all() });
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions.all() });
    },
  });
}

export function useCreateTransactionCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionCategoryCreatePayload) => createTransactionCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions.categories() });
    },
  });
}

export function useCreateTransactionLabelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTransactionLabel(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions.labels() });
    },
  });
}

export function useStartCsvImportMutation() {
  return useMutation({
    mutationFn: (file: File) => startCsvImportJob(file),
  });
}
