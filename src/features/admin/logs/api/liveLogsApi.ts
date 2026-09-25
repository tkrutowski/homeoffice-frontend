import httpCommon from '@/config/http-common';
import { buildLevelsParam, normalizeLogEntry, type LogEntryDto } from '@/features/admin/logs/api/logsApi';
import type { LiveLogsParams, LiveLogsResult } from '@/features/admin/logs/types';

interface LiveLogsResultDto {
  instance: string;
  entries: LogEntryDto[];
  cursor: number;
  gap: boolean;
  hasMore: boolean;
}

export async function fetchLiveLogs(params: LiveLogsParams, signal?: AbortSignal): Promise<LiveLogsResult> {
  const response = await httpCommon.get<LiveLogsResultDto>('/v1/logs/live', {
    signal,
    params: {
      // pierwsze zapytanie sesji idzie BEZ `after`
      ...(params.after !== null ? { after: params.after } : {}),
      ...buildLevelsParam(params.levels),
      ...(params.limit ? { limit: params.limit } : {}),
    },
  });
  const { instance, entries, cursor, gap, hasMore } = response.data;
  return { instance, logs: entries.map(normalizeLogEntry), cursor, gap, hasMore };
}
