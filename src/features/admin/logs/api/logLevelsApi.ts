import type { AxiosError } from 'axios';
import httpCommon from '@/config/http-common';
import { parseLocalDateTime } from '@/features/admin/logs/api/logsApi';
import type { LogLevel, LogLevelOverride, LogLevelsInfo, SetLogLevelRequest } from '@/features/admin/logs/types';

interface LogLevelOverrideDto {
  logger: string;
  level: LogLevel;
  previousLevel: LogLevel | null;
  setAt: string;
  revertsAt: string;
  changedBy: string;
}

interface LogLevelsInfoDto extends Omit<LogLevelsInfo, 'overrides'> {
  overrides: LogLevelOverrideDto[];
}

function normalizeOverride(dto: LogLevelOverrideDto): LogLevelOverride {
  return { ...dto, setAt: parseLocalDateTime(dto.setAt), revertsAt: parseLocalDateTime(dto.revertsAt) };
}

export async function fetchLogLevels(): Promise<LogLevelsInfo> {
  const response = await httpCommon.get<LogLevelsInfoDto>('/v1/logs/levels');
  return { ...response.data, overrides: response.data.overrides.map(normalizeOverride) };
}

export async function setLogLevel(request: SetLogLevelRequest): Promise<LogLevelOverride> {
  const response = await httpCommon.put<LogLevelOverrideDto>('/v1/logs/levels', request);
  return normalizeOverride(response.data);
}

/** 404 = brak aktywnego nadpisania, czyli poziom już przywrócony - nie jest błędem. */
export async function resetLogLevel(logger: string): Promise<void> {
  try {
    await httpCommon.delete(`/v1/logs/levels/${encodeURIComponent(logger)}`);
  } catch (error) {
    if ((error as AxiosError).response?.status === 404) return;
    throw error;
  }
}
