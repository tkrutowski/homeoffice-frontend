import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PurchasePageParams } from '@/features/finance/_shared/queryKeys';
import { financeKeys } from '@/features/finance/_shared/queryKeys';
import {
  fetchPurchase,
  fetchPurchasesByYearAndUser,
  fetchPurchasesCurrent,
  fetchPurchasesPage,
  fetchPurchasesSumToPay,
} from '@/features/finance/purchases/api/purchasesApi';

export function usePurchasesPageQuery(params: MaybeRefOrGetter<PurchasePageParams>) {
  return useQuery({
    queryKey: computed(() => financeKeys.purchases.page(toValue(params))),
    queryFn: () => fetchPurchasesPage(toValue(params)),
  });
}

export function usePurchaseQuery(purchaseId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => financeKeys.purchases.detail(toValue(purchaseId))),
    queryFn: () => fetchPurchase(toValue(purchaseId)),
    enabled: computed(() => toValue(enabled) && toValue(purchaseId) > 0),
  });
}

export function usePurchasesCurrentQuery(username: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => financeKeys.purchases.current(toValue(username))),
    queryFn: () => fetchPurchasesCurrent(toValue(username) as string),
    enabled: computed(() => Boolean(toValue(username))),
  });
}

export function usePurchasesSumToPayQuery() {
  return useQuery({
    queryKey: financeKeys.purchases.sumToPay(),
    queryFn: fetchPurchasesSumToPay,
  });
}

export function usePurchasesByYearAndUserQuery(
  year: MaybeRefOrGetter<number>,
  username: MaybeRefOrGetter<string | undefined> = undefined,
  enabled: MaybeRefOrGetter<boolean> = true
) {
  return useQuery({
    queryKey: computed(() => financeKeys.purchases.byYearUser(toValue(year), toValue(username))),
    queryFn: () => fetchPurchasesByYearAndUser(toValue(year), toValue(username)),
    enabled: computed(() => toValue(enabled)),
  });
}
