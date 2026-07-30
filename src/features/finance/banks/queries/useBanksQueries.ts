import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchBank, fetchBanks } from '@/features/finance/banks/api/banksApi';
import { financeKeys } from '@/features/finance/_shared/queryKeys';

export function useBanksListQuery() {
  return useQuery({
    queryKey: financeKeys.banks.list(),
    queryFn: fetchBanks,
  });
}

export function useBankQuery(bankId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => financeKeys.banks.detail(toValue(bankId))),
    queryFn: () => fetchBank(toValue(bankId)),
    enabled: computed(() => toValue(enabled) && toValue(bankId) > 0),
  });
}
