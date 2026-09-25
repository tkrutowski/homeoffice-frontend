import httpCommon from '@/config/http-common';
import type { Log, LogsRangeParams } from '@/features/admin/logs/types';

interface LogDto extends Omit<Log, 'timestamp'> {
  timestamp: string;
}

/** Od najnowszych. */
function normalizeLogs(dtos: LogDto[]): Log[] {
  return dtos
    .map(dto => ({ ...dto, timestamp: new Date(dto.timestamp) }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export async function fetchTodayLogs(): Promise<Log[]> {
  const response = await httpCommon.get<LogDto[]>('/v1/logs');
  return normalizeLogs(response.data);
}

export async function fetchLogsByDate({ from, to, levels }: LogsRangeParams): Promise<Log[]> {
  const response = await httpCommon.get<LogDto[]>('/v1/logs/date', {
    params: {
      from: `${from}T00:00:00`,
      to: `${to}T00:00:00`,
      // brak parametru = wszystkie poziomy; Spring bindowałby pusty string do pustego Set
      ...(levels.length > 0 ? { levels: levels.join(',') } : {}),
    },
  });
  return normalizeLogs(response.data);
}
