import type { LogsRangeParams } from '@/features/admin/logs/types';

export const adminKeys = {
  all: ['admin'] as const,

  logs: () => [...adminKeys.all, 'logs'] as const,
  logsToday: () => [...adminKeys.logs(), 'today'] as const,
  logsRange: (params: LogsRangeParams) => [...adminKeys.logs(), 'range', params] as const,
};
