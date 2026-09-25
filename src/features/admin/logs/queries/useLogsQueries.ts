import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchLogsByDate, fetchTodayLogs } from '@/features/admin/logs/api/logsApi';
import { adminKeys } from '@/features/admin/_shared/queryKeys';
import type { LogsRangeParams } from '@/features/admin/logs/types';

export function useTodayLogsQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: adminKeys.logsToday(),
    queryFn: fetchTodayLogs,
    enabled: computed(() => toValue(enabled)),
    staleTime: 0,
  });
}

/** `params === null` → zapytanie nieaktywne (użytkownik jeszcze nie kliknął „Szukaj”). */
export function useLogsRangeQuery(params: MaybeRefOrGetter<LogsRangeParams | null>) {
  return useQuery({
    queryKey: computed(() => adminKeys.logsRange(toValue(params) ?? { from: '', to: '', levels: [] })),
    queryFn: () => fetchLogsByDate(toValue(params)!),
    enabled: computed(() => toValue(params) !== null),
    staleTime: 0,
  });
}
