import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  fetchFee,
  fetchFeeFrequencyTypes,
  fetchFeesByYearAndStatusAndUser,
  fetchFeesPage,
} from '@/features/finance/fees/api/feesApi';
import { financeKeys, type FeePageParams } from '@/features/finance/_shared/queryKeys';
import type { StatusType } from '@/types/StatusType';

export function useFeesPageQuery(params: MaybeRefOrGetter<FeePageParams>) {
  return useQuery({
    queryKey: computed(() => financeKeys.fees.page(toValue(params))),
    queryFn: () => fetchFeesPage(toValue(params)),
  });
}

export function useFeeQuery(feeId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => financeKeys.fees.detail(toValue(feeId))),
    queryFn: () => fetchFee(toValue(feeId)),
    enabled: computed(() => toValue(enabled) && toValue(feeId) > 0),
  });
}

export function useFeeFrequencyTypesQuery() {
  return useQuery({
    queryKey: financeKeys.fees.frequency(),
    queryFn: fetchFeeFrequencyTypes,
  });
}

export function useFeesByYearStatusUserQuery(
  year: MaybeRefOrGetter<number>,
  status: MaybeRefOrGetter<StatusType>,
  userId: MaybeRefOrGetter<number | undefined> = undefined,
  enabled: MaybeRefOrGetter<boolean> = true
) {
  return useQuery({
    queryKey: computed(() => financeKeys.fees.byYearStatusUser(toValue(year), toValue(status), toValue(userId))),
    queryFn: () => fetchFeesByYearAndStatusAndUser(toValue(year), toValue(status), toValue(userId)),
    enabled: computed(() => toValue(enabled)),
  });
}
