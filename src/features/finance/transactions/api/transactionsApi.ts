import httpCommon from '@/config/http-common';
import moment from 'moment';
import type {
  BankTransaction,
  BankTransactionCreatePayload,
  TransactionCategoryCreatePayload,
  TransactionCategoryDto,
  TransactionLabelDto,
} from '@/features/finance/transactions/types';
import type {
  BalanceQueryParams,
  BalanceSeriesPoint,
  BalanceSeriesQueryParams,
} from '@/features/finance/transactions/dashboardTypes';
import { enrichTransactions, sortCategories } from '@/features/finance/transactions/transactionEnrichment';
import { queryClient } from '@/config/queryClient';
import { financeKeys } from '@/features/finance/_shared/queryKeys';

function toPayloadPayload(payload: BankTransactionCreatePayload) {
  return {
    ...payload,
    transactionDate: moment(payload.transactionDate).format('YYYY-MM-DD'),
    transactionCategory: {
      id: payload.transactionCategory.id,
      name: payload.transactionCategory.name,
      type: payload.transactionCategory.type,
    },
    transactionLabel: payload.transactionLabel.map(l => ({ id: l.id, name: l.name })),
  };
}

async function ensureCategoriesAndLabels(): Promise<{
  categories: TransactionCategoryDto[];
  labels: TransactionLabelDto[];
}> {
  const [categories, labels] = await Promise.all([
    queryClient.ensureQueryData({
      queryKey: financeKeys.transactions.categories(),
      queryFn: fetchTransactionCategories,
    }),
    queryClient.ensureQueryData({
      queryKey: financeKeys.transactions.labels(),
      queryFn: fetchTransactionLabels,
    }),
  ]);
  return { categories, labels };
}

export async function fetchTransactionCategories(): Promise<TransactionCategoryDto[]> {
  const response = await httpCommon.get('/v1/finance/transaction-category');
  return sortCategories(response.data ?? []);
}

export async function createTransactionCategory(
  payload: TransactionCategoryCreatePayload
): Promise<TransactionCategoryDto> {
  const response = await httpCommon.post('/v1/finance/transaction-category', {
    ...payload,
    color: payload.color.toUpperCase(),
  });
  return response.data;
}

export async function fetchTransactionLabels(): Promise<TransactionLabelDto[]> {
  const response = await httpCommon.get('/v1/finance/transaction-label');
  return response.data ?? [];
}

export async function createTransactionLabel(name: string): Promise<TransactionLabelDto> {
  const response = await httpCommon.post('/v1/finance/transaction-label', { name });
  return response.data;
}

export async function fetchTransactionsBetween(dateFrom: string, dateTo: string): Promise<BankTransaction[]> {
  const response = await httpCommon.get('/v1/finance/bank-transaction/between', {
    params: { dateFrom, dateTo },
  });
  const { categories, labels } = await ensureCategoriesAndLabels();
  return enrichTransactions(response.data ?? [], categories, labels);
}

export async function createTransaction(payload: BankTransactionCreatePayload): Promise<BankTransaction> {
  const response = await httpCommon.post('/v1/finance/bank-transaction', toPayloadPayload(payload));
  const { categories, labels } = await ensureCategoriesAndLabels();
  return enrichTransactions([response.data], categories, labels)[0];
}

export async function updateTransaction(
  payload: BankTransactionCreatePayload & { id: number }
): Promise<BankTransaction> {
  const response = await httpCommon.put('/v1/finance/bank-transaction', toPayloadPayload(payload));
  const { categories, labels } = await ensureCategoriesAndLabels();
  return enrichTransactions([response.data], categories, labels)[0];
}

export async function deleteTransaction(id: number): Promise<void> {
  await httpCommon.delete(`/v1/finance/bank-transaction/${id}`);
}

/** Stub – podmienić URL gdy backend będzie gotowy. */
export async function fetchCurrentBalance(_params: BalanceQueryParams): Promise<number | null> {
  return null;
}

/** Stub – podmienić URL gdy backend będzie gotowy. */
export async function fetchBalanceSeries(_params: BalanceSeriesQueryParams): Promise<BalanceSeriesPoint[]> {
  return [];
}
