import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { resetLogLevel, setLogLevel } from '@/features/admin/logs/api/logLevelsApi';
import { adminKeys } from '@/features/admin/_shared/queryKeys';
import type { SetLogLevelRequest } from '@/features/admin/logs/types';

export function useSetLogLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SetLogLevelRequest) => setLogLevel(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.logLevels() }),
  });
}

export function useResetLogLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logger: string) => resetLogLevel(logger),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.logLevels() }),
  });
}
