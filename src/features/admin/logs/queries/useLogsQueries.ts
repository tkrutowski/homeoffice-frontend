import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchLogsByDate } from '@/features/admin/logs/api/logsApi';
import { adminKeys } from '@/features/admin/_shared/queryKeys';
import type { LogsRangeParams } from '@/features/admin/logs/types';

/** `params === null` → zapytanie nieaktywne. Zawsze świeże dane (`staleTime: 0`) - to logi, nie słownik. */
export function useLogsRangeQuery(params: MaybeRefOrGetter<LogsRangeParams | null>) {
  return useQuery({
    queryKey: computed(() => {
      const value = toValue(params);
      return adminKeys.logsRange(value ?? { from: '', to: '', levels: [], limit: 0, instance: null });
    }),
    queryFn: () => fetchLogsByDate(toValue(params)!),
    enabled: computed(() => toValue(params) !== null),
    staleTime: 0,
  });
}
