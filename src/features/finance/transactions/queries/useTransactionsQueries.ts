import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  fetchTransactionCategories,
  fetchTransactionLabels,
  fetchTransactionsBetween,
} from '@/features/finance/transactions/api/transactionsApi';
import { fetchCsvImportJob } from '@/features/finance/transactions/api/csvImportApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';

export function useTransactionCategoriesQuery() {
  return useQuery({
    queryKey: financeKeys.transactions.categories(),
    queryFn: fetchTransactionCategories,
  });
}

export function useTransactionLabelsQuery() {
  return useQuery({
    queryKey: financeKeys.transactions.labels(),
    queryFn: fetchTransactionLabels,
  });
}

export function useTransactionsBetweenQuery(
  dateFrom: MaybeRefOrGetter<string>,
  dateTo: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true
) {
  return useQuery({
    queryKey: computed(() => financeKeys.transactions.between(toValue(dateFrom), toValue(dateTo))),
    queryFn: () => fetchTransactionsBetween(toValue(dateFrom), toValue(dateTo)),
    enabled: computed(() => toValue(enabled)),
  });
}

export function useCsvImportJobQuery(jobId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => financeKeys.csvImport.job(toValue(jobId) ?? '')),
    queryFn: () => fetchCsvImportJob(toValue(jobId)!),
    enabled: computed(() => !!toValue(jobId)),
    refetchInterval: query => (query.state.data?.status === 'pending' ? 3000 : false),
  });
}
