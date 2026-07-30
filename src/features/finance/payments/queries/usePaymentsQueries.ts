import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaymentStatus } from '@/features/finance/payments/types';
import type { PaymentsByStatusYearResult } from '@/features/finance/payments/api/paymentsApi';
import { fetchPaymentsByStatusYear } from '@/features/finance/payments/api/paymentsApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';

export function usePaymentsByStatusYearQuery(params: MaybeRefOrGetter<{ status: PaymentStatus; year: number }>) {
  return useQuery({
    queryKey: computed(() => financeKeys.payments.byStatusYear(toValue(params).status, toValue(params).year)),
    queryFn: async () => {
      return fetchPaymentsByStatusYear(toValue(params).status, toValue(params).year) as unknown as PaymentsByStatusYearResult;
    },
  });
}

