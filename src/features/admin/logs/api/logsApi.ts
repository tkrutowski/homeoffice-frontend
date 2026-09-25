import httpCommon from '@/config/http-common';
import type { Log, LogLevel, LogsRangeParams, LogsResult } from '@/features/admin/logs/types';

export interface LogEntryDto {
  timestamp: string;
  level: LogLevel;
  thread: string;
  logger: string;
  message: string;
  instance: string | null;
}

interface LogsResultDto {
  entries: LogEntryDto[];
  truncated: boolean;
}

/**
 * Backend zwraca czas lokalny (Europe/Warsaw) bez strefy, czasem z ułamkiem sekundy o zmiennej liczbie cyfr.
 * Składamy Date z komponentów (jak dosłowny czas zegarowy), obcinając ułamek do milisekund.
 */
export function parseLocalDateTime(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/.exec(value);
  if (!match) return new Date(value);
  const [, year, month, day, hour, minute, second, fraction = ''] = match;
  const ms = Number(fraction.padEnd(3, '0').slice(0, 3));
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), ms);
}

let nextLogId = 1;

export function normalizeLogEntry(dto: LogEntryDto): Log {
  return { ...dto, id: nextLogId++, timestamp: parseLocalDateTime(dto.timestamp) };
}

/** Wyniki `list` mają `levels`/`instance` pominięte, gdy puste (backend nie akceptuje pustego stringa). */
export function buildLevelsParam(levels: LogLevel[]): { levels?: string } {
  return levels.length > 0 ? { levels: levels.join(',') } : {};
}

export async function fetchLogsByDate({ from, to, levels, limit, instance }: LogsRangeParams): Promise<LogsResult> {
  const response = await httpCommon.get<LogsResultDto>('/v1/logs/date', {
    params: { from, to, limit, ...buildLevelsParam(levels), ...(instance ? { instance } : {}) },
  });
  return {
    // backend zwraca rosnąco; w historii pokazujemy od najnowszych
    logs: response.data.entries.map(normalizeLogEntry).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    truncated: response.data.truncated,
  };
}
