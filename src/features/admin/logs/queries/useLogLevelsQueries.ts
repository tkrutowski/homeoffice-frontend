import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchLoggers, fetchLogLevels } from '@/features/admin/logs/api/logLevelsApi';
import { adminKeys } from '@/features/admin/_shared/queryKeys';

export function useLogLevelsQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: adminKeys.logLevels(),
    queryFn: fetchLogLevels,
    enabled: computed(() => toValue(enabled)),
    staleTime: 0,
  });
}

/** Lista istniejących loggerów (do wyboru w formularzu). Włączaj tylko dla admina i aktywnej zakładki. */
export function useLoggersQuery(enabled: MaybeRefOrGetter<boolean> = true, prefix?: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => adminKeys.loggers(toValue(prefix) ?? null)),
    queryFn: () => fetchLoggers(toValue(prefix)),
    enabled: computed(() => toValue(enabled)),
    staleTime: 30_000,
  });
}
