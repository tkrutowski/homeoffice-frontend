import type { LogsRangeParams } from '@/features/admin/logs/types';

export const adminKeys = {
  all: ['admin'] as const,

  logs: () => [...adminKeys.all, 'logs'] as const,
  logsRange: (params: LogsRangeParams) => [...adminKeys.logs(), 'range', params] as const,
  logLevels: () => [...adminKeys.logs(), 'levels'] as const,
  /** Bez argumentu = prefiks klucza wszystkich list loggerów (do `invalidateQueries`). */
  loggers: (prefix?: string | null) =>
    prefix === undefined
      ? ([...adminKeys.logs(), 'loggers'] as const)
      : ([...adminKeys.logs(), 'loggers', prefix] as const),
};
