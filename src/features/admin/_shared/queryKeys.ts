import type { LogsRangeParams } from '@/features/admin/logs/types';

export const adminKeys = {
  all: ['admin'] as const,

  logs: () => [...adminKeys.all, 'logs'] as const,
  logsRange: (params: LogsRangeParams) => [...adminKeys.logs(), 'range', params] as const,
  logLevels: () => [...adminKeys.logs(), 'levels'] as const,
};
