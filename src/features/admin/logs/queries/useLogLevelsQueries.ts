import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchLogLevels } from '@/features/admin/logs/api/logLevelsApi';
import { adminKeys } from '@/features/admin/_shared/queryKeys';

export function useLogLevelsQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: adminKeys.logLevels(),
    queryFn: fetchLogLevels,
    enabled: computed(() => toValue(enabled)),
    staleTime: 0,
  });
}
