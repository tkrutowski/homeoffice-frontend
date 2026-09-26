import { useMutation, useQueryClient, type QueryClient } from '@tanstack/vue-query';
import { resetLogLevel, setLogLevel } from '@/features/admin/logs/api/logLevelsApi';
import { adminKeys } from '@/features/admin/_shared/queryKeys';
import type { SetLogLevelRequest } from '@/features/admin/logs/types';

/** Zmiana poziomu odświeża tabelę nadpisań oraz `configuredLevel` na liście loggerów. */
function invalidateLogLevelData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: adminKeys.logLevels() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.loggers() }),
  ]);
}

export function useSetLogLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SetLogLevelRequest) => setLogLevel(request),
    onSuccess: () => invalidateLogLevelData(queryClient),
  });
}

export function useResetLogLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logger: string) => resetLogLevel(logger),
    onSuccess: () => invalidateLogLevelData(queryClient),
  });
}
