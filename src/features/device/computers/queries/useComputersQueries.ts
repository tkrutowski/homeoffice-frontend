import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchComputer, fetchComputers } from '@/features/device/computers/api/computersApi';
import { deviceKeys } from '@/features/device/_shared/queryKeys';

export function useComputersListQuery() {
  return useQuery({
    queryKey: deviceKeys.computers.list(),
    queryFn: fetchComputers,
  });
}

export function useComputerQuery(computerId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => deviceKeys.computers.detail(toValue(computerId))),
    queryFn: () => fetchComputer(toValue(computerId)),
    enabled: computed(() => toValue(enabled) && toValue(computerId) > 0),
  });
}
